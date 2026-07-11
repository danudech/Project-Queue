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
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
namespace Queue.Api.Controllers;

[ApiController]
[Route("api/v1/shop")]
public class ManageShopController : ControllerBase
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
            return StatusCode(500, ApiResponse<ShopResponse>.Fail(ex.Message));
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
            return StatusCode(500, ApiResponse<List<MasterStatus>>.Fail(ex.Message));
        }
    }

    [Authorize]
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
            return StatusCode(500, ApiResponse<ShopResponse?>.Fail(ex.Message));
        }
    }
}