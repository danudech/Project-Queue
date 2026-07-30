using Microsoft.EntityFrameworkCore;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Services;

public sealed class RoleClaimsService
{
    private readonly QueueDbContext _db;

    public RoleClaimsService(QueueDbContext db) => _db = db;

    public async Task<(string Role, string[] Permissions)> ResolveAsync(
        int userId,
        CancellationToken ct)
    {
        int? homeShopId = await _db.Users.AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.HomeShopId)
            .SingleOrDefaultAsync(ct);
        var assignments = new List<(int ShopId, string RoleCode)>();
        assignments.AddRange(await _db.Shops.AsNoTracking()
            .Where(shop => shop.OwnerId == userId
                && shop.IsActive
                && (!homeShopId.HasValue || shop.Id == homeShopId.Value))
            .Select(shop => new ValueTuple<int, string>(shop.Id, "ShopOwner"))
            .ToListAsync(ct));
        assignments.AddRange(await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.UserId == userId
                && map.IsActive
                && (!homeShopId.HasValue || map.ShopId == homeShopId.Value))
            .Select(map => new ValueTuple<int, string>(map.ShopId, map.RoleCode))
            .ToListAsync(ct));
        assignments.AddRange(await _db.BranchUserRoleMaps.AsNoTracking()
            .Where(map => map.UserId == userId
                && map.IsActive
                && (!homeShopId.HasValue || map.Branch.ShopId == homeShopId.Value))
            .Select(map => new ValueTuple<int, string>(map.Branch.ShopId, map.RoleCode))
            .ToListAsync(ct));
        assignments = assignments.Distinct().ToList();

        var grantedPermissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var assignment in assignments)
        {
            var rolePermissions = await _db.ShopRolePermissions.AsNoTracking()
                .Where(permission =>
                    permission.RoleCode == assignment.RoleCode
                    && (permission.ShopId == null || permission.ShopId == assignment.ShopId))
                .ToListAsync(ct);
            foreach (var group in rolePermissions.GroupBy(permission => permission.PermissionCode))
            {
                var shopOverride = group.FirstOrDefault(permission => permission.ShopId == assignment.ShopId);
                bool isGranted = shopOverride?.IsGranted
                    ?? group.Any(permission => permission.ShopId == null && permission.IsGranted);
                if (isGranted) grantedPermissions.Add(group.Key);
            }
        }

        bool isAdmin = await _db.UserRoleMaps.AsNoTracking()
            .AnyAsync(map => map.UserId == userId && (map.RoleId == 1 || map.Role.Name == "Admin"), ct);
        if (isAdmin && !homeShopId.HasValue)
            grantedPermissions.Add("system.admin");

        string role = assignments.FirstOrDefault().RoleCode
            ?? (isAdmin ? "Admin" : "Customer");
        return (role, grantedPermissions.OrderBy(code => code).ToArray());
    }
}
