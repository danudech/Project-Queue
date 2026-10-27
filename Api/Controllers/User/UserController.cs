using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Common;
using Queue.Api.Models.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers.User;

[ApiController]
[Route("api/v1/user")]
public class UserController : ControllerBase
{
    private readonly IUsers _user;
    private readonly IActionLog _actionLog;

    public UserController(IUsers user, IActionLog actionLog)
    {
        _user = user;
        _actionLog = actionLog;
    }
    [Authorize]
    [HttpPost("changepassword")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] Queue.Application.DTO.Request.ChangePasswordRequest req, CancellationToken ct)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("id")?.Value ?? User.FindFirst("uid")?.Value ?? "0");
            if (userId == 0) return Unauthorized(ApiResponse<bool>.Fail("Unauthorized"));

            if (string.IsNullOrWhiteSpace(req.OldPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(ApiResponse<bool>.Fail("old password and new password are required"));

            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = Request.Headers.UserAgent.ToString();

            _actionLog.Info("ChangePassword request (UserId={UserId})", userId);
            
            bool result = await _user.ChangePassword(userId, req.OldPassword, req.NewPassword, ip, ua, ct);
            if (!result)
                return BadRequest(ApiResponse<bool>.Fail("Password change failed"));

            return Ok(ApiResponse<bool>.Ok(true, "Password changed successfully"));
        }
        catch (UnauthorizedAccessException)
        {
            return BadRequest(ApiResponse<bool>.Fail("Incorrect old password"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "ChangePassword failed");
            return StatusCode(500, ApiResponse<bool>.Fail("An unexpected error occurred."));
        }
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateProfile([FromForm] Queue.Application.DTO.Request.UpdateProfileRequest req, CancellationToken ct)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            if (userId == 0) return Unauthorized(ApiResponse<bool>.Fail("Unauthorized"));

            _actionLog.Info("UpdateProfile request (UserId={UserId})", userId);
            
            bool result = await _user.UpdateProfile(userId, req, ct);
            if (!result)
                return NotFound(ApiResponse<bool>.Fail("User not found"));

            return Ok(ApiResponse<bool>.Ok(true, "Profile updated successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "UpdateProfile failed");
            return StatusCode(500, ApiResponse<bool>.Fail("An unexpected error occurred."));
        }
    }

    [Authorize]
    [HttpDelete("{userId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int userId, CancellationToken ct)
    {
        try
        {
            int authenticatedUserId = int.TryParse(
                User.FindFirst("uid")?.Value ?? User.FindFirst("id")?.Value,
                out int parsedUserId)
                ? parsedUserId
                : 0;
            if (authenticatedUserId == 0)
                return Unauthorized(ApiResponse<bool>.Fail("Unauthorized"));
            if (authenticatedUserId != userId)
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    ApiResponse<bool>.Fail("You can only delete your own account."));

            _actionLog.Info("DeleteUser request (UserId={UserId})", userId);
            
            bool result = await _user.DeleteUser(userId, ct);
            if (!result)
                return NotFound(ApiResponse<bool>.Fail("User not found"));

            return Ok(ApiResponse<bool>.Ok(true, "User deleted successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "DeleteUser failed (UserId={UserId})", userId);
            return StatusCode(500, ApiResponse<bool>.Fail("An unexpected error occurred."));
        }
    }
}
