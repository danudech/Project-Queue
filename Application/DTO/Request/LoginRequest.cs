using System.ComponentModel.DataAnnotations;

namespace Queue.Application.DTO.Request;

public sealed class LoginRequest
{
    public string? EmailOrPhone { get; set; } = string.Empty;
    public string? Password { get; set; } = string.Empty;
}