using Microsoft.EntityFrameworkCore;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Services;

/// <summary>
/// Resolves permissions inside a concrete shop or branch. This prevents a role
/// granted in one shop from authorizing an operation in another shop.
/// </summary>
public sealed class PermissionScopeService
{
    private readonly QueueDbContext _db;

    public PermissionScopeService(QueueDbContext db) => _db = db;

    public async Task EnsureShopAsync(
        int userId,
        int shopId,
        string permission,
        CancellationToken ct)
    {
        if (!await HasShopAsync(userId, shopId, permission, ct))
            throw new UnauthorizedAccessException(
                "You do not have permission to perform this action in this shop.");
    }

    public async Task EnsureBranchAsync(
        int userId,
        int branchId,
        string permission,
        CancellationToken ct)
    {
        if (!await HasBranchAsync(userId, branchId, permission, ct))
            throw new UnauthorizedAccessException(
                "You do not have permission to perform this action in this branch.");
    }

    public async Task<bool> HasShopAsync(
        int userId,
        int shopId,
        string permission,
        CancellationToken ct)
    {
        int? homeShopId = await GetHomeShopIdAsync(userId, ct);
        if (!homeShopId.HasValue || homeShopId.Value != shopId) return false;
        var shop = await _db.Shops.AsNoTracking()
            .Where(item => item.Id == shopId && item.IsActive)
            .Select(item => new { item.OwnerId })
            .SingleOrDefaultAsync(ct);
        if (shop == null) throw new KeyNotFoundException("Shop not found.");
        if (shop.OwnerId == userId) return true;

        var roleCodes = await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.ShopId == shopId && map.UserId == userId && map.IsActive)
            .Select(map => map.RoleCode)
            .Concat(_db.BranchUserRoleMaps.AsNoTracking()
                .Where(map => map.Branch.ShopId == shopId && map.UserId == userId && map.IsActive)
                .Select(map => map.RoleCode))
            .Distinct()
            .ToListAsync(ct);
        return await HasPermissionAsync(shopId, roleCodes, permission, ct);
    }

    public async Task<bool> HasBranchAsync(
        int userId,
        int branchId,
        string permission,
        CancellationToken ct)
    {
        var branch = await _db.ShopBranches.AsNoTracking()
            .Where(item => item.Id == branchId && item.IsActive && item.Shop.IsActive)
            .Select(item => new { item.ShopId, item.Shop.OwnerId })
            .SingleOrDefaultAsync(ct);
        if (branch == null) throw new KeyNotFoundException("Branch not found.");
        int? homeShopId = await GetHomeShopIdAsync(userId, ct);
        if (!homeShopId.HasValue || homeShopId.Value != branch.ShopId) return false;
        if (branch.OwnerId == userId) return true;

        var roleCodes = await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.ShopId == branch.ShopId && map.UserId == userId && map.IsActive)
            .Select(map => map.RoleCode)
            .Concat(_db.BranchUserRoleMaps.AsNoTracking()
                .Where(map => map.BranchId == branchId && map.UserId == userId && map.IsActive)
                .Select(map => map.RoleCode))
            .Distinct()
            .ToListAsync(ct);
        return await HasPermissionAsync(branch.ShopId, roleCodes, permission, ct);
    }

    public async Task<List<int>> GetPermittedShopIdsAsync(
        int userId,
        string permission,
        CancellationToken ct)
    {
        int? homeShopId = await _db.Users.AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.HomeShopId)
            .SingleOrDefaultAsync(ct);
        if (!homeShopId.HasValue) return [];
        return await HasShopAsync(userId, homeShopId.Value, permission, ct)
            ? [homeShopId.Value]
            : [];
    }

    private async Task<bool> HasPermissionAsync(
        int shopId,
        IReadOnlyCollection<string> roleCodes,
        string permission,
        CancellationToken ct)
    {
        if (roleCodes.Count == 0) return false;
        var grants = await _db.ShopRolePermissions.AsNoTracking()
            .Where(item =>
                roleCodes.Contains(item.RoleCode)
                && item.PermissionCode == permission
                && (item.ShopId == null || item.ShopId == shopId))
            .ToListAsync(ct);
        foreach (string roleCode in roleCodes)
        {
            var roleGrants = grants.Where(item => item.RoleCode == roleCode).ToList();
            var shopOverride = roleGrants.FirstOrDefault(item => item.ShopId == shopId);
            if (shopOverride?.IsGranted
                ?? roleGrants.Any(item => item.ShopId == null && item.IsGranted))
                return true;
        }
        return false;
    }

    private Task<int?> GetHomeShopIdAsync(int userId, CancellationToken ct) =>
        _db.Users.AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.HomeShopId)
            .SingleOrDefaultAsync(ct);
}
