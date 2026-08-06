using Microsoft.AspNetCore.Http;

namespace Queue.Application.DTO.Request;

public sealed class UpdateShopRequest
{
    public IFormFile? Logo { get; set; }
    public string? LogoPosition { get; set; }
    public IFormFile? Cover { get; set; }
    public string? CoverPosition { get; set; }
    public bool? IsActive { get; set; }
    public int? BranchId { get; set; }
    public string? Description { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public int? TypeId { get; set; }
}
