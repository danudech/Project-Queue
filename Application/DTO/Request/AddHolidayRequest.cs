namespace Queue.Application.DTO.Request;

public sealed class AddHolidayRequest
{
    public int BranchId { get; set; }
    public string Date { get; set; } = null!;
    public string Name { get; set; } = null!;
}
