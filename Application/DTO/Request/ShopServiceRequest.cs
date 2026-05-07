public sealed class ShopServiceRequest
{
    public int? Id { get; set; } = 0;
    public string Name { get; set; } = string.Empty;
    public int ShopId { get; set; } = 0;
    public int Duration { get; set; } = 0;
    public decimal Price { get; set; } = 0M;
    public int CategoryId { get; set; } = 0;
    public bool IsActive { get; set; } = false;
}