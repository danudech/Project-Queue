using System.ComponentModel.DataAnnotations;

namespace Queue.Application.DTO.Request;

public sealed class RegisterRequest
{
    [Required]
    public string locale { get; set; } = "en";
    [Required]
    public string? Name { get; set; } = string.Empty;
    [Required]
    public string? Email { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    [Required]
    public bool AcceptTerms { get; set; } = false;

}
public sealed class VerifyAccountRequest
{
    [Required]
    public string? Token { get; set; } = string.Empty;
}

public sealed class ResetPasswordRequest
{
    [Required]
    public string? NewPassword { get; set; } = string.Empty;
}

public sealed class ForgotPasswordRequest
{
    [Required]
    public string? Email { get; set; } = string.Empty;
    [Required]
    public string locale { get; set; } = "en";
}