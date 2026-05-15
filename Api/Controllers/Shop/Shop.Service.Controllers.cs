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
[Route("api/v1/shop/services")]
public class ShopServiceController : ControllerBase
{
    private readonly IManageShop _shop;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public ShopServiceController(IManageShop shop, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _shop = shop;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [HttpGet("get-services")]
    public async Task<ActionResult<ApiResponse<List<ShopServiceResponse>?>>> GetShopServices([FromQuery] int shopId, [FromQuery] int branchId,CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<List<ShopServiceResponse>>.Fail(message));
            _actionLog.Info("Get shop services request (UserId={UserId}, ShopId={ShopId}, BranchId={BranchId})", userId, shopId, branchId);
            List<ShopServiceResponse>? resp = await _shop.GetShopServicesById(shopId, branchId, int.Parse(userId), ip, ua, ct);

            return Ok(ApiResponse<List<ShopServiceResponse>?>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Get shop services failed (UserId={UserId}, ShopId={ShopId}, BranchId={BranchId}, IP={IP}, UserAgent={UserAgent})", userId, shopId, branchId, ip, ua);
            return StatusCode(500, ApiResponse<List<ShopServiceResponse>>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("add-service")]
    public async Task<ActionResult<ApiResponse<ShopServiceResponse>>> AddShopService([FromBody] ShopServiceRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopServiceResponse>.Fail(message));
            _actionLog.Info("Add shop service request (UserId={UserId})", userId);
            ShopServiceResponse? resp = await _shop.AddShopService(int.Parse(userId), request, ip, ua, ct);

            return Ok(ApiResponse<ShopServiceResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Add shop service failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<ShopServiceResponse>.Fail(ex.Message));
        }
    }
    
    [Authorize]
    [HttpPut("update-service")]
    public async Task<ActionResult<ApiResponse<ShopServiceResponse>>> UpdateShopService([FromBody] ShopServiceRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopServiceResponse>.Fail(message));
            _actionLog.Info("Update shop service request (UserId={UserId})", userId);
            ShopServiceResponse resp = await _shop.UpdateShopService(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<ShopServiceResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update shop service failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<ShopServiceResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("delete-service")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteShopService([FromQuery] int serviceId, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<string>.Fail(message));
            _actionLog.Info("Delete shop service request (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, serviceId, ip, ua);
            await _shop.DeleteShopService(int.Parse(userId), serviceId, ip, ua, ct);
            return Ok(ApiResponse<string>.Ok("Service deleted successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Delete shop service failed (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, serviceId, ip, ua);
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }
}