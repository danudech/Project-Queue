using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class NotificationService : INotificationService
{
    private readonly QueueDbContext _db;

    public NotificationService(QueueDbContext db) => _db = db;

    public async Task<List<NotificationResponse>> GetAsync(
        int userId,
        int limit,
        CancellationToken ct) =>
        await _db.Notifications.AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Take(Math.Clamp(limit, 1, 100))
            .Select(notification => new NotificationResponse
            {
                Id = notification.Id,
                Guid = notification.Guid,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                IsRead = notification.Status.Code == "READ",
                CreatedAt = notification.CreatedAt
            })
            .ToListAsync(ct);

    public async Task<bool> MarkReadAsync(
        int userId,
        int notificationId,
        CancellationToken ct)
    {
        var notification = await _db.Notifications
            .Include(item => item.Status)
            .SingleOrDefaultAsync(
                item => item.Id == notificationId && item.UserId == userId,
                ct);
        if (notification == null)
            throw new KeyNotFoundException("Notification not found.");
        if (notification.Status.Code == "READ") return true;
        notification.StatusId = await _db.MasterStatuses.AsNoTracking()
            .Where(status => status.Type == "NOTIFICATION_STATUS" && status.Code == "READ")
            .Select(status => status.Id)
            .SingleAsync(ct);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> MarkAllReadAsync(int userId, CancellationToken ct)
    {
        int readStatusId = await _db.MasterStatuses.AsNoTracking()
            .Where(status => status.Type == "NOTIFICATION_STATUS" && status.Code == "READ")
            .Select(status => status.Id)
            .SingleAsync(ct);
        return await _db.Notifications
            .Where(notification => notification.UserId == userId
                && notification.StatusId != readStatusId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    notification => notification.StatusId,
                    readStatusId),
                ct);
    }
}
