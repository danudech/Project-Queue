using Microsoft.AspNetCore.Http;
using Queue.Infrastructure.Identity.Jwt;
using Queue.Infrastructure.Persistence;
using Queue.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Queue.Infrastructure.Service;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Infrastructure.Service;

public sealed class RefreshToken
{
    private readonly AccessToken _accessToken;
    private readonly QueueDbContext _db;


    // ===== Cookie names (ตามที่คุณกำหนด) =====
    private const string ACCESS_COOKIE = "access_token";
    private const string REFRESH_COOKIE = "refresh_token";
    private const string SESSION_COOKIE = "session_key";

    public RefreshToken(AccessToken accessToken, QueueDbContext db)
    {
        _accessToken = accessToken;
        _db = db;
    }
    public (string hash, string salt) Hash(string raw)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);

        using var sha = SHA256.Create();
        var rawBytes = Encoding.UTF8.GetBytes(raw);

        var combined = new byte[saltBytes.Length + rawBytes.Length];
        Buffer.BlockCopy(saltBytes, 0, combined, 0, saltBytes.Length);
        Buffer.BlockCopy(rawBytes, 0, combined, saltBytes.Length, rawBytes.Length);

        var hashBytes = sha.ComputeHash(combined);
        return (Convert.ToHexString(hashBytes), salt);
    }

    public bool Verify(string raw, string expectedHashHex, string saltBase64)
    {
        var saltBytes = Convert.FromBase64String(saltBase64);

        using var sha = SHA256.Create();
        var rawBytes = Encoding.UTF8.GetBytes(raw);

        var combined = new byte[saltBytes.Length + rawBytes.Length];
        Buffer.BlockCopy(saltBytes, 0, combined, 0, saltBytes.Length);
        Buffer.BlockCopy(rawBytes, 0, combined, saltBytes.Length, rawBytes.Length);

        var hashBytes = sha.ComputeHash(combined);
        var expectedBytes = Convert.FromHexString(expectedHashHex);

        return CryptographicOperations.FixedTimeEquals(hashBytes, expectedBytes);
    }

    public async Task<(bool status, string message, string refreshToken)> UserHasConsent(HttpContext httpContext, string ip, string userAgent, CancellationToken ct)
    {
        string? refreshToken = GetCookie(httpContext, REFRESH_COOKIE);
        string? sessionKey = GetCookie(httpContext, SESSION_COOKIE);
        string? accessToken = GetCookie(httpContext, ACCESS_COOKIE);

        if (string.IsNullOrWhiteSpace(refreshToken))
            return (false, "refresh token is required", "");

        if (string.IsNullOrWhiteSpace(sessionKey))
            return (false, "session key is required", "");

        UserSession? session = await _db.UserSessions
            .FirstOrDefaultAsync(x => x.Session == sessionKey, ct);

        if (session == null)
            return (false, "invalid refresh token", "");

        if (session.ExpiredAt <= DateTime.UtcNow || session.RefreshTokenExpiredAt <= DateTime.UtcNow)
            return (false, "refresh token has expired please login again", "");

        bool isVerify = session.RefreshSalt != null && Verify(refreshToken, session.RefreshToken ?? "", session.RefreshSalt);

        if (!isVerify)
            return (false, "refresh token is invalid please login again", "");

        return (true, "consent given", refreshToken);
    }

    public async Task<(TokenResponse, string?)> UserRefreshAccessTokenAsync(HttpContext httpContext, CancellationToken ct = default)
    {
        string? refreshToken = httpContext.Request.Cookies[REFRESH_COOKIE];
        string? sessionKey = httpContext.Request.Cookies[SESSION_COOKIE];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return (new TokenResponse(), "refresh token is required");
        }

        if (string.IsNullOrWhiteSpace(sessionKey))
        {
            return (new TokenResponse(), "session key is required");
        }

        string refreshHash = _accessToken.Sha256(refreshToken);

        UserSession? session = await _db.UserSessions
            .AsNoTracking()
            .Include(c => c.User)
            .FirstOrDefaultAsync(x => x.Session == sessionKey, ct);

        if (session is null)
        {
            return (new TokenResponse(), "invalid refresh token");
        }

        if (session.RefreshTokenExpiredAt <= DateTime.UtcNow)
        {
            return (new TokenResponse(), "refresh token has expired");
        }
        if (session.ExpiredAt <= DateTime.UtcNow)
        {
            return (new TokenResponse(), "session has expired");
        }

        User? _user = _db.Users.Include(c => c.UserRoleMaps).ThenInclude(ur => ur.Role).FirstOrDefault(x => x.Id == session.UserId);

        string username = _user?.Email ?? _user?.Phone ?? "unknown";
        string role = _user?.UserRoleMaps.FirstOrDefault()?.RoleId.ToString() ?? "";
        string name = _user?.Name ?? "";
        string[] permissions = _user?.UserRoleMaps.Select(ur => ur.Role.Name).ToArray() ?? Array.Empty<string>();

        var (newAccessToken, accessExpiresAtUtc) = _accessToken.CreateAccessToken(
            (int)session.UserId,
            username,
            role,
            name,
            permissions
        );

        return (new TokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = accessExpiresAtUtc,
            Session = sessionKey
        }, null);
    }

    private string? GetCookie(HttpContext httpContext, string key)
    {
        var cookies = httpContext.Request.Cookies;

        if (cookies == null)
            return null;

        cookies.TryGetValue(key, out var cookievalue);
        return cookievalue;
    }
}