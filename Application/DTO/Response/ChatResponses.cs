namespace Queue.Application.DTO.Response;

public sealed class ChatConversationResponse
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public int BranchId { get; set; }
    public Guid? BookingGuid { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public bool CustomerEmailVerified { get; set; }
    public string? CustomerAvatarUrl { get; set; }
    public string? LastMessage { get; set; }
    public DateTime LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public string? AccessToken { get; set; }
    public string Status { get; set; } = "PENDING";
    public bool CanSend { get; set; }
    public int? AssignedStaffUserId { get; set; }
}

public sealed class ChatMessageResponse
{
    public int Id { get; set; }
    public string SenderType { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsMine { get; set; }
}
