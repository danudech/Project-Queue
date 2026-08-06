namespace Queue.Application.DTO.Response;

public sealed class StaffResponse
{
    public int Id { get; set; }
    public int ShopId { get; set; }
    public int BranchId { get; set; }
    public int? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? SystemRoleCode { get; set; }
    public bool CanServeQueues { get; set; }
    public bool CanLogin { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsActive { get; set; }
    public bool? EmailConfirmed { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool HasCustomProfilePicture { get; set; }
    public List<int> ServiceIds { get; set; } = new();
}

public sealed class BookingResponse
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public int BranchId { get; set; }
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int QueueSlotId { get; set; }
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public int? StaffId { get; set; }
    public string? StaffName { get; set; }
    public int? QueueId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remark { get; set; }
}

public sealed class QueueResponse
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public int BranchId { get; set; }
    public int? BookingId { get; set; }
    public int QueueNumber { get; set; }
    public int? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public DateTime? QueueDate { get; set; }
    public string? QueueStartTime { get; set; }
    public int? StaffId { get; set; }
    public string? StaffName { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public sealed class AvailableSlotResponse
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int Remaining { get; set; }
    public List<int> AvailableStaffIds { get; set; } = new();
}
