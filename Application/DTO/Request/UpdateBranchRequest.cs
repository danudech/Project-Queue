using System;

namespace Queue.Application.DTO.Request;

public sealed class UpdateBranchRequest
{
    public int BranchId { get; set; }
    public string? BranchName { get; set; }
    public string? BranchPhone { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsOnlineBookingEnabled { get; set; }
    public string? HouseNo { get; set; }
    public string? Street { get; set; }
    public int? SubdistrictId { get; set; }
    public string? Zipcode { get; set; }
}
