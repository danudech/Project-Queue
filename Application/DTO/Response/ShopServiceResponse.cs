public class ShopServiceResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int ShopId { get; set; }
    public int? BranchId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public int Duration { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; }
    public string StaffSelectionMode { get; set; } = "OPTIONAL";
    public List<int> StaffIds { get; set; } = new();
    public int? SlotInterval { get; set; }
    public int? AdvanceBookingWindow { get; set; }
    public int? BufferBetweenServices { get; set; }
    public DateTime CreatedAt { get; set; }
}
