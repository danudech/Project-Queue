using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Queue.Api.Models.Response;
using Queue.Infrastructure.Services;

namespace Queue.Api.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class RequirePermissionAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
{
    public RequirePermissionAttribute(string permission) => Permission = permission;

    public string Permission { get; }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedObjectResult(
                ApiResponse<object>.Fail("Authentication is required."));
            return;
        }

        int userId = int.TryParse(
            context.HttpContext.User.FindFirst("uid")?.Value,
            out int parsedUserId)
            ? parsedUserId
            : 0;
        var roleClaims = context.HttpContext.RequestServices
            .GetRequiredService<RoleClaimsService>();
        var (_, currentPermissions) = await roleClaims.ResolveAsync(
            userId,
            context.HttpContext.RequestAborted);
        var permissions = currentPermissions.ToHashSet(StringComparer.OrdinalIgnoreCase);

        string[] acceptedPermissions = Permission.Split(
            '|',
            StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (acceptedPermissions.Any(permissions.Contains)
            || permissions.Contains("system.admin")
            || permissions.Contains("Admin"))
            return;

        context.Result = new ObjectResult(
            ApiResponse<object>.Fail("You do not have permission to perform this action."))
        {
            StatusCode = StatusCodes.Status403Forbidden,
        };
    }
}
