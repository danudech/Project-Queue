using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/notifications")]
public sealed class NotificationController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationController(INotificationService notifications) =>
        _notifications = notifications;

    [HttpGet]
    public Task<ActionResult<ApiResponse<List<NotificationResponse>>>> Get(
        [FromQuery] int limit = 20,
        CancellationToken ct = default) =>
        Execute(() => _notifications.GetAsync(UserId, limit, ct));

    [HttpPatch("{notificationId:int}/read")]
    public Task<ActionResult<ApiResponse<bool>>> MarkRead(
        int notificationId,
        CancellationToken ct) =>
        Execute(() => _notifications.MarkReadAsync(UserId, notificationId, ct));

    [HttpPatch("read-all")]
    public Task<ActionResult<ApiResponse<int>>> MarkAllRead(CancellationToken ct) =>
        Execute(() => _notifications.MarkAllReadAsync(UserId, ct));

    private int UserId => int.TryParse(User.FindFirst("uid")?.Value, out int value)
        ? value
        : throw new UnauthorizedAccessException("User id claim is missing.");

    private static async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action)
    {
        try { return new OkObjectResult(ApiResponse<T>.Ok(await action())); }
        catch (UnauthorizedAccessException ex)
        {
            return new ObjectResult(ApiResponse<T>.Fail(ex.Message)) { StatusCode = 403 };
        }
        catch (KeyNotFoundException ex)
        {
            return new NotFoundObjectResult(ApiResponse<T>.Fail(ex.Message));
        }
    }
}
