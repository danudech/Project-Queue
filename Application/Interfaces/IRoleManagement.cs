using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IRoleManagement
{
    Task<List<PermissionCatalogResponse>> GetPermissionCatalogAsync(CancellationToken ct);
    Task<List<ShopRoleResponse>> GetRolesAsync(int userId, int shopId, CancellationToken ct);
    Task<ShopRoleResponse> CreateRoleAsync(int userId, RoleUpsertRequest request, CancellationToken ct);
    Task<ShopRoleResponse> UpdateRoleAsync(int userId, string code, RoleUpsertRequest request, CancellationToken ct);
    Task<bool> DeleteRoleAsync(int userId, int shopId, string code, CancellationToken ct);
    Task<StaffResponse> AssignStaffRoleAsync(
        int userId,
        int staffId,
        StaffRoleAssignmentRequest request,
        CancellationToken ct);
}
