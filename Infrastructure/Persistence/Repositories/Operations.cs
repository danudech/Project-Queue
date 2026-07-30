using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Data;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Identity.Security;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Operations : IOperations
{
    private static readonly HashSet<string> BookingStatuses = new(StringComparer.OrdinalIgnoreCase)
        { "WAITING", "CONFIRMED", "CHECKED_IN", "DONE", "CANCELLED", "NO_SHOW" };
    private static readonly HashSet<string> QueueStatuses = new(StringComparer.OrdinalIgnoreCase)
        { "WAITING", "SERVING", "DONE", "CANCELLED", "SKIPPED" };

    private readonly QueueDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IHostEnvironment _env;
    private readonly PermissionScopeService _permissions;
    private readonly AccountShopGuard _accountShopGuard;
    private readonly DateTimeService _dateTime;

    public Operations(
        QueueDbContext db,
        IEmailService emailService,
        IHostEnvironment env,
        PermissionScopeService permissions,
        AccountShopGuard accountShopGuard,
        DateTimeService dateTime)
    {
        _db = db;
        _emailService = emailService;
        _env = env;
        _permissions = permissions;
        _accountShopGuard = accountShopGuard;
        _dateTime = dateTime;
    }

    public async Task<List<StaffResponse>> GetStaffAsync(int userId, int branchId, int? serviceId, CancellationToken ct)
    {
        await EnsureBranchPermissionAsync(userId, branchId, "staff.view", ct);
        var query = _db.ShopStaffs.AsNoTracking()
            .Include(s => s.User)
                .ThenInclude(u => u!.UserAuthentications)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserImages)
            .Include(s => s.ServiceStaffMaps)
            .Where(s => s.BranchId == branchId);

        if (serviceId.HasValue)
            query = query.Where(s => s.ServiceStaffMaps.Any(m => m.ServiceId == serviceId.Value)
                && s.IsActive && s.IsAvailable && s.CanServeQueues);

        var staff = await query.OrderByDescending(s => s.IsActive).ThenBy(s => s.Name).ToListAsync(ct);
        return staff.Select(ToStaffResponse).ToList();
    }

    public async Task<List<StaffResponse>> GetEligibleStaffAsync(int branchId, int serviceId, CancellationToken ct)
    {
        var staff = await _db.ShopStaffs.AsNoTracking().Include(s => s.User).Include(s => s.ServiceStaffMaps)
            .Where(s => s.BranchId == branchId && s.IsActive && s.IsAvailable && s.CanServeQueues
                && s.ServiceStaffMaps.Any(m => m.ServiceId == serviceId))
            .OrderBy(s => s.Name).ToListAsync(ct);
        return staff.Select(ToStaffResponse).ToList();
    }

    public async Task<List<ShopServiceResponse>> GetCatalogAsync(int branchId, CancellationToken ct) =>
        await _db.Services.AsNoTracking().Where(s => s.BranchId == branchId && s.IsActive
                && s.ServiceStaffMaps.Any(m => m.Staff.IsActive && m.Staff.CanServeQueues))
            .Include(s => s.ServiceCategoryMaps).Include(s => s.ServiceStaffMaps)
            .OrderBy(s => s.Name).Select(s => new ShopServiceResponse
            {
                Id = s.Id, Name = s.Name, ShopId = s.ShopId, BranchId = s.BranchId,
                ShopName = s.Shop.Name ?? string.Empty, Duration = s.Duration, Price = s.Price,
                CategoryId = s.ServiceCategoryMaps.Select(m => m.CategoryId).FirstOrDefault(),
                IsActive = s.IsActive, StaffSelectionMode = s.StaffSelectionMode,
                StaffIds = s.ServiceStaffMaps.Select(m => m.StaffId).ToList(), CreatedAt = s.CreatedAt
            }).ToListAsync(ct);

    public async Task<StaffResponse> SaveStaffAsync(int userId, StaffUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new InvalidOperationException("Staff name is required.");
        if (request.Name.Trim().Length > 150) throw new InvalidOperationException("Staff name must not exceed 150 characters.");
        if (request.Email?.Trim().Length > 255) throw new InvalidOperationException("Email must not exceed 255 characters.");
        if (request.Phone?.Trim().Length > 20) throw new InvalidOperationException("Phone must not exceed 20 characters.");

        var branch = await EnsureBranchPermissionAsync(userId, request.BranchId, "staff.edit", ct);
        if (branch.ShopId != request.ShopId) throw new InvalidOperationException("Branch does not belong to this shop.");

        string trimmedName = request.Name.Trim();
        int staffIdToExamine = request.Id ?? 0;

        if (await _db.ShopStaffs.AnyAsync(s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.Name.ToLower() == trimmedName.ToLower(), ct))
            throw new InvalidOperationException("A staff member with this name already exists in this branch.");

        if (!string.IsNullOrWhiteSpace(request.Email) && await _db.ShopStaffs.AnyAsync(s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.Email != null && s.Email.ToLower() == request.Email.Trim().ToLower(), ct))
            throw new InvalidOperationException("This email is already assigned to another staff member in this branch.");

        User? linkedUser = null;
        ShopRole? systemRole = null;
        if (request.CanLogin)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new InvalidOperationException("An email is required when system access is enabled.");

            string roleCode = string.IsNullOrWhiteSpace(request.SystemRoleCode)
                ? "Staff"
                : request.SystemRoleCode.Trim();
            string customPrefix = $"Custom_{request.ShopId}_";
            systemRole = await _db.ShopRoles.FirstOrDefaultAsync(role =>
                role.Code == roleCode
                && role.IsActive
                && (role.IsSystem || role.Code.StartsWith(customPrefix)), ct)
                ?? throw new InvalidOperationException("The selected system role is invalid or inactive.");

            string email = request.Email.Trim();
            linkedUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive && u.EmailConfirmed, ct);
            if (linkedUser != null)
                await _accountShopGuard.EnsureCanJoinAsync(linkedUser.Id, branch.ShopId, ct);
            else
                await _accountShopGuard.EnsureEmailCanJoinAsync(email, branch.ShopId, ct);

            if (linkedUser != null && await _db.ShopStaffs.AnyAsync(
                    s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.UserId == linkedUser.Id,
                    ct))
            {
                throw new InvalidOperationException("This account is already linked to another staff member in this branch.");
            }
        }

        ShopStaff staff;
        if (request.Id.HasValue)
        {
            staff = await _db.ShopStaffs.Include(s => s.ServiceStaffMaps)
                .FirstOrDefaultAsync(s => s.Id == request.Id.Value && s.ShopId == branch.ShopId, ct)
                ?? throw new KeyNotFoundException("Staff member not found.");
        }
        else
        {
            staff = new ShopStaff { ShopId = branch.ShopId, BranchId = branch.Id, CreatedAt = DateTime.Now, CreatedBy = userId };
            _db.ShopStaffs.Add(staff);
        }

        int? previousUserId = staff.UserId;
        staff.UserId = linkedUser?.Id;
        staff.Name = trimmedName;
        staff.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        staff.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        staff.Role = string.IsNullOrWhiteSpace(request.Role) ? "STAFF" : request.Role.Trim().ToUpperInvariant();
        staff.SystemRoleCode = request.CanLogin
            ? systemRole!.Code
            : staff.SystemRoleCode;
        staff.CanServeQueues = request.CanServeQueues;
        staff.CanLogin = request.CanLogin;
        staff.IsAvailable = request.IsAvailable;
        staff.IsActive = request.IsActive;
        staff.UpdatedAt = DateTime.Now;
        staff.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        if (previousUserId.HasValue && previousUserId != staff.UserId)
            await RemoveStaffRoleMapsAsync(staff.ShopId, staff.BranchId, previousUserId.Value, ct);
        if (staff.UserId.HasValue && systemRole != null)
        {
            await _accountShopGuard.BindAsync(staff.UserId.Value, staff.ShopId, ct);
            await SyncStaffRoleMapsAsync(staff, systemRole, userId, ct);
        }
        await _db.SaveChangesAsync(ct);

        var requestedServiceIds = request.CanServeQueues ? request.ServiceIds.Distinct().ToHashSet() : new HashSet<int>();
        var validServiceIds = await _db.Services
            .Where(s => requestedServiceIds.Contains(s.Id) && s.ShopId == branch.ShopId && s.BranchId == branch.Id)
            .Select(s => s.Id).ToListAsync(ct);
        var existing = await _db.ServiceStaffMaps.Where(m => m.StaffId == staff.Id).ToListAsync(ct);
        _db.ServiceStaffMaps.RemoveRange(existing.Where(m => !validServiceIds.Contains(m.ServiceId)));
        var existingIds = existing.Select(m => m.ServiceId).ToHashSet();
        await _db.ServiceStaffMaps.AddRangeAsync(validServiceIds.Where(id => !existingIds.Contains(id)).Select(id => new ServiceStaffMap
        {
            StaffId = staff.Id, ServiceId = id, CreatedAt = DateTime.Now, CreatedBy = userId
        }), ct);
        await _db.SaveChangesAsync(ct);

        var saved = await _db.ShopStaffs.AsNoTracking()
            .Include(s => s.User).ThenInclude(u => u!.UserAuthentications)
            .Include(s => s.User).ThenInclude(u => u!.UserImages)
            .Include(s => s.ServiceStaffMaps)
            .SingleAsync(s => s.Id == staff.Id, ct);
        return ToStaffResponse(saved);
    }

    public async Task<StaffResponse> SaveStaffPhotoAsync(
        int userId,
        int staffId,
        StaffPhotoRequest request,
        CancellationToken ct)
    {
        const long maxFileSize = 5 * 1024 * 1024;
        if (request.ProfilePicture is null || request.ProfilePicture.Length == 0)
            throw new InvalidOperationException("Please select an image to upload.");
        if (request.ProfilePicture.Length > maxFileSize)
            throw new InvalidOperationException("The staff image must not exceed 5 MB.");

        var staff = await GetOwnedStaffForPhotoAsync(userId, staffId, ct);
        string extension = await DetectImageExtensionAsync(request.ProfilePicture, ct);
        string uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "staff");
        Directory.CreateDirectory(uploadsFolder);

        string fileName = $"{Guid.NewGuid():N}{extension}";
        string filePath = Path.Combine(uploadsFolder, fileName);
        string fileUrl = $"/uploads/staff/{fileName}";
        string? oldFileUrl = staff.ProfilePictureUrl;

        try
        {
            await using (var stream = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                81920,
                useAsync: true))
            {
                await request.ProfilePicture.CopyToAsync(stream, ct);
            }

            staff.ProfilePictureUrl = fileUrl;
            staff.UpdatedAt = DateTime.Now;
            staff.UpdatedBy = userId;
            await _db.SaveChangesAsync(ct);
        }
        catch
        {
            if (File.Exists(filePath)) File.Delete(filePath);
            throw;
        }

        DeleteStaffImageFile(oldFileUrl);
        return ToStaffResponse(staff);
    }

    public async Task<StaffResponse> DeleteStaffPhotoAsync(
        int userId,
        int staffId,
        CancellationToken ct)
    {
        var staff = await GetOwnedStaffForPhotoAsync(userId, staffId, ct);
        string? oldFileUrl = staff.ProfilePictureUrl;
        staff.ProfilePictureUrl = null;
        staff.UpdatedAt = DateTime.Now;
        staff.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        DeleteStaffImageFile(oldFileUrl);
        return ToStaffResponse(staff);
    }

    public async Task<string> SendStaffInviteAsync(int userId, StaffInviteRequest request, string appUrl, CancellationToken ct)
    {
        var staff = await _db.ShopStaffs
            .Include(s => s.Shop)
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, ct)
            ?? throw new KeyNotFoundException("Staff member not found.");

        await EnsureBranchPermissionAsync(userId, staff.BranchId, "staff.invite", ct);
        if (!staff.CanLogin || string.IsNullOrWhiteSpace(staff.Email))
            throw new InvalidOperationException("Enable system access and enter a valid email before sending an invitation.");
        if (!System.Net.Mail.MailAddress.TryCreate(staff.Email, out _))
            throw new InvalidOperationException("The staff email address is invalid.");

        string email = staff.Email.Trim();
        await _accountShopGuard.EnsureEmailCanJoinAsync(email, staff.ShopId, ct);
        string locale = request.Locale.Equals("th", StringComparison.OrdinalIgnoreCase) ? "th" : "en";
        string rootUrl = appUrl.TrimEnd('/');
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is { IsActive: true, EmailConfirmed: true })
        {
            await _accountShopGuard.BindAsync(user.Id, staff.ShopId, ct);
            staff.UserId = user.Id;
            var role = await ResolveStaffSystemRoleAsync(staff, ct);
            await SyncStaffRoleMapsAsync(staff, role, userId, ct);
            await _db.SaveChangesAsync(ct);
            return "linked";
        }

        if (user != null)
        {
            var confirmation = await _db.EmailConfirmations
                .Where(c => c.UserId == user.Id && !c.IsUsed && c.ExpiredAt > DateTime.UtcNow)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (confirmation == null)
            {
                string token = Guid.NewGuid().ToString("N");
                confirmation = new EmailConfirmation
                {
                    UserId = user.Id,
                    Token = token,
                    TokenHash = Crypto.HashPassword(token),
                    ExpiredAt = DateTime.UtcNow.AddHours(24),
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow,
                };
                _db.EmailConfirmations.Add(confirmation);
                await _db.SaveChangesAsync(ct);
            }

            string confirmationLink = $"{rootUrl}/{locale}/auth/mail-verify?token={confirmation.Token}";
            await _emailService.SendConfirmationEmailAsync(email, staff.Name, confirmationLink);
            return "confirmation_resent";
        }

        string registrationLink =
            $"{rootUrl}/{locale}/auth/register?email={Uri.EscapeDataString(email)}" +
            $"&name={Uri.EscapeDataString(staff.Name)}" +
            $"&phone={Uri.EscapeDataString(staff.Phone ?? string.Empty)}&invited=1";
        await _emailService.SendStaffInvitationEmailAsync(email, staff.Name, registrationLink, locale);
        return "invited";
    }

    public async Task<bool> DeleteStaffAsync(int userId, int staffId, CancellationToken ct)
    {
        var staff = await _db.ShopStaffs.Include(s => s.Shop).FirstOrDefaultAsync(s => s.Id == staffId, ct);
        if (staff == null) return false;
        await EnsureBranchPermissionAsync(userId, staff.BranchId, "staff.remove", ct);
        staff.IsActive = false;
        staff.IsAvailable = false;
        staff.CanLogin = false;
        staff.UpdatedAt = DateTime.Now;
        staff.UpdatedBy = userId;
        if (staff.UserId.HasValue)
            await RemoveStaffRoleMapsAsync(staff.ShopId, staff.BranchId, staff.UserId.Value, ct);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<AvailableSlotResponse>> GetSlotsAsync(
        int branchId,
        DateTime? date,
        int? serviceId,
        CancellationToken ct)
    {
        DateTime localNow = _dateTime.LocalNow();
        var target = (date ?? localNow.Date).Date;
        var branch = await _db.ShopBranches.AsNoTracking()
            .Where(item => item.Id == branchId && item.IsActive && item.Shop.IsActive)
            .Select(item => new { item.Id, item.ShopId })
            .SingleOrDefaultAsync(ct);
        if (branch == null) return new();

        int advanceWindow = 14;
        string? advanceSetting = await _db.ShopSettings.AsNoTracking()
            .Where(setting => setting.BranchId == branchId
                && setting.Key == "queue.advance_booking_window")
            .Select(setting => setting.Value)
            .SingleOrDefaultAsync(ct);
        if (int.TryParse(advanceSetting, out int configuredAdvance))
            advanceWindow = Math.Clamp(configuredAdvance, 0, 365);
        if (target < localNow.Date || target > localNow.Date.AddDays(advanceWindow))
            return new();

        bool isHoliday = await _db.ShopHolidays.AsNoTracking()
            .AnyAsync(holiday => holiday.BranchId == branchId
                && holiday.HolidayDate == DateOnly.FromDateTime(target), ct);
        if (isHoliday) return new();

        ShopBusinessHour? businessHour = await _db.ShopBusinessHours.AsNoTracking()
            .SingleOrDefaultAsync(hour => hour.BranchId == branchId
                && hour.DayOfWeek == (int)target.DayOfWeek
                && hour.IsActive, ct);
        if (businessHour == null) return new();

        bool hasSlots = await _db.QueueSlots.AnyAsync(
            slot => slot.BranchId == branchId && slot.Date.Date == target, ct);
        if (!hasSlots)
        {
            int interval = 30;
            string? intervalSetting = await _db.ShopSettings.AsNoTracking()
                .Where(setting => setting.BranchId == branchId
                    && setting.Key == "queue.slot_interval")
                .Select(setting => setting.Value)
                .SingleOrDefaultAsync(ct);
            if (int.TryParse(intervalSetting, out int configuredInterval))
                interval = Math.Clamp(configuredInterval, 5, 240);

            IQueryable<ShopStaff> capacityQuery = _db.ShopStaffs.AsNoTracking()
                .Where(staff => staff.BranchId == branchId
                    && staff.IsActive
                    && staff.IsAvailable
                    && staff.CanServeQueues);
            if (serviceId.HasValue)
                capacityQuery = capacityQuery.Where(staff =>
                    staff.ServiceStaffMaps.Any(map => map.ServiceId == serviceId.Value));
            int capacity = await capacityQuery.CountAsync(ct);
            if (capacity == 0) return new();

            var generatedSlots = new List<Domain.Entities.QueueSlot>();
            TimeOnly start = businessHour.OpenTime;
            while (start.AddMinutes(interval) <= businessHour.CloseTime)
            {
                generatedSlots.Add(new Domain.Entities.QueueSlot
                {
                    Guid = Guid.NewGuid(),
                    ShopId = branch.ShopId,
                    BranchId = branchId,
                    Date = target,
                    StartTime = start,
                    EndTime = start.AddMinutes(interval),
                    MaxQueue = capacity,
                    CurrentUsage = 0,
                    IsActive = true,
                    CreatedAt = localNow
                });
                start = start.AddMinutes(interval);
            }
            if (generatedSlots.Count > 0)
            {
                _db.QueueSlots.AddRange(generatedSlots);
                try
                {
                    await _db.SaveChangesAsync(ct);
                }
                catch (DbUpdateException)
                {
                    _db.ChangeTracker.Clear();
                }
            }
        }

        TimeOnly now = TimeOnly.FromDateTime(localNow);
        List<Domain.Entities.QueueSlot> availableSlots = await _db.QueueSlots.AsNoTracking()
            .Where(s => s.BranchId == branchId
                && s.IsActive
                && s.Date.Date == target
                && s.CurrentUsage < s.MaxQueue
                && (target > localNow.Date || s.StartTime > now))
            .OrderBy(s => s.StartTime)
            .ToListAsync(ct);

        if (!serviceId.HasValue)
            return availableSlots.Select(slot => ToAvailableSlot(slot, slot.MaxQueue - slot.CurrentUsage)).ToList();

        Domain.Entities.Service? service = await _db.Services.AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == serviceId.Value
                && item.BranchId == branchId
                && item.IsActive, ct);
        if (service == null) return new();

        SchedulingContext scheduling = await LoadSchedulingContextAsync(service, target, ct);
        return availableSlots
            .Where(slot => slot.StartTime.AddMinutes(service.Duration) <= businessHour.CloseTime)
            .Select(slot => new
            {
                Slot = slot,
                Remaining = GetAvailableStaffIds(scheduling, service, slot).Count
            })
            .Where(item => item.Remaining > 0)
            .Select(item => ToAvailableSlot(
                item.Slot,
                item.Remaining,
                item.Slot.StartTime.AddMinutes(service.Duration)))
            .ToList();
    }

    public async Task<BookingResponse> CreateBookingAsync(int? userId, CreateBookingRequest request, CancellationToken ct)
    {
        int shopId = await _db.ShopBranches.AsNoTracking()
            .Where(branch => branch.Id == request.BranchId && branch.IsActive)
            .Select(branch => branch.ShopId)
            .SingleOrDefaultAsync(ct);
        if (shopId == 0) throw new KeyNotFoundException("Branch not found.");
        if (userId.HasValue)
            await _accountShopGuard.EnsureCanJoinAsync(userId.Value, shopId, ct);
        else
            ValidateGuest(request);
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var service = await GetServiceAsync(request.ServiceId, request.BranchId, ct);
        var slot = await _db.QueueSlots.FirstOrDefaultAsync(s => s.Id == request.QueueSlotId && s.BranchId == request.BranchId && s.IsActive, ct)
            ?? throw new KeyNotFoundException("Queue slot not found.");
        DateTime localNow = _dateTime.LocalNow();
        if (slot.Date.Date < localNow.Date) throw new InvalidOperationException("This time slot is in the past.");
        if (slot.Date.Date == localNow.Date && slot.StartTime <= TimeOnly.FromDateTime(localNow))
            throw new InvalidOperationException("This time slot has already started.");
        if (slot.CurrentUsage >= slot.MaxQueue) throw new InvalidOperationException("This time slot is full.");

        int? staffId = await ResolveStaffAsync(service, request.StaffId, ct, slot.Id);
        var waiting = await GetStatusAsync("BOOKING_STATUS", "WAITING", ct);
        var booking = new Booking
        {
            UserId = userId, BranchId = request.BranchId, QueueSlotId = slot.Id, AssignedStaffId = staffId,
            GuestName = userId.HasValue ? null : request.GuestName?.Trim(),
            GuestPhone = userId.HasValue ? null : request.GuestPhone?.Trim(),
            GuestEmail = userId.HasValue ? null : request.GuestEmail?.Trim(),
            Remark = request.Remark?.Trim(), StatusId = waiting.Id, CreatedAt = localNow, CreatedBy = userId
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);
        _db.BookingServices.Add(new BookingService { BookingId = booking.Id, ServiceId = service.Id, CreatedAt = localNow, CreatedBy = userId });
        slot.CurrentUsage++;
        await RememberCustomerAsync(shopId, userId, request, localNow, ct);
        await CreateBookingNotificationsAsync(
            shopId,
            request.BranchId,
            userId,
            request.GuestName?.Trim() ?? "ลูกค้า",
            service.Name,
            slot.Date,
            slot.StartTime,
            localNow,
            ct);
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetBookingByIdAsync(booking.Id, ct);
    }

    public async Task<List<BookingResponse>> GetBookingsAsync(int userId, int branchId, CancellationToken ct)
    {
        if (branchId == 0)
        {
            var ownBookings = await BookingQuery().Where(b => b.UserId == userId)
                .OrderBy(b => b.QueueSlot.Date).ThenBy(b => b.QueueSlot.StartTime)
                .ToListAsync(ct);
            return ownBookings.Select(ToBookingResponse).ToList();
        }
        await EnsureBranchPermissionAsync(userId, branchId, "booking.view", ct);
        var bookings = await BookingQuery().Where(b => b.BranchId == branchId)
            .OrderBy(b => b.QueueSlot.Date).ThenBy(b => b.QueueSlot.StartTime)
            .ToListAsync(ct);
        return bookings.Select(ToBookingResponse).ToList();
    }

    public async Task<BookingResponse> UpdateBookingAsync(int userId, int bookingId, UpdateOperationStatusRequest request, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var booking = await _db.Bookings.Include(b => b.Branch).ThenInclude(b => b.Shop)
            .Include(b => b.BookingServices).ThenInclude(map => map.Service)
            .Include(b => b.QueueSlot).Include(b => b.Status).Include(b => b.User)
            .Include(b => b.Queue).ThenInclude(queue => queue!.Status)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct)
            ?? throw new KeyNotFoundException("Booking not found.");
        await EnsureBranchPermissionAsync(userId, booking.BranchId, "booking.manage", ct);
        if (!BookingStatuses.Contains(request.Status)) throw new InvalidOperationException("Invalid booking status.");
        var nextStatus = await GetStatusAsync("BOOKING_STATUS", request.Status.ToUpperInvariant(), ct);
        ValidateBookingTransition(booking.Status.Code, nextStatus.Code);
        DateTime localNow = _dateTime.LocalNow();
        bool wasCancelled = booking.Status.Code == "CANCELLED";
        bool willBeCancelled = nextStatus.Code == "CANCELLED";
        if (!wasCancelled && willBeCancelled && booking.QueueSlot.Date.Date >= localNow.Date && booking.QueueSlot.CurrentUsage > 0)
            booking.QueueSlot.CurrentUsage--;
        else if (wasCancelled && !willBeCancelled && booking.QueueSlot.Date.Date >= localNow.Date)
        {
            if (booking.QueueSlot.CurrentUsage >= booking.QueueSlot.MaxQueue)
                throw new InvalidOperationException("This time slot is already full.");
            booking.QueueSlot.CurrentUsage++;
        }
        if (request.StaffId.HasValue)
            booking.AssignedStaffId = await ResolveStaffAsync(await GetServiceAsync(booking.BookingServices.First().ServiceId, booking.BranchId, ct), request.StaffId, ct, booking.QueueSlotId);
        if (nextStatus.Code == "CHECKED_IN")
            await EnsureBookingQueueAsync(booking, userId, localNow, ct);
        else if (booking.Queue != null)
        {
            string? queueStatusCode = nextStatus.Code switch
            {
                "DONE" => "DONE",
                "CANCELLED" => "CANCELLED",
                "NO_SHOW" => "SKIPPED",
                _ => null
            };
            if (queueStatusCode != null)
                booking.Queue.StatusId = (await GetStatusAsync("QUEUE_STATUS", queueStatusCode, ct)).Id;
            booking.Queue.AssignedStaffId = booking.AssignedStaffId;
            booking.Queue.UpdatedAt = localNow;
            booking.Queue.UpdatedBy = userId;
        }
        booking.StatusId = nextStatus.Id;
        booking.UpdatedAt = localNow;
        booking.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetBookingByIdAsync(booking.Id, ct);
    }

    public async Task<QueueResponse> CreateQueueAsync(int userId, CreateQueueRequest request, CancellationToken ct)
    {
        if (request.CustomerName?.Trim().Length > 150) throw new InvalidOperationException("Customer name must not exceed 150 characters.");
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        await EnsureBranchPermissionAsync(userId, request.BranchId, "queue.manage", ct);
        var service = await GetServiceAsync(request.ServiceId, request.BranchId, ct);
        int? staffId = await ResolveStaffAsync(service, request.StaffId, ct);
        int number = (await _db.Queues.Where(q => q.BranchId == request.BranchId && q.CreatedAt.Date == DateTime.Today)
            .MaxAsync(q => (int?)q.QueueNumber, ct) ?? 0) + 1;
        var waiting = await GetStatusAsync("QUEUE_STATUS", "WAITING", ct);
        var queue = new Domain.Entities.Queue
        {
            BranchId = request.BranchId, QueueNumber = number, ServiceId = service.Id, AssignedStaffId = staffId,
            CustomerName = request.CustomerName?.Trim(), StatusId = waiting.Id,
            Type = string.IsNullOrWhiteSpace(request.Type) ? "WALK_IN" : request.Type.Trim().ToUpperInvariant(),
            CreatedAt = DateTime.Now, CreatedBy = userId
        };
        _db.Queues.Add(queue);
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetQueueByIdAsync(queue.Id, ct);
    }

    public async Task<List<QueueResponse>> GetQueuesAsync(int userId, int branchId, CancellationToken ct)
    {
        await EnsureBranchPermissionAsync(userId, branchId, "queue.view", ct);
        var queues = await QueueQuery().Where(q => q.BranchId == branchId)
            .OrderByDescending(q => q.CreatedAt).ToListAsync(ct);
        return queues.Select(ToQueueResponse).ToList();
    }

    public async Task<QueueResponse> UpdateQueueAsync(int userId, int queueId, UpdateOperationStatusRequest request, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var queue = await _db.Queues.Include(q => q.Branch).ThenInclude(b => b.Shop).Include(q => q.Service)
            .Include(q => q.Booking).ThenInclude(booking => booking!.Status)
            .FirstOrDefaultAsync(q => q.Id == queueId, ct) ?? throw new KeyNotFoundException("Queue not found.");
        await EnsureBranchPermissionAsync(userId, queue.BranchId, "queue.manage", ct);
        if (!QueueStatuses.Contains(request.Status)) throw new InvalidOperationException("Invalid queue status.");
        string nextQueueStatus = request.Status.ToUpperInvariant();
        queue.StatusId = (await GetStatusAsync("QUEUE_STATUS", nextQueueStatus, ct)).Id;
        if (request.StaffId.HasValue && queue.Service != null)
            queue.AssignedStaffId = await ResolveStaffAsync(queue.Service, request.StaffId, ct);
        DateTime localNow = _dateTime.LocalNow();
        queue.UpdatedAt = localNow;
        queue.UpdatedBy = userId;
        if (queue.Booking != null)
        {
            string? bookingStatusCode = nextQueueStatus switch
            {
                "WAITING" or "SERVING" => "CHECKED_IN",
                "DONE" => "DONE",
                "CANCELLED" => "CANCELLED",
                "SKIPPED" => "NO_SHOW",
                _ => null
            };
            if (bookingStatusCode != null)
            {
                queue.Booking.StatusId = (await GetStatusAsync("BOOKING_STATUS", bookingStatusCode, ct)).Id;
                queue.Booking.AssignedStaffId = queue.AssignedStaffId;
                queue.Booking.UpdatedAt = localNow;
                queue.Booking.UpdatedBy = userId;
            }
        }
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetQueueByIdAsync(queue.Id, ct);
    }

    private async Task EnsureBookingQueueAsync(
        Booking booking,
        int userId,
        DateTime localNow,
        CancellationToken ct)
    {
        if (booking.QueueSlot.Date.Date != localNow.Date)
            throw new InvalidOperationException("A booking can only be checked in on its scheduled date.");
        if (booking.Queue != null) return;

        int queueNumber = (await _db.Queues
            .Where(queue => queue.BranchId == booking.BranchId
                && queue.CreatedAt.Date == localNow.Date)
            .MaxAsync(queue => (int?)queue.QueueNumber, ct) ?? 0) + 1;
        MasterStatus waiting = await GetStatusAsync("QUEUE_STATUS", "WAITING", ct);
        int serviceId = booking.BookingServices.FirstOrDefault()?.ServiceId
            ?? throw new InvalidOperationException("The booking does not contain a service.");
        var queue = new Domain.Entities.Queue
        {
            Guid = Guid.NewGuid(),
            BranchId = booking.BranchId,
            BookingId = booking.Id,
            QueueNumber = queueNumber,
            ServiceId = serviceId,
            AssignedStaffId = booking.AssignedStaffId,
            CustomerName = booking.User?.Name ?? booking.GuestName ?? "Customer",
            StatusId = waiting.Id,
            Type = "BOOKING",
            CreatedAt = localNow,
            CreatedBy = userId
        };
        booking.QueueNumber = queueNumber;
        booking.Queue = queue;
        _db.Queues.Add(queue);
    }

    private static void ValidateBookingTransition(string currentStatus, string nextStatus)
    {
        if (currentStatus.Equals(nextStatus, StringComparison.OrdinalIgnoreCase))
            return;
        bool allowed = currentStatus.ToUpperInvariant() switch
        {
            "WAITING" => nextStatus is "CONFIRMED" or "CANCELLED" or "NO_SHOW",
            "CONFIRMED" => nextStatus is "CHECKED_IN" or "CANCELLED" or "NO_SHOW",
            "CHECKED_IN" => nextStatus is "DONE" or "CANCELLED" or "NO_SHOW",
            _ => false
        };
        if (!allowed)
            throw new InvalidOperationException($"Booking status cannot change from {currentStatus} to {nextStatus}.");
    }

    private async Task<ShopBranch> EnsureBranchPermissionAsync(
        int userId,
        int branchId,
        string permission,
        CancellationToken ct)
    {
        await _permissions.EnsureBranchAsync(userId, branchId, permission, ct);
        return await _db.ShopBranches.Include(branch => branch.Shop)
            .SingleAsync(branch => branch.Id == branchId, ct);
    }

    private async Task<Domain.Entities.Service> GetServiceAsync(int serviceId, int branchId, CancellationToken ct) =>
        await _db.Services.Include(s => s.ServiceStaffMaps).FirstOrDefaultAsync(s => s.Id == serviceId
            && s.BranchId == branchId
            && s.IsActive
            && s.ServiceStaffMaps.Any(m => m.Staff.IsActive && m.Staff.CanServeQueues), ct)
        ?? throw new KeyNotFoundException("Active service not found.");

    private async Task<int?> ResolveStaffAsync(Domain.Entities.Service service, int? requestedStaffId, CancellationToken ct, int? queueSlotId = null)
    {
        string mode = (service.StaffSelectionMode ?? "OPTIONAL").ToUpperInvariant();
        if (mode == "AUTO") requestedStaffId = null;
        IQueryable<ShopStaff> eligible = _db.ShopStaffs.Where(s =>
            s.BranchId == service.BranchId
            && s.IsActive
            && s.IsAvailable
            && s.CanServeQueues
            && s.ServiceStaffMaps.Any(m => m.ServiceId == service.Id));

        List<int>? availableStaffIds = null;
        if (queueSlotId.HasValue)
        {
            Domain.Entities.QueueSlot slot = await _db.QueueSlots.AsNoTracking()
                .SingleAsync(item => item.Id == queueSlotId.Value, ct);
            SchedulingContext scheduling = await LoadSchedulingContextAsync(service, slot.Date, ct);
            availableStaffIds = GetAvailableStaffIds(scheduling, service, slot);
            eligible = eligible.Where(staff => availableStaffIds.Contains(staff.Id));
        }
        if (requestedStaffId.HasValue)
        {
            if (!await eligible.AnyAsync(s => s.Id == requestedStaffId.Value, ct))
                throw new InvalidOperationException("The selected staff member is unavailable during this service time.");
            return requestedStaffId;
        }
        if (mode == "REQUIRED") throw new InvalidOperationException("Please select a staff member for this service.");

        var candidates = await eligible.Select(s => new
        {
            s.Id,
            Load = s.AssignedBookings.Count(b => b.Status.Code != "DONE" && b.Status.Code != "CANCELLED" && b.Status.Code != "NO_SHOW")
                 + s.AssignedQueues.Count(q => q.Status.Code != "DONE" && q.Status.Code != "CANCELLED" && q.Status.Code != "SKIPPED")
        }).OrderBy(s => s.Load).ThenBy(s => s.Id).ToListAsync(ct);
        if (candidates.Count == 0) throw new InvalidOperationException("No staff member is available during this service time.");
        return candidates.FirstOrDefault()?.Id;
    }

    private async Task<SchedulingContext> LoadSchedulingContextAsync(
        Domain.Entities.Service service,
        DateTime date,
        CancellationToken ct)
    {
        List<int> staffIds = await _db.ShopStaffs.AsNoTracking()
            .Where(staff => staff.BranchId == service.BranchId
                && staff.IsActive
                && staff.IsAvailable
                && staff.CanServeQueues
                && staff.ServiceStaffMaps.Any(map => map.ServiceId == service.Id))
            .Select(staff => staff.Id)
            .ToListAsync(ct);

        int bufferMinutes = 0;
        string? bufferSetting = await _db.ShopSettings.AsNoTracking()
            .Where(setting => setting.BranchId == service.BranchId
                && setting.Key == "queue.buffer_between_services")
            .Select(setting => setting.Value)
            .SingleOrDefaultAsync(ct);
        if (int.TryParse(bufferSetting, out int configuredBuffer))
            bufferMinutes = Math.Clamp(configuredBuffer, 0, 240);

        List<Booking> bookings = staffIds.Count == 0
            ? new()
            : await _db.Bookings.AsNoTracking()
                .Include(booking => booking.QueueSlot)
                .Include(booking => booking.Status)
                .Include(booking => booking.BookingServices)
                    .ThenInclude(map => map.Service)
                .Where(booking => booking.AssignedStaffId.HasValue
                    && staffIds.Contains(booking.AssignedStaffId.Value)
                    && booking.QueueSlot.Date.Date == date.Date
                    && booking.Status.Code != "DONE"
                    && booking.Status.Code != "CANCELLED"
                    && booking.Status.Code != "NO_SHOW")
                .ToListAsync(ct);

        return new SchedulingContext(staffIds, bookings, bufferMinutes);
    }

    private static List<int> GetAvailableStaffIds(
        SchedulingContext scheduling,
        Domain.Entities.Service service,
        Domain.Entities.QueueSlot slot)
    {
        TimeOnly requestedStart = slot.StartTime;
        TimeOnly requestedEnd = requestedStart.AddMinutes(service.Duration + scheduling.BufferMinutes);
        return scheduling.StaffIds.Where(staffId =>
            !scheduling.Bookings.Any(booking =>
            {
                if (booking.AssignedStaffId != staffId) return false;
                TimeOnly existingStart = booking.QueueSlot.StartTime;
                int existingDuration = booking.BookingServices.Sum(map => map.Service.Duration);
                TimeOnly existingEnd = existingStart.AddMinutes(existingDuration + scheduling.BufferMinutes);
                return requestedStart < existingEnd && existingStart < requestedEnd;
            })).ToList();
    }

    private static AvailableSlotResponse ToAvailableSlot(
        Domain.Entities.QueueSlot slot,
        int remaining,
        TimeOnly? endTime = null) => new()
        {
            Id = slot.Id,
            Date = slot.Date,
            StartTime = slot.StartTime.ToString("HH:mm"),
            EndTime = (endTime ?? slot.EndTime).ToString("HH:mm"),
            Remaining = remaining
        };

    private sealed record SchedulingContext(
        List<int> StaffIds,
        List<Booking> Bookings,
        int BufferMinutes);

    private async Task<ShopStaff> GetOwnedStaffForPhotoAsync(
        int userId,
        int staffId,
        CancellationToken ct)
    {
        var staff = await _db.ShopStaffs
            .Include(s => s.Shop)
            .Include(s => s.User).ThenInclude(u => u!.UserImages)
            .Include(s => s.User).ThenInclude(u => u!.UserAuthentications)
            .Include(s => s.ServiceStaffMaps)
            .FirstOrDefaultAsync(s => s.Id == staffId, ct)
            ?? throw new KeyNotFoundException("Staff member not found.");
        await EnsureBranchPermissionAsync(userId, staff.BranchId, "staff.edit", ct);
        return staff;
    }

    private static async Task<string> DetectImageExtensionAsync(
        Microsoft.AspNetCore.Http.IFormFile image,
        CancellationToken ct)
    {
        byte[] header = new byte[12];
        await using Stream stream = image.OpenReadStream();
        int bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length), ct);

        if (bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
            return ".jpg";
        if (bytesRead >= 8
            && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
            && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A)
            return ".png";
        if (bytesRead >= 12
            && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
            && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50)
            return ".webp";

        throw new InvalidOperationException("Only JPG, PNG, and WebP images are supported.");
    }

    private void DeleteStaffImageFile(string? fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl)
            || !fileUrl.StartsWith("/uploads/staff/", StringComparison.OrdinalIgnoreCase))
            return;

        string uploadsFolder = Path.GetFullPath(
            Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "staff"));
        string filePath = Path.GetFullPath(
            Path.Combine(_env.ContentRootPath, "wwwroot", fileUrl.TrimStart('/')));
        if (filePath.StartsWith(uploadsFolder + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
            && File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    private async Task<MasterStatus> GetStatusAsync(string type, string code, CancellationToken ct) =>
        await _db.MasterStatuses.FirstOrDefaultAsync(s => s.Type == type && s.Code == code, ct)
        ?? throw new InvalidOperationException($"Status {type}/{code} is not configured.");

    private async Task<ShopRole> ResolveStaffSystemRoleAsync(ShopStaff staff, CancellationToken ct)
    {
        string roleCode = string.IsNullOrWhiteSpace(staff.SystemRoleCode) ? "Staff" : staff.SystemRoleCode;
        string customPrefix = $"Custom_{staff.ShopId}_";
        return await _db.ShopRoles.FirstOrDefaultAsync(role =>
            role.Code == roleCode
            && role.IsActive
            && (role.IsSystem || role.Code.StartsWith(customPrefix)), ct)
            ?? await _db.ShopRoles.FirstAsync(role => role.Code == "Staff" && role.IsActive, ct);
    }

    private async Task SyncStaffRoleMapsAsync(
        ShopStaff staff,
        ShopRole role,
        int grantedBy,
        CancellationToken ct)
    {
        int userId = staff.UserId!.Value;
        var shopMaps = await _db.ShopUserRoleMaps
            .Where(map => map.ShopId == staff.ShopId && map.UserId == userId)
            .ToListAsync(ct);
        var branchMaps = await _db.BranchUserRoleMaps
            .Where(map => map.BranchId == staff.BranchId && map.UserId == userId)
            .ToListAsync(ct);
        _db.ShopUserRoleMaps.RemoveRange(shopMaps);
        _db.BranchUserRoleMaps.RemoveRange(branchMaps);
        if (role.Scope.Equals("Shop", StringComparison.OrdinalIgnoreCase))
        {
            _db.ShopUserRoleMaps.Add(new ShopUserRoleMap
            {
                ShopId = staff.ShopId,
                UserId = userId,
                RoleCode = role.Code,
                IsActive = true,
                GrantedBy = grantedBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = grantedBy,
            });
        }
        else
        {
            _db.BranchUserRoleMaps.Add(new BranchUserRoleMap
            {
                BranchId = staff.BranchId,
                UserId = userId,
                RoleCode = role.Code,
                IsActive = true,
                GrantedBy = grantedBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = grantedBy,
            });
        }
    }

    private async Task RemoveStaffRoleMapsAsync(
        int shopId,
        int branchId,
        int userId,
        CancellationToken ct)
    {
        bool hasOtherShopAccess = await _db.ShopStaffs.AnyAsync(staff =>
            staff.ShopId == shopId
            && staff.UserId == userId
            && staff.CanLogin
            && staff.IsActive, ct);
        var shopMaps = hasOtherShopAccess
            ? new List<ShopUserRoleMap>()
            : await _db.ShopUserRoleMaps
                .Where(map => map.ShopId == shopId && map.UserId == userId)
                .ToListAsync(ct);
        var branchMaps = await _db.BranchUserRoleMaps
            .Where(map => map.BranchId == branchId && map.UserId == userId)
            .ToListAsync(ct);
        _db.ShopUserRoleMaps.RemoveRange(shopMaps);
        _db.BranchUserRoleMaps.RemoveRange(branchMaps);
    }

    private IQueryable<Booking> BookingQuery() => _db.Bookings.AsNoTracking()
        .Include(b => b.BookingServices).ThenInclude(m => m.Service)
        .Include(b => b.QueueSlot).Include(b => b.User).Include(b => b.AssignedStaff).ThenInclude(s => s!.User)
        .Include(b => b.Status).Include(b => b.Queue);

    private async Task<BookingResponse> GetBookingByIdAsync(int id, CancellationToken ct) =>
        ToBookingResponse(await BookingQuery().SingleAsync(b => b.Id == id, ct));

    private IQueryable<Domain.Entities.Queue> QueueQuery() => _db.Queues.AsNoTracking()
        .Include(q => q.Service).Include(q => q.AssignedStaff).ThenInclude(s => s!.User)
        .Include(q => q.Status).Include(q => q.Booking);

    private async Task<QueueResponse> GetQueueByIdAsync(int id, CancellationToken ct) =>
        ToQueueResponse(await QueueQuery().SingleAsync(q => q.Id == id, ct));

    private static StaffResponse ToStaffResponse(ShopStaff s) => new()
    {
        Id = s.Id, ShopId = s.ShopId, BranchId = s.BranchId, UserId = s.UserId,
        Name = string.IsNullOrWhiteSpace(s.Name) ? s.User?.Name ?? string.Empty : s.Name,
        Email = s.Email ?? s.User?.Email, Phone = s.Phone ?? s.User?.Phone, Role = s.Role,
        SystemRoleCode = s.SystemRoleCode,
        CanServeQueues = s.CanServeQueues, CanLogin = s.CanLogin, IsAvailable = s.IsAvailable,
        IsActive = s.IsActive, ServiceIds = s.ServiceStaffMaps.Select(m => m.ServiceId).ToList(),
        EmailConfirmed = s.User?.EmailConfirmed,
        LastLoginAt = s.User?.UserAuthentications?.FirstOrDefault()?.LastLoginAt,
        ProfilePictureUrl = s.ProfilePictureUrl
            ?? s.User?.UserImages?.FirstOrDefault(ui => ui.IsPrimary)?.FileUrl,
        HasCustomProfilePicture = !string.IsNullOrWhiteSpace(s.ProfilePictureUrl)
    };

    private static BookingResponse ToBookingResponse(Booking b) => new()
    {
        Id = b.Id, Guid = b.Guid, BranchId = b.BranchId,
        ServiceId = b.BookingServices.Select(m => m.ServiceId).FirstOrDefault(),
        ServiceName = b.BookingServices.Select(m => m.Service.Name).FirstOrDefault() ?? string.Empty,
        QueueSlotId = b.QueueSlotId, Date = b.QueueSlot.Date, StartTime = b.QueueSlot.StartTime.ToString("HH:mm"),
        CustomerName = b.User?.Name ?? b.User?.Email ?? b.GuestName ?? "Customer", StaffId = b.AssignedStaffId,
        StaffName = b.AssignedStaff == null ? null : (string.IsNullOrWhiteSpace(b.AssignedStaff.Name) ? b.AssignedStaff.User?.Name : b.AssignedStaff.Name),
        QueueId = b.Queue?.Id, Status = b.Status.Code, Remark = b.Remark
    };

    private static void ValidateGuest(CreateBookingRequest request)
    {
        string name = request.GuestName?.Trim() ?? string.Empty;
        string phone = request.GuestPhone?.Trim() ?? string.Empty;
        string email = request.GuestEmail?.Trim() ?? string.Empty;
        if (name.Length is < 2 or > 150)
            throw new InvalidOperationException("Guest name must contain 2 to 150 characters.");
        if (phone.Length is < 8 or > 20 || phone.Any(character =>
            !char.IsDigit(character) && character is not '+' and not '-' and not ' ' and not '(' and not ')'))
            throw new InvalidOperationException("Please enter a valid phone number.");
        if (email.Length > 254 || (email.Length > 0 && !System.Net.Mail.MailAddress.TryCreate(email, out _)))
            throw new InvalidOperationException("Please enter a valid email address.");
    }

    private async Task RememberCustomerAsync(
        int shopId,
        int? userId,
        CreateBookingRequest request,
        DateTime localNow,
        CancellationToken ct)
    {
        User? user = userId.HasValue
            ? await _db.Users.AsNoTracking().SingleOrDefaultAsync(item => item.Id == userId.Value, ct)
            : null;
        string name = (user?.Name ?? request.GuestName)?.Trim() ?? string.Empty;
        string phone = (user?.Phone ?? request.GuestPhone)?.Trim() ?? string.Empty;
        string? email = (user?.Email ?? request.GuestEmail)?.Trim();
        string normalizedPhone = NormalizePhone(phone);

        Customer? customer = userId.HasValue
            ? await _db.Customers.SingleOrDefaultAsync(
                item => item.ShopId == shopId && item.UserId == userId.Value, ct)
            : (await _db.Customers
                .Where(item => item.ShopId == shopId && item.UserId == null)
                .ToListAsync(ct))
                .FirstOrDefault(item => NormalizePhone(item.Phone) == normalizedPhone);

        if (customer == null)
        {
            _db.Customers.Add(new Customer
            {
                Guid = Guid.NewGuid(),
                ShopId = shopId,
                UserId = userId,
                Name = name,
                Phone = phone,
                Email = string.IsNullOrWhiteSpace(email) ? null : email,
                IsActive = true,
                CreatedAt = localNow,
                CreatedBy = userId
            });
            return;
        }

        customer.Name = name;
        customer.Phone = phone;
        customer.Email = string.IsNullOrWhiteSpace(email) ? customer.Email : email;
        customer.IsActive = true;
        customer.UpdatedAt = localNow;
        customer.UpdatedBy = userId;
    }

    private async Task CreateBookingNotificationsAsync(
        int shopId,
        int branchId,
        int? bookingUserId,
        string customerName,
        string serviceName,
        DateTime date,
        TimeOnly startTime,
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

        string message = $"{customerName} จอง {serviceName} วันที่ {date:dd/MM/yyyy} เวลา {startTime:HH\\:mm}";
        foreach (int targetUserId in shopUsers
            .Append(ownerId)
            .Concat(branchUsers)
            .Concat(staffUsers)
            .Where(id => id != bookingUserId)
            .Distinct())
        {
            _db.Notifications.Add(new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = targetUserId,
                Type = "BOOKING_CREATED",
                Title = "มีการจองใหม่",
                Message = message,
                StatusId = unreadStatusId,
                CreatedAt = localNow,
                CreatedBy = bookingUserId
            });
        }
    }

    private static string NormalizePhone(string phone) =>
        new(phone.Where(char.IsDigit).ToArray());

    private static QueueResponse ToQueueResponse(Domain.Entities.Queue q) => new()
    {
        Id = q.Id, Guid = q.Guid, BranchId = q.BranchId, BookingId = q.BookingId, QueueNumber = q.QueueNumber,
        ServiceId = q.ServiceId, ServiceName = q.Service == null ? null : q.Service.Name,
        CustomerName = q.CustomerName, StaffId = q.AssignedStaffId,
        StaffName = q.AssignedStaff == null ? null : (string.IsNullOrWhiteSpace(q.AssignedStaff.Name) ? q.AssignedStaff.User?.Name : q.AssignedStaff.Name),
        Status = q.Status.Code, Type = q.Type, CreatedAt = q.CreatedAt
    };
}
