using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;

namespace Queue.Api.Common;

public abstract class QueueControllerBase : ControllerBase
{
    protected ActionResult<ApiResponse<T>> Failure<T>(Exception ex) =>
        ex switch
        {
            UnauthorizedAccessException => StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<T>.Fail(ex.Message)),
            KeyNotFoundException => NotFound(ApiResponse<T>.Fail(ex.Message)),
            InvalidOperationException => BadRequest(ApiResponse<T>.Fail(ex.Message)),
            _ => StatusCode(
                StatusCodes.Status500InternalServerError,
                ApiResponse<T>.Fail("An unexpected error occurred.")),
        };
}
