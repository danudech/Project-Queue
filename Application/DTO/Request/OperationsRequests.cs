namespace Queue.Application.DTO.Request;

using Microsoft.AspNetCore.Http;

public sealed class StaffUpsertRequest
{
    public int? Id { get; set; }
    public int ShopId { get; set; }
    public int BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; } = "STAFF";
    public string? SystemRoleCode { get; set; }
    public bool CanServeQueues { get; set; } = true;
    public bool CanLogin { get; set; }
    public bool IsAvailable { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public List<int> ServiceIds { get; set; } = new();
}

public sealed class StaffInviteRequest
{
    public int StaffId { get; set; }
    public string Locale { get; set; } = "en";
}

public sealed class StaffPhotoRequest
{
    public IFormFile? ProfilePicture { get; set; }
}

public sealed class CreateBookingRequest
{
    public int BranchId { get; set; }
    public int ServiceId { get; set; }
    public int QueueSlotId { get; set; }
    public int? StaffId { get; set; }
    public string? Remark { get; set; }
}

public sealed class CreateQueueRequest
{
    public int BranchId { get; set; }
    public int ServiceId { get; set; }
    public int? StaffId { get; set; }
    public string? CustomerName { get; set; }
    public string Type { get; set; } = "WALK_IN";
}

public sealed class UpdateOperationStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public int? StaffId { get; set; }
}
