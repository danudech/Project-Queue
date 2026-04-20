using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Common;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Infrastructure.Service;

namespace Queue.Api.Controllers;

[ApiController]
[Route("api/v1/user")]
public class RegisterController : ControllerBase
{
    private readonly IAuthentication _auth;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public RegisterController(IAuthentication auth, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _auth = auth;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<string>>> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(ApiResponse<string>.Fail("email and name are required"));

            _actionLog.Info("Register request (Email={Email})", req.Email);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();

            return Ok(ApiResponse<string>.Ok("success"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Register failed (Email={Email})", req?.Email ?? "unknown");
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }
}
