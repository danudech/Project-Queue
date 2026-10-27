namespace Queue.Application.DTO.Request;

public sealed class CreateShopAdminRequest
{
    public string Name { get; set; } = null!;
    public string OwnerName { get; set; } = null!;
    public string? OwnerEmail { get; set; }
    public int Branches { get; set; } = 1;
    public string Plan { get; set; } = "Standard";
    public string Status { get; set; } = "Active";
}

public sealed class CreateUserAdminRequest
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = "Admin";
    public string? ShopName { get; set; }
    public string Status { get; set; } = "Active";
}

public sealed class UpdateStatusAdminRequest
{
    public string Status { get; set; } = "Active";
}

public sealed class UpdateSettingAdminRequest
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string? Scope { get; set; }
}
