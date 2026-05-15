public class ShopCategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ShopId { get; set; }
    public int? BranchId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}