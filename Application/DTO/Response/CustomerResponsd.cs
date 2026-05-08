using Queue.Domain.Entities;

public class CustomerResponse
{
    public int Id { get; set; }
    public int ShopId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<CustomerTag> Tags { get; set; } = new List<CustomerTag>();
    public List<CustomerNote> Notes { get; set; } = new List<CustomerNote>();
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}