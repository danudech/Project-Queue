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
[Route("api/v1/address")]
public class AddressController : ControllerBase
{
    private readonly IAddress _address;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;

    public AddressController(IAddress address, IActionLog actionLog, RefreshToken istokenrefresh)
    {
        _address = address;
        _actionLog = actionLog;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [HttpGet("by-zipcode")]
    public async Task<ActionResult<ApiResponse<List<AddressResponse>>>> GetAddressByZipcode([FromQuery] string zipcode, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<List<AddressResponse>>.Fail(message));
            List<AddressResponse>? address = await _address.GetAddressByZipcode(zipcode, ip, ua, ct);
            if (address == null)
                return NotFound(ApiResponse<List<AddressResponse>>.Fail("address not found"));
            return Ok(ApiResponse<List<AddressResponse>>.Ok(address));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "GetAddressByZipcode failed (by={User})", User?.Identity?.Name ?? "anonymous");
            return StatusCode(500, ApiResponse<List<AddressResponse>>.Fail("An unexpected error occurred."));
        }
    }

}
