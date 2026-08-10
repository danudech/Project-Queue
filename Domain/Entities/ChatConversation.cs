namespace Queue.Domain.Entities;

public partial class ChatConversation
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public int BranchId { get; set; }
    public int? BookingId { get; set; }
    public int? CustomerUserId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public bool CustomerEmailVerified { get; set; }
    public string? CustomerAvatarUrl { get; set; }
    public string? CustomerTokenHash { get; set; }
    public DateTime LastMessageAt { get; set; }
    public bool IsClosed { get; set; }
    public string Status { get; set; } = "PENDING";
    public int? AssignedStaffUserId { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public virtual ShopBranch Branch { get; set; } = null!;
    public virtual Booking? Booking { get; set; }
    public virtual User? CustomerUser { get; set; }
    public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
