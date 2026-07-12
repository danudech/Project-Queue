namespace Queue.Application.DTO.Response;

public class QueueRulesResponse
{
    public int SlotInterval { get; set; } = 30;
    public int AdvanceBookingWindow { get; set; } = 14;
    public int BufferBetweenServices { get; set; } = 10;
}
