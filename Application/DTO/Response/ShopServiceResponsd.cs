public class ShopServiceResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ShopId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public int Duration { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}