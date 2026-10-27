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
    private readonly IUsers _users;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public AuthorizeController(IAuthentication auth, IUsers users, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _auth = auth;
        _users = users;
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
            return StatusCode(500, ApiResponse<LoginResponse>.Fail("An unexpected error occurred."));
        }
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ForgotPassword([FromBody] ForgotPasswordRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(ApiResponse<bool>.Fail("email is required"));

            _actionLog.Info("Forgot password request (Email={Email})", req.Email);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            string originUrl = HttpContext.Request.Headers["Origin"].ToString();
            if (string.IsNullOrEmpty(originUrl))
            {
                var forwardedHost = HttpContext.Request.Headers["X-Forwarded-Host"].ToString();
                if (!string.IsNullOrEmpty(forwardedHost))
                {
                    string proto = HttpContext.Request.Headers["X-Forwarded-Proto"].ToString();
                    originUrl = $"{(!string.IsNullOrEmpty(proto) ? proto : HttpContext.Request.Scheme)}://{forwardedHost}";
                }
                else
                {
                    string referer = HttpContext.Request.Headers["Referer"].ToString();
                    if (Uri.TryCreate(referer, UriKind.Absolute, out Uri? refererUri))
                    {
                        originUrl = $"{refererUri.Scheme}://{refererUri.Authority}";
                    }
                }
            }

            await _users.GetForgotPasswordRequestByEmail(req, originUrl, ip, ua, ct);
            return Ok(ApiResponse<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Forgot password failed (Email={Email})", req?.Email ?? "unknown");
            return StatusCode(500, ApiResponse<bool>.Fail("An unexpected error occurred."));
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Me(CancellationToken ct)
    {
        try
        {
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<UserResponse>.Fail(message));
            string? userId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                return Unauthorized(ApiResponse<UserResponse>.Fail("invalid user id in token"));
            UserResponse? user = await _users.GetUserById(uid, ip, ua, ct);
            if (user == null)
                return NotFound(ApiResponse<UserResponse>.Fail("user not found"));
            return Ok(ApiResponse<UserResponse>.Ok(user));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Me failed (by={User})", User?.Identity?.Name ?? "anonymous");
            return StatusCode(500, ApiResponse<UserResponse>.Fail("An unexpected error occurred."));
        }
    }

    [AllowAnonymous]
    [HttpGet("refresh-token")]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> LineRefreshToken(CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Line refresh token request");

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            (TokenResponse? resp, string? message) = await _istokenrefresh.UserRefreshAccessTokenAsync(HttpContext, ct);
            if (resp == null)
                return Unauthorized(ApiResponse<TokenResponse>.Fail(message ?? "Invalid refresh token"));
            return Ok(ApiResponse<TokenResponse>.Ok(resp, message ?? "ok"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Line refresh token failed");
            return StatusCode(500, ApiResponse<TokenResponse>.Fail("An unexpected error occurred."));
        }
    }

}
