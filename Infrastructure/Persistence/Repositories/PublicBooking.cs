using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class PublicBooking : IPublicBooking
{
    private readonly QueueDbContext _db;
    private readonly IOperations _operations;
    private readonly DateTimeService _dateTime;
    private readonly byte[] _managementKey;

    public PublicBooking(
        QueueDbContext db,
        IOperations operations,
        DateTimeService dateTime,
        IConfiguration configuration)
    {
        _db = db;
        _operations = operations;
        _dateTime = dateTime;
        string key = configuration["PublicBooking:ManagementKey"]
            ?? configuration["Jwt:SignKey"]
            ?? throw new InvalidOperationException("A public booking management key is required.");
        _managementKey = Encoding.UTF8.GetBytes(key);
    }

    public async Task<PublicBookingPageResponse> GetPageAsync(
        string shopSlug,
        Guid branchPublicId,
        int? serviceId,
        DateTime? date,
        CancellationToken ct)
    {
        ShopBranch branch = await FindBranchAsync(shopSlug, branchPublicId, ct);
        List<ShopServiceResponse> catalog = await _operations.GetCatalogAsync(branch.Id, ct);
        List<StaffResponse> staff = serviceId.HasValue
            ? await _operations.GetEligibleStaffAsync(branch.Id, serviceId.Value, ct)
            : new();
        List<AvailableSlotResponse> slots = serviceId.HasValue
            ? await _operations.GetSlotsAsync(branch.Id, date, serviceId, ct)
            : new();

        string? logo = branch.Shop.ShopSettings
            .Where(setting => setting.BranchId == null || setting.BranchId == branch.Id)
            .OrderByDescending(setting => setting.BranchId == branch.Id)
            .FirstOrDefault(setting => setting.Key == "Logo")?.Value;
        string logoPosition = GetSetting(branch, "LogoPosition") ?? "50% 50%";
        string? cover = branch.Shop.ShopSettings
            .Where(setting => setting.BranchId == null || setting.BranchId == branch.Id)
            .OrderByDescending(setting => setting.BranchId == branch.Id)
            .FirstOrDefault(setting => setting.Key == "Cover")?.Value;
        string coverPosition = GetSetting(branch, "CoverPosition") ?? "50% 50%";
        string? description = GetSetting(branch, "Description");
        string? email = GetSetting(branch, "Email");

        return new PublicBookingPageResponse
        {
            ShopSlug = branch.Shop.PublicSlug,
            ShopName = branch.Shop.Name,
            LogoUrl = logo,
            LogoPosition = logoPosition,
            CoverUrl = cover,
            CoverPosition = coverPosition,
            ShopDescription = description,
            ShopEmail = email,
            ShopTypeNameTh = branch.Shop.Type?.NameTh,
            ShopTypeNameEn = branch.Shop.Type?.NameEn,
            BranchPublicId = branch.PublicBookingId,
            BranchName = branch.Name,
            BranchPhone = branch.Phone,
            BranchAddress = FormatAddress(branch.Address),
            IsOnlineBookingEnabled = branch.IsOnlineBookingEnabled,
            Services = catalog.Select(service => new PublicBookingServiceResponse
            {
                Id = service.Id,
                Name = service.Name,
                Duration = service.Duration,
                Price = service.Price,
                StaffSelectionMode = service.StaffSelectionMode
            }).ToList(),
            Staff = staff.Select(item => new PublicBookingStaffResponse
            {
                Id = item.Id,
                Name = item.Name,
                ProfilePictureUrl = item.ProfilePictureUrl
            }).ToList(),
            Slots = slots,
            BusinessHours = branch.ShopBusinessHours
                .OrderBy(hour => hour.DayOfWeek)
                .Select(hour => new PublicBusinessHourResponse
                {
                    DayOfWeek = hour.DayOfWeek,
                    OpenTime = hour.OpenTime.ToString("HH:mm"),
                    CloseTime = hour.CloseTime.ToString("HH:mm"),
                    IsActive = hour.IsActive
                }).ToList()
        };
    }

    public async Task<PublicBookingConfirmationResponse> CreateAsync(
        string shopSlug,
        Guid branchPublicId,
        CreatePublicBookingRequest request,
        CancellationToken ct)
    {
        ShopBranch branch = await FindBranchAsync(shopSlug, branchPublicId, ct);
        BookingResponse booking = await _operations.CreateBookingAsync(null, new CreateBookingRequest
        {
            BranchId = branch.Id,
            ServiceId = request.ServiceId,
            QueueSlotId = request.QueueSlotId,
            StaffId = request.StaffId,
            GuestName = request.GuestName,
            GuestPhone = request.GuestPhone,
            GuestEmail = request.GuestEmail,
            Remark = request.Remark
        }, ct);
        return new PublicBookingConfirmationResponse
        {
            Guid = booking.Guid,
            ShopName = branch.Shop.Name,
            LogoUrl = GetSetting(branch, "Logo"),
            ShopTypeNameTh = branch.Shop.Type?.NameTh,
            ShopTypeNameEn = branch.Shop.Type?.NameEn,
            ShopEmail = GetSetting(branch, "Email"),
            BranchName = branch.Name,
            BranchPhone = branch.Phone,
            BranchAddress = FormatAddress(branch.Address),
            ServiceName = booking.ServiceName,
            Date = booking.Date,
            StartTime = booking.StartTime,
            CustomerName = booking.CustomerName,
            StaffName = booking.StaffName,
            Status = booking.Status,
            CanCancel = booking.Status == "WAITING",
            ManagementToken = CreateManagementToken(booking.Guid)
        };
    }

    public async Task<PublicBookingManagementResponse> GetManagementAsync(
        Guid bookingGuid,
        string token,
        CancellationToken ct)
    {
        ValidateManagementToken(bookingGuid, token);
        Booking booking = await ManagementQuery()
            .SingleOrDefaultAsync(item => item.Guid == bookingGuid, ct)
            ?? throw new KeyNotFoundException("Booking not found.");
        return ToManagementResponse(booking);
    }

    public async Task<PublicBookingManagementResponse> CancelAsync(
        Guid bookingGuid,
        string token,
        CancellationToken ct)
    {
        ValidateManagementToken(bookingGuid, token);
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        Booking booking = await ManagementQuery()
            .SingleOrDefaultAsync(item => item.Guid == bookingGuid, ct)
            ?? throw new KeyNotFoundException("Booking not found.");
        if (booking.Status.Code != "WAITING")
            throw new InvalidOperationException("This booking can no longer be cancelled by the customer.");
        DateTime localNow = _dateTime.LocalNow();
        if (booking.QueueSlot.Date.Date < localNow.Date
            || (booking.QueueSlot.Date.Date == localNow.Date
                && booking.QueueSlot.StartTime <= TimeOnly.FromDateTime(localNow)))
            throw new InvalidOperationException("This booking has already started.");

        MasterStatus cancelled = await _db.MasterStatuses
            .SingleAsync(status => status.Type == "BOOKING_STATUS" && status.Code == "CANCELLED", ct);
        booking.StatusId = cancelled.Id;
        booking.Status = cancelled;
        booking.UpdatedAt = localNow;
        if (booking.QueueSlot.CurrentUsage > 0)
            booking.QueueSlot.CurrentUsage--;
        await NotifyShopAsync(
            booking.Branch.ShopId,
            booking.BranchId,
            "ลูกค้ายกเลิกการจอง",
            $"{booking.GuestName ?? booking.User?.Name ?? "ลูกค้า"} ยกเลิก {booking.BookingServices.First().Service.Name} วันที่ {booking.QueueSlot.Date:dd/MM/yyyy} เวลา {booking.QueueSlot.StartTime:HH\\:mm}",
            localNow,
            ct);
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return ToManagementResponse(booking);
    }

    private async Task<ShopBranch> FindBranchAsync(
        string shopSlug,
        Guid branchPublicId,
        CancellationToken ct) =>
        await _db.ShopBranches.AsNoTracking()
            .Include(branch => branch.Shop)
                .ThenInclude(shop => shop.ShopSettings)
            .Include(branch => branch.Shop)
                .ThenInclude(shop => shop.Type)
            .Include(branch => branch.ShopBusinessHours)
            .Include(branch => branch.Address)
                .ThenInclude(address => address.Subdistrict)
            .Include(branch => branch.Address)
                .ThenInclude(address => address.District)
            .Include(branch => branch.Address)
                .ThenInclude(address => address.Province)
            .SingleOrDefaultAsync(branch =>
                branch.PublicBookingId == branchPublicId
                && branch.Shop.PublicSlug == shopSlug
                && branch.IsActive
                && branch.Shop.IsActive
                && branch.IsOnlineBookingEnabled, ct)
        ?? throw new KeyNotFoundException("Booking page not found or online booking is disabled.");

    private static string? GetSetting(ShopBranch branch, string key) =>
        branch.Shop.ShopSettings
            .Where(setting => setting.BranchId == null || setting.BranchId == branch.Id)
            .OrderByDescending(setting => setting.BranchId == branch.Id)
            .FirstOrDefault(setting => setting.Key == key)?.Value;

    private static string FormatAddress(Address address) =>
        string.Join(" ", new[]
        {
            address.HouseNo,
            address.Street,
            address.Subdistrict?.NameTh,
            address.District?.NameTh,
            address.Province?.NameTh,
            address.Zipcode
        }.Where(value => !string.IsNullOrWhiteSpace(value)));

    private IQueryable<Booking> ManagementQuery() =>
        _db.Bookings
            .Include(booking => booking.Branch)
                .ThenInclude(branch => branch.Shop)
                    .ThenInclude(shop => shop.ShopSettings)
            .Include(booking => booking.Branch)
                .ThenInclude(branch => branch.Shop)
                    .ThenInclude(shop => shop.Type)
            .Include(booking => booking.Branch)
                .ThenInclude(branch => branch.Address)
                    .ThenInclude(address => address.Subdistrict)
            .Include(booking => booking.Branch)
                .ThenInclude(branch => branch.Address)
                    .ThenInclude(address => address.District)
            .Include(booking => booking.Branch)
                .ThenInclude(branch => branch.Address)
                    .ThenInclude(address => address.Province)
            .Include(booking => booking.QueueSlot)
            .Include(booking => booking.Status)
            .Include(booking => booking.User)
            .Include(booking => booking.AssignedStaff)
                .ThenInclude(staff => staff!.User)
            .Include(booking => booking.BookingServices)
                .ThenInclude(map => map.Service);

    private PublicBookingManagementResponse ToManagementResponse(Booking booking)
    {
        DateTime localNow = _dateTime.LocalNow();
        bool isFuture = booking.QueueSlot.Date.Date > localNow.Date
            || (booking.QueueSlot.Date.Date == localNow.Date
                && booking.QueueSlot.StartTime > TimeOnly.FromDateTime(localNow));
        return new PublicBookingManagementResponse
        {
            Guid = booking.Guid,
            ShopSlug = booking.Branch.Shop.PublicSlug,
            BranchPublicId = booking.Branch.PublicBookingId,
            ShopName = booking.Branch.Shop.Name,
            LogoUrl = booking.Branch.Shop.ShopSettings
                .Where(setting => setting.BranchId == null || setting.BranchId == booking.BranchId)
                .OrderByDescending(setting => setting.BranchId == booking.BranchId)
                .FirstOrDefault(setting => setting.Key == "Logo")?.Value,
            ShopTypeNameTh = booking.Branch.Shop.Type?.NameTh,
            ShopTypeNameEn = booking.Branch.Shop.Type?.NameEn,
            ShopEmail = booking.Branch.Shop.ShopSettings
                .Where(setting => setting.BranchId == null || setting.BranchId == booking.BranchId)
                .OrderByDescending(setting => setting.BranchId == booking.BranchId)
                .FirstOrDefault(setting => setting.Key == "Email")?.Value,
            BranchName = booking.Branch.Name,
            BranchPhone = booking.Branch.Phone,
            BranchAddress = FormatAddress(booking.Branch.Address),
            ServiceName = booking.BookingServices.First().Service.Name,
            Date = booking.QueueSlot.Date,
            StartTime = booking.QueueSlot.StartTime.ToString("HH:mm"),
            CustomerName = booking.User?.Name ?? booking.GuestName ?? "Customer",
            StaffName = booking.AssignedStaff == null
                ? null
                : string.IsNullOrWhiteSpace(booking.AssignedStaff.Name)
                    ? booking.AssignedStaff.User?.Name
                    : booking.AssignedStaff.Name,
            Status = booking.Status.Code,
            CanCancel = booking.Status.Code == "WAITING" && isFuture
        };
    }

    private string CreateManagementToken(Guid bookingGuid)
    {
        long expiresAt = DateTimeOffset.UtcNow.AddDays(370).ToUnixTimeSeconds();
        string payload = $"{bookingGuid:N}.{expiresAt}";
        byte[] signature = HMACSHA256.HashData(_managementKey, Encoding.UTF8.GetBytes(payload));
        return $"{expiresAt}.{Base64UrlEncode(signature)}";
    }

    private void ValidateManagementToken(Guid bookingGuid, string token)
    {
        string[] parts = token.Split('.', 2);
        if (parts.Length != 2
            || !long.TryParse(parts[0], out long expiresAt)
            || DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expiresAt)
            throw new InvalidOperationException("The booking management link is invalid or has expired.");
        string payload = $"{bookingGuid:N}.{expiresAt}";
        byte[] expected = HMACSHA256.HashData(_managementKey, Encoding.UTF8.GetBytes(payload));
        byte[] supplied;
        try { supplied = Base64UrlDecode(parts[1]); }
        catch (FormatException)
        {
            throw new InvalidOperationException("The booking management link is invalid or has expired.");
        }
        if (!CryptographicOperations.FixedTimeEquals(expected, supplied))
            throw new InvalidOperationException("The booking management link is invalid or has expired.");
    }

    private async Task NotifyShopAsync(
        int shopId,
        int branchId,
        string title,
        string message,
        DateTime localNow,
        CancellationToken ct)
    {
        int unreadStatusId = await _db.MasterStatuses.AsNoTracking()
            .Where(status => status.Type == "NOTIFICATION_STATUS" && status.Code == "UNREAD")
            .Select(status => status.Id)
            .SingleAsync(ct);
        List<int> shopUsers = await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.ShopId == shopId && map.IsActive)
            .Select(map => map.UserId)
            .ToListAsync(ct);
        int ownerId = await _db.Shops.AsNoTracking()
            .Where(shop => shop.Id == shopId)
            .Select(shop => shop.OwnerId)
            .SingleAsync(ct);
        List<int> branchUsers = await _db.BranchUserRoleMaps.AsNoTracking()
            .Where(map => map.BranchId == branchId && map.IsActive)
            .Select(map => map.UserId)
            .ToListAsync(ct);
        List<int> staffUsers = await _db.ShopStaffs.AsNoTracking()
            .Where(staff => staff.BranchId == branchId
                && staff.IsActive
                && staff.CanLogin
                && staff.UserId.HasValue)
            .Select(staff => staff.UserId!.Value)
            .ToListAsync(ct);
        foreach (int userId in shopUsers.Append(ownerId).Concat(branchUsers).Concat(staffUsers).Distinct())
        {
            _db.Notifications.Add(new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userId,
                Type = "BOOKING_CANCELLED",
                Title = title,
                Message = message,
                StatusId = unreadStatusId,
                CreatedAt = localNow
            });
        }
    }

    private static string Base64UrlEncode(byte[] value) =>
        Convert.ToBase64String(value).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string value)
    {
        string padded = value.Replace('-', '+').Replace('_', '/');
        padded += new string('=', (4 - padded.Length % 4) % 4);
        return Convert.FromBase64String(padded);
    }
}
