using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Queue.Infrastructure.Persistence;

namespace Queue.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly QueueDbContext _db;

    public HealthController(QueueDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        try
        {
            bool dbOk = await _db.Database.CanConnectAsync(ct);

            var response = new
            {
                status = dbOk,
                api = "running",
                database = dbOk ? "connected" : "disconnected",
                serverTimeUtc = DateTime.UtcNow
            };

            if (!dbOk)
                return StatusCode(503, response);

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = false,
                api = "error",
                message = ex.Message,
                serverTimeUtc = DateTime.UtcNow
            });
        }
    }
}
