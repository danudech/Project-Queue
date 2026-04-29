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
using Queue.Application.Validate;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
namespace Queue.Api.Controllers;

[ApiController]
[Route("api/v1/shop")]
public class ShopController : ControllerBase
{
    private readonly IManageShop _shop;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public ShopController(IManageShop shop, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _shop = shop;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [HttpPost("new-shop")]
    public async Task<ActionResult<ApiResponse<ShopResponse?>>> RegisterShop([FromBody] CreateShopRequest request, CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            _actionLog.Info("Register shop request (UserId={UserId})", userId);
            var (isValid, errors) = CreateShopRequestValidator.Verify(request);
            if (!isValid)
            {
                return BadRequest(ApiResponse<ShopResponse?>.Fail(string.Join(", ", errors)));
            }

            ShopResponse? resp = await _shop.CreateShop(int.Parse(userId), request, ip, ua, ct);

            return Ok(ApiResponse<ShopResponse?>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Register shop failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<ShopResponse?>.Fail(ex.Message));
        }
    }
}