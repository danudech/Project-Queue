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

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Authentication : IAuthentication
{
    private readonly IActionLog _actionLog;
    private readonly AccessToken _accessToken;
    private readonly QueueDbContext _db;
    private readonly RefreshToken _refreshToken;

    private readonly ICrudService _crud;

    public Authentication(IActionLog actionLog, AccessToken accessToken, QueueDbContext db, RefreshToken refreshToken, ICrudService crud)

    {
        _actionLog = actionLog;
        _accessToken = accessToken;
        _db = db;
        _refreshToken = refreshToken;
        _crud = crud;

    }

    public async Task<LoginResponse?> Login(string EmailOrPhone, string password, string ip, string ua, CancellationToken ct)
    {
        _actionLog.Info("Login attempt for user {EmailOrPhone}", EmailOrPhone);

        User? user = await _db.Users
                            .Include(c => c.UserAuthentications)
                            .Include(c => c.Roles)
                            .Include(c => c.UserSessions)
                            .Include(c => c.Status)
                            .FirstOrDefaultAsync(u => u.Email == EmailOrPhone || u.Phone == EmailOrPhone, ct);

        if (user == null || user.StatusId != 1)
        {
            _actionLog.Warning("Login failed for user {EmailOrPhone}: user not found or inactive", EmailOrPhone);
            return new LoginResponse { Message = "invalid email/phone or password" };
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

        // 4. ดึงสิทธิ์/บทบาท (Roles) ของ User (อันนี้ผมเขียนเผื่อไว้ให้ครับ ถ้าไม่มีคลาสนี้ก็ปรับแก้ได้)
        // สมมติว่าดึง Role แรกมาใช้เป็น Role หลัก
        UserRole? roleRecord = user.Roles.FirstOrDefault();

        string role = roleRecord?.Id.ToString() ?? "";
        string name = user.Name;
        string[] permissions = user.Roles.Select(c => c.Name).ToArray();

        // 5. สร้าง Tokens
        var (token, expUtc) = _accessToken.CreateAccessToken((int)(user?.Id ?? 0), EmailOrPhone, role, name, permissions);
        string refreshRaw = _accessToken.GenerateRefreshToken();
        var (refreshHash, refreshSalt) = _refreshToken.Hash(refreshRaw);
        string sessionKey = Guid.NewGuid().ToString("N");

        // 6. บันทึก Session ลง Database เพื่อให้เราสามารถตรวจสอบหรือเตะ (Force Logout) เครื่องนี้ได้ในอนาคต
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

        // 7. อัปเดตเวลาเข้าสู่ระบบล่าสุด (LastLoginAt)
        authInfo.LastLoginAt = DateTime.UtcNow;

        // บันทึกการเปลี่ยนแปลงทั้งหมดลง Database
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
                Role = roleRecord?.Name ?? string.Empty,
                ProfilePictureUrl = ""
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
