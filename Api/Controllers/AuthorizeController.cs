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
[Route("api/v1/auth")]
public class AuthorizeController : ControllerBase
{
    private readonly IAuthentication _auth;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public AuthorizeController(IAuthentication auth, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _auth = auth;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.EmailOrPhone) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(ApiResponse<LoginResponse>.Fail("email/phone and password are required"));

            _actionLog.Info("Login request (EmailOrPhone={EmailOrPhone})", req.EmailOrPhone);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();

            LoginResponse? resp = await _auth.Login(req.EmailOrPhone.Trim(), req.Password, ip, ua, ct);
            if (resp == null) return Unauthorized(ApiResponse<LoginResponse>.Fail("invalid email/phone or password"));
            Response.Cookies.Append("access_token", resp.TokenData.AccessToken, RefreshCookieOptions.Build(_env));
            Response.Cookies.Append("refresh_token", resp.TokenData.RefreshToken, RefreshCookieOptions.Build(_env));
            Response.Cookies.Append("session_key", resp.TokenData.Session, RefreshCookieOptions.Build(_env));
            return Ok(ApiResponse<LoginResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Login failed (EmailOrPhone={EmailOrPhone})", req?.EmailOrPhone ?? "unknown");
            return StatusCode(500, ApiResponse<LoginResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<object>>> Me(CancellationToken ct)
    {
        try
        {
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<object>.Fail(message));
            string? userId = User.FindFirst("uid")?.Value;
            string? username = User.FindFirst("un")?.Value;
            string? role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            string? name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            string? permissions = User.FindFirst("permissions")?.Value;
            return Ok(ApiResponse<object>.Ok(new { ok = true, userId = userId, username = username, role = role, name = name, permissions = permissions }));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Me failed (by={User})", User?.Identity?.Name ?? "anonymous");
            return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
        }
    }
}
