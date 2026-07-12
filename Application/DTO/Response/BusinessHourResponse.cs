namespace Queue.Application.DTO.Response;

public sealed class BusinessHourResponse
{
    public int DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public string OpenTime { get; set; } = "00:00";
    public string CloseTime { get; set; } = "00:00";
}
