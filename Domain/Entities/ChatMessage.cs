namespace Queue.Domain.Entities;

public partial class ChatMessage
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public int ConversationId { get; set; }
    public int? SenderUserId { get; set; }
    public string SenderType { get; set; } = null!;
    public string Body { get; set; } = null!;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public virtual ChatConversation Conversation { get; set; } = null!;
    public virtual User? SenderUser { get; set; }
}
