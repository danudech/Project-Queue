namespace Queue.Application.DTO.Request;

public sealed class RoleUpsertRequest
{
    public int ShopId { get; set; }
    public string? Code { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Scope { get; set; } = "Branch";
    public bool IsActive { get; set; } = true;
    public List<string> PermissionCodes { get; set; } = new();
}

public sealed class StaffRoleAssignmentRequest
{
    public int ShopId { get; set; }
    public int BranchId { get; set; }
    public string RoleCode { get; set; } = "Staff";
}
