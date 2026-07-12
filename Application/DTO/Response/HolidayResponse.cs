namespace Queue.Application.DTO.Response;

public sealed class HolidayResponse
{
    public int Id { get; set; }
    public string Date { get; set; } = null!;
    public string Name { get; set; } = null!;
}
