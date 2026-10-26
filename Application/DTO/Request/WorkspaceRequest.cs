using System.ComponentModel.DataAnnotations;

namespace Queue.Application.DTO.Request;

public sealed class WorkspaceRequest
{
    [Range(1, int.MaxValue)] public int ShopId { get; set; }
    [Required] public string Module { get; set; } = "";
    public int? Id { get; set; }
    public int? BranchId { get; set; }
    [MaxLength(100)] public string Name { get; set; } = "";
    [MaxLength(5)] public string Prefix { get; set; } = "";
    [MaxLength(500)] public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool Delete { get; set; }
    public int? CustomerId { get; set; }
    public int? BookingId { get; set; }
    public int? TagId { get; set; }
    public int? CategoryId { get; set; }
}

