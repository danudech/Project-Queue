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
    public async Task<ActionResult<ApiResponse<ShopResponse?>>> GetShop(CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("id")?.Value ?? "0";
        try
        {
            _actionLog.Info("Get shop request (UserId={UserId})", userId);
            ShopResponse? resp = await _shop.GetShopById(int.Parse(userId), ip, ua, ct);

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
        string userId = User.FindFirst("id")?.Value ?? "0";
        try
        {
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
}