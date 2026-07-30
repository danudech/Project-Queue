namespace Queue.Application.DTO.Response;

public sealed class PermissionCatalogResponse
{
    public string Code { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
}

public sealed class ShopRoleResponse
{
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public bool IsSystem { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public List<string> PermissionCodes { get; set; } = new();
}
