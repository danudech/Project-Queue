using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Api.Authorization;

namespace Queue.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/roles")]
public sealed class RoleController : ControllerBase
{
    private readonly IRoleManagement _roles;

    public RoleController(IRoleManagement roles) => _roles = roles;

    [HttpGet]
    [RequirePermission("staff.view|role.assign")]
    public Task<ActionResult<ApiResponse<List<ShopRoleResponse>>>> GetRoles(
        [FromQuery] int shopId,
        CancellationToken ct) =>
        Execute(() => _roles.GetRolesAsync(UserId, shopId, ct));

    [HttpGet("permissions")]
    [RequirePermission("staff.view|role.assign")]
    public Task<ActionResult<ApiResponse<List<PermissionCatalogResponse>>>> GetPermissions(CancellationToken ct) =>
        Execute(() => _roles.GetPermissionCatalogAsync(ct));

    [HttpPost]
    [RequirePermission("role.assign")]
    public Task<ActionResult<ApiResponse<ShopRoleResponse>>> CreateRole(
        [FromBody] RoleUpsertRequest request,
        CancellationToken ct) =>
        Execute(() => _roles.CreateRoleAsync(UserId, request, ct));

    [HttpPut("{code}")]
    [RequirePermission("role.assign")]
    public Task<ActionResult<ApiResponse<ShopRoleResponse>>> UpdateRole(
        string code,
        [FromBody] RoleUpsertRequest request,
        CancellationToken ct) =>
        Execute(() => _roles.UpdateRoleAsync(UserId, code, request, ct));

    [HttpDelete("{code}")]
    [RequirePermission("role.assign")]
    public Task<ActionResult<ApiResponse<bool>>> DeleteRole(
        string code,
        [FromQuery] int shopId,
        CancellationToken ct) =>
        Execute(() => _roles.DeleteRoleAsync(UserId, shopId, code, ct));

    [HttpPut("staff/{staffId:int}")]
    [RequirePermission("role.assign")]
    public Task<ActionResult<ApiResponse<StaffResponse>>> AssignStaffRole(
        int staffId,
        [FromBody] StaffRoleAssignmentRequest request,
        CancellationToken ct) =>
        Execute(() => _roles.AssignStaffRoleAsync(UserId, staffId, request, ct));

    private int UserId =>
        int.TryParse(User.FindFirst("uid")?.Value, out int id) ? id : 0;

    private async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action)
    {
        try { return Ok(ApiResponse<T>.Ok(await action())); }
        catch (UnauthorizedAccessException ex) { return StatusCode(403, ApiResponse<T>.Fail(ex.Message)); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<T>.Fail(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<T>.Fail(ex.Message)); }
        catch (Exception) { return StatusCode(500, ApiResponse<T>.Fail("An unexpected error occurred.")); }
    }
}
