using Queue.Domain.Entities;

public class ShopResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PublicSlug { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int Status { get; set; } = 0;
    public int OwnerId { get; set; } = 0;
    public List<ShopBusinessHour>? ShopHours { get; set; } = new List<ShopBusinessHour>();
    public List<ShopHoliday>? ShopHolidays { get; set; } = new List<ShopHoliday>();
    public List<BranchDto>? ShopBranches { get; set; } = new List<BranchDto>();
    public List<Service>? Services { get; set; } = new List<Service>();
    public bool IsActive { get; set; } = true;
    public string? Logo { get; set; }
    public string? Description { get; set; }
    public string? Email { get; set; }
}

public class BranchDto
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public Guid PublicBookingId { get; set; }
    public bool IsOnlineBookingEnabled { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public AddressDto? Address { get; set; }
    public List<ShopBusinessHour>? BusinessHours { get; set; } = new List<ShopBusinessHour>();
}

public class AddressDto
{
    public string HouseNo { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Subdistrict { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string Zipcode { get; set; } = string.Empty;
    public string FullAddress =>
        $"{HouseNo} {Street} {Subdistrict} {District} {Province} {Zipcode}".Trim();
}
