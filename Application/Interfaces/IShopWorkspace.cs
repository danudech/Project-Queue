using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IShopWorkspace
{
    Task<WorkspaceResponse> ReadAsync(int userId, int shopId, string module, int? branchId, DateTime? from, DateTime? to, int page, CancellationToken ct);
    Task SaveAsync(int userId, WorkspaceRequest request, CancellationToken ct);
}
