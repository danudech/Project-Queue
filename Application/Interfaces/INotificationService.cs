using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetAsync(int userId, int limit, CancellationToken ct);
    Task<bool> MarkReadAsync(int userId, int notificationId, CancellationToken ct);
    Task<int> MarkAllReadAsync(int userId, CancellationToken ct);
}
