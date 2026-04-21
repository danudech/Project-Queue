using System;

namespace Queue.Application.DTO.Response;

public class LoginResponse
{
    public UserResponse UserData { get; set; } = new UserResponse();
    public TokenResponse TokenData { get; set; } = new TokenResponse();
    public string? Message { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public bool IsChangPassword { get; set; } = false;
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string Session { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}