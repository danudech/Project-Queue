using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Queue.Infrastructure.Identity.Jwt;

public sealed class AccessToken
{
    private readonly ReadJwtConfig _jwtConfig;

    public AccessToken(ReadJwtConfig jwtConfig)
    {
        _jwtConfig = jwtConfig;
    }

    public (string Token, DateTime ExpiresAtUtc) CreateAccessToken(
        int userId,
        string username,
        string role,
        string name,
        string[] permissions)
    {
        string issuer = _jwtConfig.Issuer;
        string audience = _jwtConfig.Audience;
        string signKey = _jwtConfig.SignKey;
        byte[] encKeyBytes = _jwtConfig.EncKeyBytes;
        int mins = _jwtConfig.AccessMins;

        var claims = new List<Claim>
        {
            new("uid", userId.ToString()),
            new("un", username),
            new(ClaimTypes.Role, role),
            new(ClaimTypes.Name, name),
            new("permissions", string.Join(",", permissions))
        };

        var expires = DateTime.UtcNow.AddMinutes(mins);

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signKey)),
            SecurityAlgorithms.HmacSha256
        );

        var encryptingCredentials = new EncryptingCredentials(
            new SymmetricSecurityKey(encKeyBytes),
            SecurityAlgorithms.Aes256KeyWrap,
            SecurityAlgorithms.Aes256CbcHmacSha512
        );

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = issuer,
            Audience = audience,
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            SigningCredentials = signingCredentials,
            EncryptingCredentials = encryptingCredentials
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(descriptor);
        return (handler.WriteToken(token), expires);
    }

    public ClaimsPrincipal ValidateAndDecrypt(string token, out SecurityToken validatedToken)
    {
        string issuer = _jwtConfig.Issuer;
        string audience = _jwtConfig.Audience;
        string signKey = _jwtConfig.SignKey;
        byte[] encKeyBytes = _jwtConfig.EncKeyBytes;

        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,

            ValidateAudience = true,
            ValidAudience = audience,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signKey)),

            TokenDecryptionKey = new SymmetricSecurityKey(encKeyBytes),
        };

        var handler = new JwtSecurityTokenHandler();
        return handler.ValidateToken(token, parameters, out validatedToken);
    }

    public static (int UserId, string Username) ExtractUser(ClaimsPrincipal principal)
    {
        var uidRaw = principal.FindFirstValue("uid") ?? throw new Exception("uid claim missing");
        var un = principal.FindFirstValue("un") ?? throw new Exception("un claim missing");
        return (int.Parse(uidRaw), un);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        return Convert.ToBase64String(bytes);
    }

    public string Sha256(string raw)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(bytes);
    }
}
