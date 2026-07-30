namespace Queue.Application.DTO.Response;

public sealed class NotificationResponse
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
