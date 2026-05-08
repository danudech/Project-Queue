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
[Route("api/v1/customer")]
public class CustomerController : ControllerBase
{
    private readonly IManageCustomer _customer;
    private readonly IActionLog _actionLog;
    private readonly RefreshToken _istokenrefresh;
    private readonly IHostEnvironment _env;

    public CustomerController(IManageCustomer customer, IActionLog actionLog, RefreshToken istokenrefresh, IHostEnvironment env)
    {
        _customer = customer;
        _actionLog = actionLog;
        _env = env;
        _istokenrefresh = istokenrefresh;
    }

    [Authorize]
    [HttpGet("get-customer")]
    public async Task<ActionResult<ApiResponse<List<CustomerResponse>?>>> GetCustomers(CancellationToken ct)
    {

        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<List<CustomerResponse>>.Fail(message));
            _actionLog.Info("Get customers request (UserId={UserId})", userId);
            List<CustomerResponse>? resp = await _customer.GetCustomerById(int.Parse(userId), ip, ua, ct);

            return Ok(ApiResponse<List<CustomerResponse>?>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Get customers failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<List<CustomerResponse>>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("add-customer")]
    public async Task<ActionResult<ApiResponse<CustomerResponse>>> AddCustomer([FromBody] CustomerRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<CustomerResponse>.Fail(message));
            _actionLog.Info("Add customer request (UserId={UserId})", userId);
            CustomerResponse? resp = await _customer.CreateCustomer(int.Parse(userId), request, ip, ua, ct);

            return Ok(ApiResponse<CustomerResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Add customer failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<CustomerResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpPut("update-customer")]
    public async Task<ActionResult<ApiResponse<CustomerResponse>>> UpdateCustomer([FromBody] CustomerRequest request, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<CustomerResponse>.Fail(message));
            _actionLog.Info("Update customer request (UserId={UserId})", userId);
            CustomerResponse resp = await _customer.UpdateCustomer(int.Parse(userId), request, ip, ua, ct);
            return Ok(ApiResponse<CustomerResponse>.Ok(resp));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Update customer failed (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, ua);
            return StatusCode(500, ApiResponse<CustomerResponse>.Fail(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("delete-customer")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteCustomer([FromQuery] int customerId, CancellationToken ct)
    {
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string ua = HttpContext.Request.Headers.UserAgent.ToString();
        string userId = User.FindFirst("uid")?.Value ?? "0";
        try
        {
            (bool status, string message, string refreshtoken) = await _istokenrefresh.UserHasConsent(HttpContext, ip, ua, ct);
            if (!status)
                return Unauthorized(ApiResponse<string>.Fail(message));
            _actionLog.Info("Delete customer request (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, customerId, ip, ua);
            await _customer.DeleteCustomer(int.Parse(userId), customerId, ip, ua, ct);
            return Ok(ApiResponse<string>.Ok("Customer deleted successfully"));
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Delete customer failed (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, customerId, ip, ua);
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }
}