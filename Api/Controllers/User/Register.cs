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
    private readonly IUsers _user;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public RegisterController(IUsers user, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _user = user;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(ApiResponse<RegisterResponse>.Fail("email and name are required"));

            if (req.AcceptTerms != true)
                return BadRequest(ApiResponse<RegisterResponse>.Fail("terms must be accepted"));

            _actionLog.Info("Register request (Email={Email})", req.Email);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            RegisterResponse? resp = await _user.LocalRegister(req, ip, ua, ct);
            if (resp == null || !(resp.Success ?? false))
            {
                return BadRequest(ApiResponse<RegisterResponse>.Fail(resp?.Message ?? "Registration failed"));
            }

            return Ok(ApiResponse<RegisterResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Register failed (Email={Email})", req?.Email ?? "unknown");
            return StatusCode(500, ApiResponse<RegisterResponse>.Fail(ex.Message));
        }
    }

    [AllowAnonymous]
    [HttpPost("resendconfirmation")]
    public async Task<ActionResult<ApiResponse<string>>> ResendConfirmation([FromBody] RegisterRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(ApiResponse<string>.Fail("email is required"));

            _actionLog.Info("Resend confirmation email request (Email={Email})", req.Email);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            await _user.ResentConfirmationEmail(req, ip, ua, ct);

            return Ok(ApiResponse<string>.Ok("Confirmation email resent successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Resend confirmation email failed (Email={Email})", req?.Email ?? "unknown");
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }

    [AllowAnonymous]
    [HttpPost("verifyaccount")]
    public async Task<ActionResult<ApiResponse<bool>>> VerifyAccount([FromBody] VerifyAccountRequest req, CancellationToken ct)
    {
        try
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Token))
                return BadRequest(ApiResponse<bool>.Fail("token is required"));

            _actionLog.Info("Verify account request (Token={Token})", req.Token);

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            bool? resp = await _user.ConfirmEmail(req, ip, ua, ct);
            if (resp == null || !(resp ?? false))
            {
                return BadRequest(ApiResponse<bool>.Fail("Account verification failed"));
            }

            return Ok(ApiResponse<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Verify account failed (Token={Token})", req?.Token ?? "unknown");
            return StatusCode(500, ApiResponse<bool>.Fail(ex.Message));
        }
    }
}
