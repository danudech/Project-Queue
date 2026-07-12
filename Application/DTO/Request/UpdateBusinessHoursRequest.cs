using System.Collections.Generic;

namespace Queue.Application.DTO.Request;

public sealed class UpdateBusinessHoursRequest
{
    public int BranchId { get; set; }
    public List<BusinessHourDto> Hours { get; set; } = new();
}

public sealed class BusinessHourDto
{
    public int DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public string OpenTime { get; set; } = "00:00";
    public string CloseTime { get; set; } = "00:00";
}
