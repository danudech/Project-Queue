using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController, Authorize, Route("api/v1/workspace")]
public sealed class WorkspaceController(IShopWorkspace workspace) : ControllerBase
{
    private int UserId => int.TryParse(User.FindFirst("uid")?.Value, out var id) ? id : 0;

    [HttpGet]
    public Task<ActionResult<ApiResponse<WorkspaceResponse>>> Read(int shopId, string module, int? branchId, DateTime? from, DateTime? to, int page = 1, CancellationToken ct = default) =>
        Execute(() => workspace.ReadAsync(UserId, shopId, module, branchId, from, to, page, ct));

    [HttpPost]
    public Task<ActionResult<ApiResponse<bool>>> Save(WorkspaceRequest request, CancellationToken ct) =>
        Execute(async () => { await workspace.SaveAsync(UserId, request, ct); return true; });

    private async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> operation)
    {
        try { return Ok(ApiResponse<T>.Ok(await operation())); }
        catch (UnauthorizedAccessException) { return StatusCode(403, ApiResponse<T>.Fail("Access denied for this shop or branch.")); }
        catch (KeyNotFoundException) { return NotFound(ApiResponse<T>.Fail("Record not found.")); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<T>.Fail(ex.Message)); }
        catch (Exception) { return StatusCode(500, ApiResponse<T>.Fail("Unable to process the request.")); }
    }
}
