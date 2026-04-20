

using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Request;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class Users : IUsers
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;

    private readonly ICrudService _crud;

    public Users(IActionLog actionLog, QueueDbContext db, ICrudService crud)

    {
        _actionLog = actionLog;
        _db = db;
        _crud = crud;

    }

    public async Task<RegisterResponse?> Register(RegisterRequest data, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Registration attempt for user {EmailOrPhone}", data.Email ?? data.Phone ?? "unknown");

        User? user = await _db.Users
                            .Include(c => c.UserAuthentications)
                            .Include(c => c.Roles)
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



        User _newUser = new User
        {
            Guid = Guid.NewGuid(),
            Name = data.Name,
            Email = data.Email,
            Phone = data.Phone ?? string.Empty,
            StatusId = 1,
            EmailConfirmed = false,
            CreatedAt = DateTime.UtcNow
        };

        return new RegisterResponse { Success = true, Message = "This is a placeholder response. Implement the registration logic here." };
    }
}