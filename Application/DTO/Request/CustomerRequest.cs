using Queue.Domain.Entities;

public sealed class CustomerRequest
{
    public int? Id { get; set; } = 0;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
    public int ShopId { get; set; } = 0;
    public List<CustomerTag> Tags { get; set; } = new List<CustomerTag>();
    public List<CustomerNote> Notes { get; set; } = new List<CustomerNote>();

}
