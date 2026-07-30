using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog;
using Queue.Application.Interfaces;
using Queue.Application.DTO.Response;
using Queue.Infrastructure.Identity.Security;
using Queue.Infrastructure.Identity.Jwt;
using Queue.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Authentication : IAuthentication
{
    private readonly IActionLog _actionLog;
    private readonly AccessToken _accessToken;
    private readonly QueueDbContext _db;
    private readonly RefreshToken _refreshToken;
    private readonly RoleClaimsService _roleClaims;

    private readonly ICrudService _crud;

    public Authentication(IActionLog actionLog, AccessToken accessToken, QueueDbContext db, RefreshToken refreshToken, ICrudService crud, RoleClaimsService roleClaims)

    {
        _actionLog = actionLog;
        _accessToken = accessToken;
        _db = db;
        _refreshToken = refreshToken;
        _crud = crud;
        _roleClaims = roleClaims;

    }

    public async Task<LoginResponse?> Login(string EmailOrPhone, string password, string ip, string ua, CancellationToken ct)
    {
        _actionLog.Info("Login attempt for user {EmailOrPhone}", EmailOrPhone);

        User? user = await _db.Users
                            .Include(c => c.UserAuthentications)
                            .Include(c => c.UserRoleMaps)
                                .ThenInclude(ur => ur.Role)
                            .Include(c => c.UserSessions)
                            .Include(c => c.Status)
                            .FirstOrDefaultAsync(u => u.Email == EmailOrPhone || u.Phone == EmailOrPhone, ct);

        if (user == null || user.StatusId != 1)
        {
            _actionLog.Warning("Login failed for user {EmailOrPhone}: user not found or inactive", EmailOrPhone);
            return new LoginResponse { Message = "invalid email/phone or password" };
        }

        if (user.EmailConfirmed == false)
        {
            _actionLog.Warning("Login failed for user {EmailOrPhone}: email not confirmed", EmailOrPhone);
            return new LoginResponse { Message = "email not confirmed. Please confirm your email before logging in." };
        }

        UserAuthentication? authInfo = user.UserAuthentications.FirstOrDefault();
        if (authInfo == null || string.IsNullOrEmpty(authInfo.PasswordHash))
        {
            _actionLog.Warning("Login failed for user {EmailOrPhone}: no authentication record found", EmailOrPhone);
            return new LoginResponse { Message = "invalid email/phone or password" };
        }

        string encPass = Crypto.HashPassword(password);
        bool ok = Crypto.VerifyPassword(password, authInfo.PasswordHash);
        if (!ok)
        {
            _actionLog.Warning("Login failed for user {EmailOrPhone}: password verify failed", EmailOrPhone);
            return new LoginResponse { Message = "invalid email/phone or password" };
        }
        
        var roleClaims = await _roleClaims.ResolveAsync(user.Id, ct);
        string role = roleClaims.Role;
        string name = user.Name ?? string.Empty;
        string[] permissions = roleClaims.Permissions;

        var (token, expUtc) = _accessToken.CreateAccessToken((int)(user?.Id ?? 0), EmailOrPhone, role, name, permissions);
        string refreshRaw = _accessToken.GenerateRefreshToken();
        var (refreshHash, refreshSalt) = _refreshToken.Hash(refreshRaw);
        string sessionKey = Guid.NewGuid().ToString("N");

        UserSession session = new UserSession
        {
            UserId = user?.Id ?? 0,
            Session = sessionKey,
            Token = token,
            RefreshToken = refreshHash,
            RefreshSalt = refreshSalt,
            RefreshTokenExpiredAt = DateTime.UtcNow.AddDays(30),
            ExpiredAt = DateTime.UtcNow.AddDays(30),
        };
        await _db.UserSessions.AddAsync(session, ct);

        if (authInfo.LastLoginAt != null) authInfo.LastLoginAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        _actionLog.Info("User {EmailOrPhone} logged in from IP {IP} with UA {UA}", EmailOrPhone, ip, ua);

        return new LoginResponse
        {
            UserData = new UserResponse
            {
                Id = user?.Id ?? 0,
                Name = name,
                Email = user?.Email ?? string.Empty,
                Phone = user?.Phone ?? string.Empty,
                Status = user?.Status.NameTh ?? "",
                Role = role,
                Permissions = permissions,
                ProfilePictureUrl = "",
                IsChangPassword = authInfo.LastLoginAt == null
            },
            TokenData = new TokenResponse
            {
                AccessToken = token,
                RefreshToken = refreshRaw,
                ExpiresAtUtc = expUtc,
                Session = sessionKey
            },
        };
    }
}
