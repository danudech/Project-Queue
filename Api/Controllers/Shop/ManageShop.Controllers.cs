using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Queue.Api.Common;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
using Queue.Api.Authorization;
namespace Queue.Api.Controllers;

[ApiController]
[Route("api/v1/shop")]
public class ManageShopController : QueueControllerBase
{
    private readonly IManageShop _shop;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public ManageShopController(IManageShop shop, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _shop = shop;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [RequirePermission("shop.view|branch.view")]
    [HttpGet("get-shop")]
    public async Task<ActionResult<ApiResponse<ShopResponse?>>> GetShop([FromQuery] int BranchId, CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopResponse>.Fail(message));
            _actionLog.Info("Get shop request (UserId={UserId})", userId);
            ShopResponse? resp = await _shop.GetShopById(int.Parse(userId),BranchId, ip, ua, ct);

            return Ok(ApiResponse<ShopResponse?>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Get shop failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<ShopResponse?>(ex);
        }
    }

    [Authorize]
    [HttpGet("shop-type")]
    public async Task<ActionResult<ApiResponse<List<MasterStatus>>>> MasterShopType(CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<List<MasterStatus>>.Fail(message));
            _actionLog.Info("Get shop type request (UserId={UserId})", userId);
            List<MasterStatus>? resp = await _shop.MasterShopType(null, ip, ua, ct);

            return Ok(ApiResponse<List<MasterStatus>>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Get shop type failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<List<MasterStatus>>(ex);
        }
    }

    [Authorize]
    [RequirePermission("shop.edit")]
    [HttpPut("update-shop")]
    public async Task<ActionResult<ApiResponse<ShopResponse?>>> UpdateShop([FromForm] UpdateShopRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopResponse>.Fail(message));
                
            _actionLog.Info("Update shop request (UserId={UserId})", userId);
            
            ShopResponse? resp = await _shop.UpdateShop(int.Parse(userId), request, ip, ua, ct);
            if (resp == null)
            {
                return NotFound(ApiResponse<ShopResponse?>.Fail("Shop not found or you are not the owner"));
            }

            return Ok(ApiResponse<ShopResponse?>.Ok(resp, "Shop updated successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update shop failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<ShopResponse?>(ex);
        }
    }

    [Authorize]
    [RequirePermission("branch.edit")]
    [HttpPut("update-branch")]
    public async Task<ActionResult<ApiResponse<ShopResponse?>>> UpdateBranch([FromForm] UpdateBranchRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopResponse>.Fail(message));
                
            _actionLog.Info("Update branch request (UserId={UserId}, BranchId={BranchId})", userId, request.BranchId);
            
            ShopResponse? resp = await _shop.UpdateBranch(int.Parse(userId), request, ip, ua, ct);
            if (resp == null)
            {
                return NotFound(ApiResponse<ShopResponse?>.Fail("Branch not found or you are not the owner"));
            }

            return Ok(ApiResponse<ShopResponse?>.Ok(resp, "Branch updated successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update branch failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<ShopResponse?>(ex);
        }
    }

    [Authorize]
    [RequirePermission("setting.view")]
    [HttpGet("business-hours")]
    public async Task<ActionResult<ApiResponse<List<BusinessHourResponse>>>> GetBusinessHours([FromQuery] int branchId, CancellationToken ct)
    {
        int userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
        var result = await _shop.GetBusinessHours(userId, branchId, ct);
        return Ok(ApiResponse<List<BusinessHourResponse>>.Ok(result));
    }

    [Authorize]
    [RequirePermission("setting.edit")]
    [HttpPut("business-hours")]
    public async Task<ActionResult<ApiResponse<List<BusinessHourResponse>>>> UpdateBusinessHours([FromBody] UpdateBusinessHoursRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            var result = await _shop.UpdateBusinessHours(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<List<BusinessHourResponse>>.Ok(result, "Business hours updated successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update business hours failed (UserId={UserId})", userId);
            return Failure<List<BusinessHourResponse>>(ex);
        }
    }

    [Authorize]
    [RequirePermission("setting.view")]
    [HttpGet("holidays")]
    public async Task<ActionResult<ApiResponse<List<HolidayResponse>>>> GetHolidays([FromQuery] int branchId, CancellationToken ct)
    {
        int userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
        var result = await _shop.GetHolidays(userId, branchId, ct);
        return Ok(ApiResponse<List<HolidayResponse>>.Ok(result));
    }

    [Authorize]
    [RequirePermission("setting.edit")]
    [HttpPost("holidays")]
    public async Task<ActionResult<ApiResponse<HolidayResponse?>>> AddHoliday([FromBody] AddHolidayRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            var result = await _shop.AddHoliday(int.Parse(userId), request, ip, ua, ct);
            if (result == null) return NotFound(ApiResponse<HolidayResponse?>.Fail("Branch not found or unauthorized"));
            return Ok(ApiResponse<HolidayResponse?>.Ok(result, "Holiday added successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Add holiday failed (UserId={UserId})", userId);
            return Failure<HolidayResponse?>(ex);
        }
    }

    [Authorize]
    [RequirePermission("setting.edit")]
    [HttpDelete("holidays")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteHoliday([FromQuery] int holidayId, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            var result = await _shop.DeleteHoliday(int.Parse(userId), holidayId, ip, ua, ct);
            if (!result) return NotFound(ApiResponse<bool>.Fail("Holiday not found or unauthorized"));
            return Ok(ApiResponse<bool>.Ok(result, "Holiday deleted successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Delete holiday failed (UserId={UserId})", userId);
            return Failure<bool>(ex);
        }
    }

    [Authorize]
    [RequirePermission("setting.view")]
    [HttpGet("queue-rules")]
    public async Task<ActionResult<ApiResponse<QueueRulesResponse>>> GetQueueRules([FromQuery] int branchId, CancellationToken ct)
    {
        try
        {
            int userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            var result = await _shop.GetQueueRules(userId, branchId, ct);
            return Ok(ApiResponse<QueueRulesResponse>.Ok(result));
        }
        catch (Exception ex)
        {
            return Failure<QueueRulesResponse>(ex);
        }
    }

    [Authorize]
    [RequirePermission("setting.edit")]
    [HttpPut("queue-rules")]
    public async Task<ActionResult<ApiResponse<QueueRulesResponse>>> UpdateQueueRules([FromBody] UpdateQueueRulesRequest request, CancellationToken ct)
    {
        try
        {
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string ua = HttpContext.Request.Headers.UserAgent.ToString();
            string userId = User.FindFirst("uid")?.Value ?? "0";

            var result = await _shop.UpdateQueueRules(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<QueueRulesResponse>.Ok(result));
        }
        catch (Exception ex)
        {
            return Failure<QueueRulesResponse>(ex);
        }
    }
}
