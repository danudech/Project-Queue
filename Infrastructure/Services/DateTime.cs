using Microsoft.Extensions.Configuration;

namespace Queue.Infrastructure.Services;

public sealed class DateTimeService
{
    private readonly IConfiguration _config;

    public DateTimeService(IConfiguration config)
    {
        _config = config;
    }

    public DateTime LocalNow()
    {
        var tzId = _config["AppSettings:TimeZoneId"] ?? "SE Asia Standard Time";
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(tzId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
        catch (TimeZoneNotFoundException)
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
    }
}