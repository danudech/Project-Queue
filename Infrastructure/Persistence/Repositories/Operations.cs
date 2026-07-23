using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Identity.Security;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Operations : IOperations
{
    private static readonly HashSet<string> BookingStatuses = new(StringComparer.OrdinalIgnoreCase)
        { "WAITING", "CONFIRMED", "CHECKED_IN", "DONE", "CANCELLED", "NO_SHOW" };
    private static readonly HashSet<string> QueueStatuses = new(StringComparer.OrdinalIgnoreCase)
        { "WAITING", "SERVING", "DONE", "CANCELLED", "SKIPPED" };

    private readonly QueueDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public Operations(QueueDbContext db, IEmailService emailService, IConfiguration config)
    {
        _db = db;
        _emailService = emailService;
        _config = config;
    }

    public async Task<List<StaffResponse>> GetStaffAsync(int userId, int branchId, int? serviceId, CancellationToken ct)
    {
        await EnsureBranchAccessAsync(userId, branchId, ct);
        var query = _db.ShopStaffs.AsNoTracking()
            .Include(s => s.User)
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
        await _db.Services.AsNoTracking().Where(s => s.BranchId == branchId && s.IsActive)
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

        var branch = await EnsureBranchOwnerAsync(userId, request.BranchId, ct);
        if (branch.ShopId != request.ShopId) throw new InvalidOperationException("Branch does not belong to this shop.");

        string trimmedName = request.Name.Trim();
        int staffIdToExamine = request.Id ?? 0;

        if (await _db.ShopStaffs.AnyAsync(s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.Name.ToLower() == trimmedName.ToLower(), ct))
            throw new InvalidOperationException("A staff member with this name already exists in this branch.");

        if (!string.IsNullOrWhiteSpace(request.Email) && await _db.ShopStaffs.AnyAsync(s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.Email != null && s.Email.ToLower() == request.Email.Trim().ToLower(), ct))
            throw new InvalidOperationException("This email is already assigned to another staff member in this branch.");

        User? linkedUser = null;
        if (request.CanLogin)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new InvalidOperationException("An email is required when system access is enabled.");

            string email = request.Email.Trim();
            linkedUser = await _db.Users.Include(u => u.UserAuthentications).FirstOrDefaultAsync(u => u.Email == email, ct);

            if (linkedUser == null)
            {
                var customerRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Customer", ct);
                string initialPassword = "EzQ#" + Guid.NewGuid().ToString("N")[..8];

                linkedUser = new User
                {
                    Guid = Guid.NewGuid(),
                    Name = trimmedName,
                    Email = email,
                    Phone = request.Phone?.Trim() ?? string.Empty,
                    StatusId = 1,
                    EmailConfirmed = false,
                    CreatedAt = DateTime.UtcNow,
                    UserRoleMaps = new List<UserRoleMap>
                    {
                        new UserRoleMap { RoleId = customerRole?.Id ?? 2 }
                    },
                    UserAuthentications = new List<UserAuthentication>
                    {
                        new UserAuthentication
                        {
                            PasswordHash = Crypto.HashPassword(initialPassword),
                            CreatedAt = DateTime.UtcNow
                        }
                    }
                };

                _db.Users.Add(linkedUser);
                await _db.SaveChangesAsync(ct);

                string token = Guid.NewGuid().ToString("N");
                string tokenHash = Crypto.HashPassword(token);
                var confirmation = new EmailConfirmation
                {
                    UserId = linkedUser.Id,
                    Token = token,
                    TokenHash = tokenHash,
                    ExpiredAt = DateTime.UtcNow.AddHours(24),
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };
                _db.EmailConfirmations.Add(confirmation);
                await _db.SaveChangesAsync(ct);

                string appUrl = _config["AppSettings:AppUrl"] ?? "http://localhost:3000";
                string confirmationLink = $"{appUrl.TrimEnd('/')}/th/auth/mail-verify?token={token}";
                await _emailService.SendStaffConfirmationWithPasswordEmailAsync(email, trimmedName, confirmationLink, initialPassword, "th");
            }
            else if (await _db.ShopStaffs.AnyAsync(s => s.Id != staffIdToExamine && s.BranchId == branch.Id && s.UserId == linkedUser.Id, ct))
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

        staff.UserId = linkedUser?.Id;
        staff.Name = trimmedName;
        staff.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        staff.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        staff.Role = string.IsNullOrWhiteSpace(request.Role) ? "STAFF" : request.Role.Trim().ToUpperInvariant();
        staff.CanServeQueues = request.CanServeQueues;
        staff.CanLogin = request.CanLogin;
        staff.IsAvailable = request.IsAvailable;
        staff.IsActive = request.IsActive;
        staff.UpdatedAt = DateTime.Now;
        staff.UpdatedBy = userId;
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

        var saved = await _db.ShopStaffs.AsNoTracking().Include(s => s.User).Include(s => s.ServiceStaffMaps)
            .SingleAsync(s => s.Id == staff.Id, ct);
        return ToStaffResponse(saved);
    }

    public async Task<string> SendStaffInviteAsync(int userId, StaffInviteRequest request, string appUrl, CancellationToken ct)
    {
        var staff = await _db.ShopStaffs
            .Include(s => s.Shop)
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, ct)
            ?? throw new KeyNotFoundException("Staff member not found.");

        if (staff.Shop.OwnerId != userId)
            throw new UnauthorizedAccessException("You cannot invite this staff member.");
        if (!staff.CanLogin || string.IsNullOrWhiteSpace(staff.Email))
            throw new InvalidOperationException("Enable system access and enter a valid email before sending an invitation.");
        if (!System.Net.Mail.MailAddress.TryCreate(staff.Email, out _))
            throw new InvalidOperationException("The staff email address is invalid.");

        string email = staff.Email.Trim();
        string locale = request.Locale.Equals("th", StringComparison.OrdinalIgnoreCase) ? "th" : "en";
        string rootUrl = appUrl.TrimEnd('/');
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is { IsActive: true, EmailConfirmed: true })
        {
            staff.UserId = user.Id;
            await _db.SaveChangesAsync(ct);
            return "linked";
        }

        if (user != null)
        {
            var confirmation = await _db.EmailConfirmations
                .Where(c => c.UserId == user.Id && !c.IsUsed && c.ExpiredAt > DateTime.UtcNow)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (confirmation != null)
            {
                string confirmationLink = $"{rootUrl}/{locale}/auth/mail-verify?token={confirmation.Token}";
                await _emailService.SendConfirmationEmailAsync(email, staff.Name, confirmationLink);
                return "confirmation_resent";
            }

            throw new InvalidOperationException("This email already has an account. Ask the user to sign in or resend account confirmation.");
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
        if (staff.Shop.OwnerId != userId) throw new UnauthorizedAccessException("You cannot manage this staff member.");
        staff.IsActive = false;
        staff.IsAvailable = false;
        staff.CanLogin = false;
        staff.UpdatedAt = DateTime.Now;
        staff.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<AvailableSlotResponse>> GetSlotsAsync(int branchId, DateTime? date, CancellationToken ct)
    {
        var target = (date ?? DateTime.Today).Date;
        return await _db.QueueSlots.AsNoTracking()
            .Where(s => s.BranchId == branchId && s.IsActive && s.Date.Date == target && s.CurrentUsage < s.MaxQueue)
            .OrderBy(s => s.StartTime)
            .Select(s => new AvailableSlotResponse
            {
                Id = s.Id, Date = s.Date, StartTime = s.StartTime.ToString("HH:mm"),
                EndTime = s.EndTime.ToString("HH:mm"), Remaining = s.MaxQueue - s.CurrentUsage
            }).ToListAsync(ct);
    }

    public async Task<BookingResponse> CreateBookingAsync(int userId, CreateBookingRequest request, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var service = await GetServiceAsync(request.ServiceId, request.BranchId, ct);
        var slot = await _db.QueueSlots.FirstOrDefaultAsync(s => s.Id == request.QueueSlotId && s.BranchId == request.BranchId && s.IsActive, ct)
            ?? throw new KeyNotFoundException("Queue slot not found.");
        if (slot.Date.Date < DateTime.Today) throw new InvalidOperationException("This time slot is in the past.");
        if (slot.Date.Date == DateTime.Today && slot.StartTime <= TimeOnly.FromDateTime(DateTime.Now))
            throw new InvalidOperationException("This time slot has already started.");
        if (slot.CurrentUsage >= slot.MaxQueue) throw new InvalidOperationException("This time slot is full.");

        int? staffId = await ResolveStaffAsync(service, request.StaffId, ct, slot.Id);
        var waiting = await GetStatusAsync("BOOKING_STATUS", "WAITING", ct);
        var booking = new Booking
        {
            UserId = userId, BranchId = request.BranchId, QueueSlotId = slot.Id, AssignedStaffId = staffId,
            Remark = request.Remark?.Trim(), StatusId = waiting.Id, CreatedAt = DateTime.Now, CreatedBy = userId
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);
        _db.BookingServices.Add(new BookingService { BookingId = booking.Id, ServiceId = service.Id, CreatedAt = DateTime.Now, CreatedBy = userId });
        slot.CurrentUsage++;
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
        await EnsureBranchAccessAsync(userId, branchId, ct);
        var bookings = await BookingQuery().Where(b => b.BranchId == branchId)
            .OrderBy(b => b.QueueSlot.Date).ThenBy(b => b.QueueSlot.StartTime)
            .ToListAsync(ct);
        return bookings.Select(ToBookingResponse).ToList();
    }

    public async Task<BookingResponse> UpdateBookingAsync(int userId, int bookingId, UpdateOperationStatusRequest request, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var booking = await _db.Bookings.Include(b => b.Branch).ThenInclude(b => b.Shop)
            .Include(b => b.BookingServices).Include(b => b.QueueSlot).Include(b => b.Status)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct)
            ?? throw new KeyNotFoundException("Booking not found.");
        await EnsureBranchAccessAsync(userId, booking.BranchId, ct);
        if (!BookingStatuses.Contains(request.Status)) throw new InvalidOperationException("Invalid booking status.");
        var nextStatus = await GetStatusAsync("BOOKING_STATUS", request.Status.ToUpperInvariant(), ct);
        bool wasCancelled = booking.Status.Code == "CANCELLED";
        bool willBeCancelled = nextStatus.Code == "CANCELLED";
        if (!wasCancelled && willBeCancelled && booking.QueueSlot.Date.Date >= DateTime.Today && booking.QueueSlot.CurrentUsage > 0)
            booking.QueueSlot.CurrentUsage--;
        else if (wasCancelled && !willBeCancelled && booking.QueueSlot.Date.Date >= DateTime.Today)
        {
            if (booking.QueueSlot.CurrentUsage >= booking.QueueSlot.MaxQueue)
                throw new InvalidOperationException("This time slot is already full.");
            booking.QueueSlot.CurrentUsage++;
        }
        booking.StatusId = nextStatus.Id;
        if (request.StaffId.HasValue)
            booking.AssignedStaffId = await ResolveStaffAsync(await GetServiceAsync(booking.BookingServices.First().ServiceId, booking.BranchId, ct), request.StaffId, ct, booking.QueueSlotId);
        booking.UpdatedAt = DateTime.Now;
        booking.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetBookingByIdAsync(booking.Id, ct);
    }

    public async Task<QueueResponse> CreateQueueAsync(int userId, CreateQueueRequest request, CancellationToken ct)
    {
        if (request.CustomerName?.Trim().Length > 150) throw new InvalidOperationException("Customer name must not exceed 150 characters.");
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        await EnsureBranchAccessAsync(userId, request.BranchId, ct);
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
        await EnsureBranchAccessAsync(userId, branchId, ct);
        var queues = await QueueQuery().Where(q => q.BranchId == branchId)
            .OrderByDescending(q => q.CreatedAt).ToListAsync(ct);
        return queues.Select(ToQueueResponse).ToList();
    }

    public async Task<QueueResponse> UpdateQueueAsync(int userId, int queueId, UpdateOperationStatusRequest request, CancellationToken ct)
    {
        var queue = await _db.Queues.Include(q => q.Branch).ThenInclude(b => b.Shop).Include(q => q.Service)
            .FirstOrDefaultAsync(q => q.Id == queueId, ct) ?? throw new KeyNotFoundException("Queue not found.");
        await EnsureBranchAccessAsync(userId, queue.BranchId, ct);
        if (!QueueStatuses.Contains(request.Status)) throw new InvalidOperationException("Invalid queue status.");
        queue.StatusId = (await GetStatusAsync("QUEUE_STATUS", request.Status.ToUpperInvariant(), ct)).Id;
        if (request.StaffId.HasValue && queue.Service != null)
            queue.AssignedStaffId = await ResolveStaffAsync(queue.Service, request.StaffId, ct);
        queue.UpdatedAt = DateTime.Now;
        queue.UpdatedBy = userId;
        await _db.SaveChangesAsync(ct);
        return await GetQueueByIdAsync(queue.Id, ct);
    }

    private async Task<ShopBranch> EnsureBranchOwnerAsync(int userId, int branchId, CancellationToken ct) =>
        await _db.ShopBranches.Include(b => b.Shop).FirstOrDefaultAsync(b => b.Id == branchId && b.Shop.OwnerId == userId, ct)
        ?? throw new UnauthorizedAccessException("Branch not found or access denied.");

    private async Task<ShopBranch> EnsureBranchAccessAsync(int userId, int branchId, CancellationToken ct) =>
        await _db.ShopBranches.Include(b => b.Shop).FirstOrDefaultAsync(b => b.Id == branchId
            && (b.Shop.OwnerId == userId || b.ShopStaffs.Any(s => s.UserId == userId && s.CanLogin && s.IsActive)), ct)
        ?? throw new UnauthorizedAccessException("Branch not found or access denied.");

    private async Task<Domain.Entities.Service> GetServiceAsync(int serviceId, int branchId, CancellationToken ct) =>
        await _db.Services.Include(s => s.ServiceStaffMaps).FirstOrDefaultAsync(s => s.Id == serviceId && s.BranchId == branchId && s.IsActive, ct)
        ?? throw new KeyNotFoundException("Active service not found.");

    private async Task<int?> ResolveStaffAsync(Domain.Entities.Service service, int? requestedStaffId, CancellationToken ct, int? queueSlotId = null)
    {
        string mode = (service.StaffSelectionMode ?? "OPTIONAL").ToUpperInvariant();
        if (mode == "AUTO") requestedStaffId = null;
        var eligible = _db.ShopStaffs.Where(s => s.BranchId == service.BranchId && s.IsActive && s.IsAvailable && s.CanServeQueues
            && s.ServiceStaffMaps.Any(m => m.ServiceId == service.Id)
            && (!queueSlotId.HasValue || !s.AssignedBookings.Any(b => b.QueueSlotId == queueSlotId.Value
                && b.Status.Code != "DONE" && b.Status.Code != "CANCELLED" && b.Status.Code != "NO_SHOW")));
        if (requestedStaffId.HasValue)
        {
            if (!await eligible.AnyAsync(s => s.Id == requestedStaffId.Value, ct))
                throw new InvalidOperationException("The selected staff member cannot provide this service.");
            return requestedStaffId;
        }
        if (mode == "REQUIRED") throw new InvalidOperationException("Please select a staff member for this service.");

        var candidates = await eligible.Select(s => new
        {
            s.Id,
            Load = s.AssignedBookings.Count(b => b.Status.Code != "DONE" && b.Status.Code != "CANCELLED" && b.Status.Code != "NO_SHOW")
                 + s.AssignedQueues.Count(q => q.Status.Code != "DONE" && q.Status.Code != "CANCELLED" && q.Status.Code != "SKIPPED")
        }).OrderBy(s => s.Load).ThenBy(s => s.Id).ToListAsync(ct);
        if (mode == "AUTO" && candidates.Count == 0) throw new InvalidOperationException("No staff member is currently available for this service.");
        return candidates.FirstOrDefault()?.Id;
    }

    private async Task<MasterStatus> GetStatusAsync(string type, string code, CancellationToken ct) =>
        await _db.MasterStatuses.FirstOrDefaultAsync(s => s.Type == type && s.Code == code, ct)
        ?? throw new InvalidOperationException($"Status {type}/{code} is not configured.");

    private IQueryable<Booking> BookingQuery() => _db.Bookings.AsNoTracking()
        .Include(b => b.BookingServices).ThenInclude(m => m.Service)
        .Include(b => b.QueueSlot).Include(b => b.User).Include(b => b.AssignedStaff).ThenInclude(s => s!.User).Include(b => b.Status);

    private async Task<BookingResponse> GetBookingByIdAsync(int id, CancellationToken ct) =>
        ToBookingResponse(await BookingQuery().SingleAsync(b => b.Id == id, ct));

    private IQueryable<Domain.Entities.Queue> QueueQuery() => _db.Queues.AsNoTracking()
        .Include(q => q.Service).Include(q => q.AssignedStaff).ThenInclude(s => s!.User).Include(q => q.Status);

    private async Task<QueueResponse> GetQueueByIdAsync(int id, CancellationToken ct) =>
        ToQueueResponse(await QueueQuery().SingleAsync(q => q.Id == id, ct));

    private static StaffResponse ToStaffResponse(ShopStaff s) => new()
    {
        Id = s.Id, ShopId = s.ShopId, BranchId = s.BranchId, UserId = s.UserId,
        Name = string.IsNullOrWhiteSpace(s.Name) ? s.User?.Name ?? string.Empty : s.Name,
        Email = s.Email ?? s.User?.Email, Phone = s.Phone ?? s.User?.Phone, Role = s.Role,
        CanServeQueues = s.CanServeQueues, CanLogin = s.CanLogin, IsAvailable = s.IsAvailable,
        IsActive = s.IsActive, ServiceIds = s.ServiceStaffMaps.Select(m => m.ServiceId).ToList()
    };

    private static BookingResponse ToBookingResponse(Booking b) => new()
    {
        Id = b.Id, Guid = b.Guid, BranchId = b.BranchId,
        ServiceId = b.BookingServices.Select(m => m.ServiceId).FirstOrDefault(),
        ServiceName = b.BookingServices.Select(m => m.Service.Name).FirstOrDefault() ?? string.Empty,
        QueueSlotId = b.QueueSlotId, Date = b.QueueSlot.Date, StartTime = b.QueueSlot.StartTime.ToString("HH:mm"),
        CustomerName = b.User.Name ?? b.User.Email ?? "Customer", StaffId = b.AssignedStaffId,
        StaffName = b.AssignedStaff == null ? null : (string.IsNullOrWhiteSpace(b.AssignedStaff.Name) ? b.AssignedStaff.User?.Name : b.AssignedStaff.Name), Status = b.Status.Code, Remark = b.Remark
    };

    private static QueueResponse ToQueueResponse(Domain.Entities.Queue q) => new()
    {
        Id = q.Id, Guid = q.Guid, BranchId = q.BranchId, QueueNumber = q.QueueNumber,
        ServiceId = q.ServiceId, ServiceName = q.Service == null ? null : q.Service.Name,
        CustomerName = q.CustomerName, StaffId = q.AssignedStaffId,
        StaffName = q.AssignedStaff == null ? null : (string.IsNullOrWhiteSpace(q.AssignedStaff.Name) ? q.AssignedStaff.User?.Name : q.AssignedStaff.Name),
        Status = q.Status.Code, Type = q.Type, CreatedAt = q.CreatedAt
    };
}
