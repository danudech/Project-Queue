public sealed class ShopCategoryRequest
{
    public int? Id { get; set; } = 0;
    public int? BranchId { get; set; } = 0;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}