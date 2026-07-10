using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Queue.Application.DTO.Request;

public sealed class UpdateProfileRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    public IFormFile? ProfilePicture { get; set; }
}
