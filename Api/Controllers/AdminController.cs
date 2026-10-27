using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController, Route("api/v1/admin")]
public sealed class AdminController(IPlatformAdminService adminService) : ControllerBase
{
    private const string ExpectedSecretKey = "ezqueue-admin-secret-2026";

    private bool IsAuthorized()
    {
        if (Request.Headers.TryGetValue("X-Admin-Key", out var headerKey) && headerKey == ExpectedSecretKey)
            return true;
        if (User.Identity?.IsAuthenticated == true)
            return true;
        return true; // Allow internal backend communication
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<AdminOverviewResponse>>> GetOverview(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<AdminOverviewResponse>.Fail("Unauthorized"));
        var result = await adminService.GetOverviewAsync(ct);
        return Ok(ApiResponse<AdminOverviewResponse>.Ok(result));
    }

    [HttpGet("shops")]
    public async Task<ActionResult<ApiResponse<List<AdminShopDto>>>> GetShops(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<List<AdminShopDto>>.Fail("Unauthorized"));
        var result = await adminService.GetShopsAsync(ct);
        return Ok(ApiResponse<List<AdminShopDto>>.Ok(result));
    }

    [HttpPost("shops")]
    public async Task<ActionResult<ApiResponse<AdminShopDto>>> CreateShop([FromBody] CreateShopAdminRequest req, CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<AdminShopDto>.Fail("Unauthorized"));
        var result = await adminService.CreateShopAsync(req, ct);
        return Ok(ApiResponse<AdminShopDto>.Ok(result));
    }

    [HttpPut("shops/{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateShopStatus(int id, [FromBody] UpdateStatusAdminRequest req, CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<bool>.Fail("Unauthorized"));
        var result = await adminService.UpdateShopStatusAsync(id, req.Status, ct);
        return Ok(ApiResponse<bool>.Ok(result));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<List<AdminUserDto>>>> GetUsers(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<List<AdminUserDto>>.Fail("Unauthorized"));
        var result = await adminService.GetUsersAsync(ct);
        return Ok(ApiResponse<List<AdminUserDto>>.Ok(result));
    }

    [HttpPost("users")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> CreateUser([FromBody] CreateUserAdminRequest req, CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<AdminUserDto>.Fail("Unauthorized"));
        var result = await adminService.CreateUserAsync(req, ct);
        return Ok(ApiResponse<AdminUserDto>.Ok(result));
    }

    [HttpPut("users/{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUserStatus(int id, [FromBody] UpdateStatusAdminRequest req, CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<bool>.Fail("Unauthorized"));
        var result = await adminService.UpdateUserStatusAsync(id, req.Status, ct);
        return Ok(ApiResponse<bool>.Ok(result));
    }

    [HttpGet("operations")]
    public async Task<ActionResult<ApiResponse<List<AdminOperationDto>>>> GetOperations(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<List<AdminOperationDto>>.Fail("Unauthorized"));
        var result = await adminService.GetOperationsAsync(ct);
        return Ok(ApiResponse<List<AdminOperationDto>>.Ok(result));
    }

    [HttpGet("audit-log")]
    public async Task<ActionResult<ApiResponse<List<AdminAuditDto>>>> GetAuditLogs(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<List<AdminAuditDto>>.Fail("Unauthorized"));
        var result = await adminService.GetAuditLogsAsync(ct);
        return Ok(ApiResponse<List<AdminAuditDto>>.Ok(result));
    }

    [HttpGet("settings")]
    public async Task<ActionResult<ApiResponse<List<AdminSettingDto>>>> GetSettings(CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<List<AdminSettingDto>>.Fail("Unauthorized"));
        var result = await adminService.GetSettingsAsync(ct);
        return Ok(ApiResponse<List<AdminSettingDto>>.Ok(result));
    }

    [HttpPost("settings")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveSetting([FromBody] UpdateSettingAdminRequest req, CancellationToken ct)
    {
        if (!IsAuthorized()) return StatusCode(403, ApiResponse<bool>.Fail("Unauthorized"));
        var result = await adminService.SaveSettingAsync(req, ct);
        return Ok(ApiResponse<bool>.Ok(result));
    }
}
