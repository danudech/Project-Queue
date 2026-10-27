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
using Queue.Api.Authorization;
namespace Queue.Api.Controllers;

[ApiController]
[Route("api/v1/shop/category")]
public class ShopCategoryController : QueueControllerBase
{
    private readonly IManageShop _shop;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public ShopCategoryController(IManageShop shop, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _shop = shop;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [RequirePermission("service.view")]
    [HttpGet("get-category")]
    public async Task<ActionResult<ApiResponse<List<ShopCategoryResponse>?>>> GetShopCategory([FromQuery] int shopId, [FromQuery] int? branchId, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<List<ShopCategoryResponse>>.Fail(message));

            _actionLog.Info("Get shop category request (UserId={UserId}, ShopId={ShopId}, BranchId={BranchId})", userId, shopId, branchId ?? 0);
            List<ShopCategoryResponse>? resp = await _shop.GetShopCategoryById(int.Parse(userId), shopId, branchId, ip, ua, ct);

            return Ok(ApiResponse<List<ShopCategoryResponse>?>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Get shop category failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<List<ShopCategoryResponse>?>(ex);
        }
    }

    [Authorize]
    [RequirePermission("service.create")]
    [HttpPost("add-category")]
    public async Task<ActionResult<ApiResponse<ShopCategoryResponse>>> AddShopCategory([FromBody] ShopCategoryRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopCategoryResponse>.Fail(message));
            _actionLog.Info("Add shop category request (UserId={UserId})", userId);
            ShopCategoryResponse resp = await _shop.AddShopCategory(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<ShopCategoryResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Add shop category failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<ShopCategoryResponse>(ex);
        }
    }

    [Authorize]
    [RequirePermission("service.edit")]
    [HttpPut("update-category")]
    public async Task<ActionResult<ApiResponse<ShopCategoryResponse>>> UpdateShopCategory([FromBody] ShopCategoryRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<ShopCategoryResponse>.Fail(message));
            _actionLog.Info("Update shop category request (UserId={UserId})", userId);
            ShopCategoryResponse resp = await _shop.UpdateShopCategory(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<ShopCategoryResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update shop category failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return Failure<ShopCategoryResponse>(ex);
        }
    }

    [Authorize]
    [RequirePermission("service.delete")]
    [HttpDelete("delete-category")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteShopCategory([FromQuery] int categoryId, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<string>.Fail(message));
            _actionLog.Info("Delete shop category request (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, categoryId, ip, ua);
            await _shop.DeleteShopCategory(int.Parse(userId), categoryId, ip, ua, ct);
            return Ok(ApiResponse<string>.Ok("Category deleted successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Delete shop category failed (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, categoryId, ip, ua);
            return Failure<string>(ex);
        }
    }
}
