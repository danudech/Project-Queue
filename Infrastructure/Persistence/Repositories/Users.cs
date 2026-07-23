

using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Identity.Security;
using Queue.Infrastructure.Service;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Users : IUsers
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly IEmailService _emailService;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;
    private readonly Microsoft.Extensions.Hosting.IHostEnvironment _env;

    public Users(IActionLog actionLog, QueueDbContext db, IEmailService emailService, ICrudService crud, IConfiguration config, Microsoft.Extensions.Hosting.IHostEnvironment env)
    {
        _actionLog = actionLog;
        _db = db;
        _emailService = emailService;
        _config = config;
        _crud = crud;
        _env = env;
    }

    public async Task<RegisterResponse?> LocalRegister(RegisterRequest data, string originUrl, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Registration attempt for user {EmailOrPhone}", data.Email ?? data.Phone ?? "unknown");

        User? user = await _db.Users
                            .Include(c => c.UserAuthentications)
                            .Include(c => c.UserRoleMaps)
                                .ThenInclude(ur => ur.Role)
                            .Include(c => c.UserSessions)
                            .Include(c => c.Status)
                            .FirstOrDefaultAsync(u => u.Email == data.Email || u.Phone == data.Phone, ct);
        if (user != null)
        {
            _actionLog.Warning("Registration failed for user {EmailOrPhone}: User already exists", data.Email ?? data.Phone ?? "unknown");
            return new RegisterResponse { Message = "User already exists. Please use a different email or phone number." };
        }

        if (data.Name == null || data.Email == null)
        {
            _actionLog.Warning("Registration failed for user {EmailOrPhone}: Missing required fields", data.Email ?? data.Phone ?? "unknown");
            return new RegisterResponse { Message = "Name and Email are required fields. Please provide both." };
        }

        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            Role? adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin", ct);

            User _newUser = new User
            {
                Guid = Guid.NewGuid(),
                Name = data.Name,
                Email = data.Email,
                Phone = data.Phone ?? string.Empty,
                StatusId = 1,
                EmailConfirmed = false,
                CreatedAt = DateTime.UtcNow,
                UserRoleMaps = new List<UserRoleMap>
                    {
                        new UserRoleMap
                        {
                            RoleId = adminRole?.Id ?? 1
                        }
                    }
            };

            await _crud.InsertAsync(_newUser, ct);

            string token = Guid.NewGuid().ToString("N");
            string tokenHash = Crypto.HashPassword(token);

            EmailConfirmation mailConfirmation = new EmailConfirmation
            {
                UserId = _newUser.Id,
                Token = token,
                TokenHash = tokenHash,
                ExpiredAt = DateTime.UtcNow.AddHours(24),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _crud.InsertAsync(mailConfirmation, ct);

            await transaction.CommitAsync(ct);
            string appUrl = !string.IsNullOrEmpty(originUrl) ? originUrl : _config["AppSettings:AppUrl"] ?? "http://localhost:3000";
            string currentLocale = data.locale ?? "en";
            string confirmationLink = $"{appUrl}/{currentLocale}/auth/mail-verify?token={token}";

            await _emailService.SendConfirmationEmailAsync(_newUser.Email, _newUser.Name, confirmationLink);

            _actionLog.Info("User {Email} registered and confirmation email sent.", _newUser.Email);

            return new RegisterResponse { Success = true, Code = "success", Message = "Registration successful. Please check your email." };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            _actionLog.Error(ex, "Registration failed: {Message}", ex.Message);
            return new RegisterResponse { Success = false, Code = "error", Message = "An error occurred during registration." };
        }
    }

    public async Task<UserResponse?> GetUserById(int userId, string ip, string userAgent, CancellationToken ct)
    {
        User? user = await _db.Users
            .Include(c => c.UserAuthentications)
            .Include(c => c.UserImages)
            .Include(c => c.UserRoleMaps)
                .ThenInclude(ur => ur.Role)
            .Include(c => c.UserSessions)
            .Include(c => c.Status)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return null;


        return new UserResponse
        {
            Id = user?.Id ?? 0,
            Name = user?.Name ?? string.Empty,
            Email = user?.Email ?? string.Empty,
            Phone = user?.Phone ?? string.Empty,
            Status = user?.Status.NameTh ?? "",
            Role = user?.UserRoleMaps.FirstOrDefault()?.Role.Name ?? string.Empty,
            ProfilePictureUrl = user?.UserImages.FirstOrDefault(ui => ui.IsPrimary)?.FileUrl ?? string.Empty,
            IsChangPassword = user?.UserAuthentications.Any(a => a.LastLoginAt == null) ?? false
        };
    }

    public async Task GetForgotPasswordRequestByEmail(ForgotPasswordRequest data, string originUrl, string ip, string userAgent, CancellationToken ct)
    {
        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == data.Email, ct);
        if (user == null || user.Email == null || user.Name == null) return;
        string token = Guid.NewGuid().ToString("N");
        string tokenHash = Crypto.HashPassword(token);

        EmailConfirmation mailConfirmation = new EmailConfirmation
        {
            UserId = user.Id,
            Token = token,
            TokenHash = tokenHash,
            ExpiredAt = DateTime.UtcNow.AddHours(24),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _crud.InsertAsync(mailConfirmation, ct);

        await transaction.CommitAsync(ct);
        string appUrl = !string.IsNullOrEmpty(originUrl) ? originUrl : _config["AppSettings:AppUrl"] ?? "http://localhost:3000";
        string currentLocale = data.locale ?? "en";
        string confirmationLink = $"{appUrl}/{currentLocale}/auth/mail-verify?token={token}";

        await _emailService.SendForgotPasswordEmailAsync(user.Email, user.Name, confirmationLink);
    }

    public async Task ResentConfirmationEmail(RegisterRequest data, string originUrl, string ip, string userAgent, CancellationToken ct)
    {
        User? user = await _db.Users.FirstOrDefaultAsync(u => u.Email == data.Email, ct);
        if (user == null || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Name)) return;

        EmailConfirmation? existingConfirmation = await _db.EmailConfirmations
            .Where(c => c.UserId == user.Id && !c.IsUsed && c.ExpiredAt > DateTime.UtcNow)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (existingConfirmation != null)
        {
            string appUrl = !string.IsNullOrEmpty(originUrl) ? originUrl : _config["AppSettings:AppUrl"] ?? "http://localhost:3000";
            string currentLocale = data.locale ?? "en";
            string confirmationLink = $"{appUrl}/{currentLocale}/auth/mail-verify?token={existingConfirmation.Token}";

            await _emailService.SendConfirmationEmailAsync(user.Email, user.Name, confirmationLink);
        }
    }

    public async Task<bool?> ConfirmEmail(VerifyAccountRequest data, string ip, string userAgent, CancellationToken ct)
    {
        var confirmation = await _db.EmailConfirmations
            .FirstOrDefaultAsync(c => c.Token == data.Token && !c.IsUsed && c.ExpiredAt > DateTime.UtcNow, ct);

        if (confirmation == null) return false;

        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            confirmation.IsUsed = true;
            confirmation.ConfirmedAt = DateTime.UtcNow;

            var user = await _db.Users.Include(a => a.UserAuthentications).FirstOrDefaultAsync(u => u.Id == confirmation.UserId, ct);
            if (user == null || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Name)) return false;
            string tempPassword = Guid.NewGuid().ToString("N").Substring(0, 8);

            user.EmailConfirmed = true;
            await _crud.UpdateAsync(user, ct);
            if (user.UserAuthentications.Any())
            {
                user.UserAuthentications.First().PasswordHash = Crypto.HashPassword(tempPassword);
                user.UserAuthentications.First().LastLoginAt = null;
                await _crud.UpdateAsync(user.UserAuthentications.First(), ct);
            }
            else
            {
                UserAuthentication auth = new UserAuthentication
                {
                    UserId = user.Id,
                    Provider = "local",
                    ProviderId = "User",
                    PasswordHash = Crypto.HashPassword(tempPassword)
                };

                await _crud.InsertAsync(auth, ct);
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            await _emailService.SendPasswordEmailAsync(user.Email, user.Name, tempPassword);

            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(ct);
            return false;
        }
    }

    public async Task<bool?> ResetPassword(int userId, string newPassword, string ip, string userAgent, CancellationToken ct)
    {
        var user = await _db.Users.Include(a => a.UserAuthentications).FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return false;

        var auth = user.UserAuthentications.FirstOrDefault(a => a.ProviderId == "User");
        if (auth == null) return false;

        auth.PasswordHash = Crypto.HashPassword(newPassword);
        auth.LastLoginAt = DateTime.UtcNow;
        await _crud.UpdateAsync(auth, ct);

        return true;
    }

    public async Task<bool> UpdateProfile(int userId, UpdateProfileRequest data, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.UserImages)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return false;

        user.Name = data.Name;
        user.Phone = data.Phone ?? string.Empty;
        user.UpdatedAt = DateTime.UtcNow;

        if (data.ProfilePicture != null && data.ProfilePicture.Length > 0)
        {
            var oldImages = user.UserImages.Where(ui => ui.IsPrimary).ToList();
            foreach (var oldImage in oldImages)
            {
                if (!string.IsNullOrEmpty(oldImage.FileUrl))
                {
                    var oldFilePath = Path.Combine(_env.ContentRootPath, "wwwroot", oldImage.FileUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
                await _crud.DeleteAsync(oldImage, ct);
            }

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{data.ProfilePicture.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await data.ProfilePicture.CopyToAsync(stream, ct);
            }

            var newImage = new UserImage
            {
                UserId = user.Id,
                FileUrl = $"/uploads/profiles/{uniqueFileName}",
                FileName = data.ProfilePicture.FileName,
                ContentType = data.ProfilePicture.ContentType,
                FileSize = data.ProfilePicture.Length,
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            };
            await _crud.InsertAsync(newImage, ct);
        }

        await _crud.UpdateAsync(user, ct);
        return true;
    }

    public async Task<bool> DeleteUser(int userId, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.UserImages)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return false;

        foreach (var img in user.UserImages)
        {
            if (!string.IsNullOrEmpty(img.FileUrl))
            {
                var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", img.FileUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        await _crud.DeleteAsync(user, ct);
        return true;
    }
}