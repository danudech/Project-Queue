public class QueueSlotResponse
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public DateTime SlotDate { get; set; }
    public string? SlotTime { get; set; }
    public bool? IsAvailable { get; set; } = false;
}