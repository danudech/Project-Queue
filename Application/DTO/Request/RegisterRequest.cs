using System.ComponentModel.DataAnnotations;

namespace Queue.Application.DTO.Request;

public sealed class RegisterRequest
{
    [Required]
    public string? Name { get; set; } = string.Empty;
    [Required]
    public string? Email { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;

    [Required]
    public string? Password { get; set; } = string.Empty;

}