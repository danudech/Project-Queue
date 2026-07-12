namespace Queue.Application.DTO.Request;

public class UpdateQueueRulesRequest
{
    public int BranchId { get; set; }
    public int SlotInterval { get; set; } = 30;
    public int AdvanceBookingWindow { get; set; } = 14;
    public int BufferBetweenServices { get; set; } = 10;
}
