using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class RoleManagement : IRoleManagement
{
    private static readonly (string Code, string Group)[] PermissionCatalog =
    {
        ("shop.view", "shop"), ("shop.edit", "shop"),
        ("branch.view", "branch"), ("branch.create", "branch"), ("branch.edit", "branch"),
        ("staff.view", "staff"), ("staff.invite", "staff"), ("staff.edit", "staff"), ("staff.remove", "staff"),
        ("role.assign", "role"),
        ("service.view", "service"), ("service.create", "service"), ("service.edit", "service"), ("service.delete", "service"),
        ("customer.view", "customer"), ("customer.manage", "customer"),
        ("booking.view", "booking"), ("booking.manage", "booking"),
        ("queue.view", "queue"), ("queue.manage", "queue"),
        ("setting.view", "setting"), ("setting.edit", "setting"),
    };

    private static readonly HashSet<string> PermissionCodes =
        PermissionCatalog.Select(item => item.Code).ToHashSet(StringComparer.OrdinalIgnoreCase);

    private readonly QueueDbContext _db;
    private readonly AccountShopGuard _accountShopGuard;

    public RoleManagement(QueueDbContext db, AccountShopGuard accountShopGuard)
    {
        _db = db;
        _accountShopGuard = accountShopGuard;
    }

    public Task<List<PermissionCatalogResponse>> GetPermissionCatalogAsync(CancellationToken ct) =>
        Task.FromResult(PermissionCatalog
            .Select(item => new PermissionCatalogResponse { Code = item.Code, Group = item.Group })
            .ToList());

    public async Task<List<ShopRoleResponse>> GetRolesAsync(int userId, int shopId, CancellationToken ct)
    {
        await EnsureRoleAccessAsync(userId, shopId, ct, allowStaffView: true);
        string customPrefix = CustomPrefix(shopId);
        var roles = await _db.ShopRoles.AsNoTracking()
            .Where(role => role.IsSystem || role.Code.StartsWith(customPrefix))
            .OrderByDescending(role => role.IsSystem)
            .ThenBy(role => role.Id)
            .ToListAsync(ct);
        var permissions = await _db.ShopRolePermissions.AsNoTracking()
            .Where(permission => permission.ShopId == null || permission.ShopId == shopId)
            .ToListAsync(ct);
        var shopAssignments = await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.ShopId == shopId && map.IsActive)
            .GroupBy(map => map.RoleCode)
            .Select(group => new { RoleCode = group.Key, Count = group.Select(map => map.UserId).Distinct().Count() })
            .ToListAsync(ct);
        var branchAssignments = await _db.BranchUserRoleMaps.AsNoTracking()
            .Where(map => map.Branch.ShopId == shopId && map.IsActive)
            .GroupBy(map => map.RoleCode)
            .Select(group => new { RoleCode = group.Key, Count = group.Select(map => map.UserId).Distinct().Count() })
            .ToListAsync(ct);
        var pendingAssignments = await _db.ShopStaffs.AsNoTracking()
            .Where(staff => staff.ShopId == shopId && staff.IsActive && staff.CanLogin && staff.UserId == null)
            .GroupBy(staff => staff.SystemRoleCode)
            .Select(group => new { RoleCode = group.Key, Count = group.Count() })
            .ToListAsync(ct);

        return roles.Select(role => new ShopRoleResponse
        {
            Code = role.Code,
            Label = role.Label,
            Scope = role.Scope,
            IsSystem = role.IsSystem,
            IsActive = role.IsActive,
            UserCount =
                (shopAssignments.FirstOrDefault(item => item.RoleCode == role.Code)?.Count ?? 0)
                + (branchAssignments.FirstOrDefault(item => item.RoleCode == role.Code)?.Count ?? 0)
                + (pendingAssignments.FirstOrDefault(item => item.RoleCode == role.Code)?.Count ?? 0),
            PermissionCodes = ResolvePermissions(role.Code, shopId, permissions),
        }).ToList();
    }

    public async Task<ShopRoleResponse> CreateRoleAsync(
        int userId,
        RoleUpsertRequest request,
        CancellationToken ct)
    {
        await EnsureRoleAccessAsync(userId, request.ShopId, ct);
        ValidateRequest(request);
        string slug = Regex.Replace(request.Label.Trim().ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        if (string.IsNullOrEmpty(slug)) slug = Guid.NewGuid().ToString("N")[..8];
        string baseCode = $"{CustomPrefix(request.ShopId)}{slug}";
        string code = baseCode.Length <= 50 ? baseCode : baseCode[..50];
        int suffix = 2;
        while (await _db.ShopRoles.AnyAsync(role => role.Code == code, ct))
        {
            string suffixText = $"-{suffix++}";
            code = $"{baseCode[..Math.Min(baseCode.Length, 50 - suffixText.Length)]}{suffixText}";
        }

        var role = new ShopRole
        {
            Code = code,
            Label = request.Label.Trim(),
            Scope = NormalizeScope(request.Scope),
            IsSystem = false,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
        };
        _db.ShopRoles.Add(role);
        await ReplacePermissionsAsync(request.ShopId, code, request.PermissionCodes, userId, ct);
        await _db.SaveChangesAsync(ct);
        return await GetRoleAsync(request.ShopId, code, ct);
    }

    public async Task<ShopRoleResponse> UpdateRoleAsync(
        int userId,
        string code,
        RoleUpsertRequest request,
        CancellationToken ct)
    {
        await EnsureRoleAccessAsync(userId, request.ShopId, ct);
        ValidateRequest(request);
        var role = await GetApplicableRoleAsync(request.ShopId, code, ct);
        if (!role.IsSystem)
        {
            role.Label = request.Label.Trim();
            role.Scope = NormalizeScope(request.Scope);
            role.IsActive = request.IsActive;
        }
        role.UpdatedAt = DateTime.UtcNow;
        role.UpdatedBy = userId;
        await ReplacePermissionsAsync(request.ShopId, role.Code, request.PermissionCodes, userId, ct);
        await _db.SaveChangesAsync(ct);
        return await GetRoleAsync(request.ShopId, role.Code, ct);
    }

    public async Task<bool> DeleteRoleAsync(
        int userId,
        int shopId,
        string code,
        CancellationToken ct)
    {
        await EnsureRoleAccessAsync(userId, shopId, ct);
        var role = await GetApplicableRoleAsync(shopId, code, ct);
        if (role.IsSystem)
            throw new InvalidOperationException("System roles cannot be deleted.");

        bool assigned =
            await _db.ShopUserRoleMaps.AnyAsync(map => map.ShopId == shopId && map.RoleCode == code && map.IsActive, ct)
            || await _db.BranchUserRoleMaps.AnyAsync(map => map.Branch.ShopId == shopId && map.RoleCode == code && map.IsActive, ct)
            || await _db.ShopStaffs.AnyAsync(staff => staff.ShopId == shopId && staff.SystemRoleCode == code && staff.IsActive, ct);
        if (assigned)
            throw new InvalidOperationException("This role is assigned to staff and cannot be deleted.");

        var permissions = await _db.ShopRolePermissions
            .Where(permission => permission.ShopId == shopId && permission.RoleCode == code)
            .ToListAsync(ct);
        _db.ShopRolePermissions.RemoveRange(permissions);
        _db.ShopRoles.Remove(role);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<StaffResponse> AssignStaffRoleAsync(
        int userId,
        int staffId,
        StaffRoleAssignmentRequest request,
        CancellationToken ct)
    {
        await EnsureRoleAccessAsync(userId, request.ShopId, ct);
        var staff = await _db.ShopStaffs
            .Include(item => item.User).ThenInclude(user => user!.UserAuthentications)
            .Include(item => item.User).ThenInclude(user => user!.UserImages)
            .Include(item => item.ServiceStaffMaps)
            .FirstOrDefaultAsync(item =>
                item.Id == staffId
                && item.ShopId == request.ShopId
                && item.BranchId == request.BranchId, ct)
            ?? throw new KeyNotFoundException("Staff member not found.");
        if (!staff.CanLogin)
            throw new InvalidOperationException("Enable system access before assigning a system role.");

        var role = await GetApplicableRoleAsync(request.ShopId, request.RoleCode, ct);
        if (!role.IsActive)
            throw new InvalidOperationException("The selected role is inactive.");
        staff.SystemRoleCode = role.Code;
        staff.UpdatedAt = DateTime.UtcNow;
        staff.UpdatedBy = userId;
        if (staff.UserId.HasValue)
        {
            await _accountShopGuard.BindAsync(staff.UserId.Value, staff.ShopId, ct);
            await SyncUserRoleMapsAsync(staff, role, userId, ct);
        }
        await _db.SaveChangesAsync(ct);
        return ToStaffResponse(staff);
    }

    private async Task ReplacePermissionsAsync(
        int shopId,
        string roleCode,
        IEnumerable<string> requestedCodes,
        int userId,
        CancellationToken ct)
    {
        var selected = requestedCodes
            .Where(code => PermissionCodes.Contains(code))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var existing = await _db.ShopRolePermissions
            .Where(permission => permission.ShopId == shopId && permission.RoleCode == roleCode)
            .ToListAsync(ct);
        _db.ShopRolePermissions.RemoveRange(existing);
        _db.ShopRolePermissions.AddRange(PermissionCatalog.Select(item => new ShopRolePermission
        {
            ShopId = shopId,
            RoleCode = roleCode,
            PermissionCode = item.Code,
            IsGranted = selected.Contains(item.Code),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
        }));
    }

    private async Task EnsureRoleAccessAsync(
        int userId,
        int shopId,
        CancellationToken ct,
        bool allowStaffView = false)
    {
        await _accountShopGuard.EnsureCanJoinAsync(userId, shopId, ct);
        var shop = await _db.Shops.AsNoTracking().FirstOrDefaultAsync(item => item.Id == shopId, ct)
            ?? throw new KeyNotFoundException("Shop not found.");
        if (shop.OwnerId == userId) return;

        var roleCodes = await _db.ShopUserRoleMaps.AsNoTracking()
            .Where(map => map.ShopId == shopId && map.UserId == userId && map.IsActive)
            .Select(map => map.RoleCode)
            .Concat(_db.BranchUserRoleMaps.AsNoTracking()
                .Where(map => map.Branch.ShopId == shopId && map.UserId == userId && map.IsActive)
                .Select(map => map.RoleCode))
            .Distinct()
            .ToListAsync(ct);
        foreach (string roleCode in roleCodes)
        {
            string[] accepted = allowStaffView
                ? new[] { "role.assign", "staff.view" }
                : new[] { "role.assign" };
            foreach (string permissionCode in accepted)
            {
                var shopOverride = await _db.ShopRolePermissions.AsNoTracking()
                    .FirstOrDefaultAsync(permission =>
                        permission.ShopId == shopId
                        && permission.RoleCode == roleCode
                        && permission.PermissionCode == permissionCode, ct);
                if (shopOverride?.IsGranted == true) return;
                if (shopOverride == null && await _db.ShopRolePermissions.AsNoTracking().AnyAsync(permission =>
                        permission.ShopId == null
                        && permission.RoleCode == roleCode
                        && permission.PermissionCode == permissionCode
                        && permission.IsGranted, ct))
                    return;
            }
        }
        throw new UnauthorizedAccessException("You do not have permission to manage roles.");
    }

    private async Task<ShopRole> GetApplicableRoleAsync(int shopId, string code, CancellationToken ct)
    {
        string customPrefix = CustomPrefix(shopId);
        return await _db.ShopRoles.FirstOrDefaultAsync(
            role => role.Code == code && (role.IsSystem || role.Code.StartsWith(customPrefix)), ct)
            ?? throw new KeyNotFoundException("Role not found.");
    }

    private async Task<ShopRoleResponse> GetRoleAsync(int shopId, string code, CancellationToken ct)
    {
        var role = await GetApplicableRoleAsync(shopId, code, ct);
        var permissions = await _db.ShopRolePermissions.AsNoTracking()
            .Where(permission =>
                permission.RoleCode == code
                && (permission.ShopId == null || permission.ShopId == shopId))
            .ToListAsync(ct);
        return new ShopRoleResponse
        {
            Code = role.Code,
            Label = role.Label,
            Scope = role.Scope,
            IsSystem = role.IsSystem,
            IsActive = role.IsActive,
            PermissionCodes = ResolvePermissions(code, shopId, permissions),
        };
    }

    private static List<string> ResolvePermissions(
        string roleCode,
        int shopId,
        IEnumerable<ShopRolePermission> permissions)
    {
        var relevant = permissions.Where(item => item.RoleCode == roleCode).ToList();
        return PermissionCatalog
            .Where(catalogItem =>
            {
                var custom = relevant.FirstOrDefault(item =>
                    item.ShopId == shopId && item.PermissionCode == catalogItem.Code);
                return custom?.IsGranted
                    ?? relevant.Any(item =>
                        item.ShopId == null
                        && item.PermissionCode == catalogItem.Code
                        && item.IsGranted);
            })
            .Select(item => item.Code)
            .ToList();
    }

    private async Task SyncUserRoleMapsAsync(
        ShopStaff staff,
        ShopRole role,
        int grantedBy,
        CancellationToken ct)
    {
        int userId = staff.UserId!.Value;
        var shopMaps = await _db.ShopUserRoleMaps
            .Where(map => map.ShopId == staff.ShopId && map.UserId == userId)
            .ToListAsync(ct);
        var branchMaps = await _db.BranchUserRoleMaps
            .Where(map => map.BranchId == staff.BranchId && map.UserId == userId)
            .ToListAsync(ct);
        _db.ShopUserRoleMaps.RemoveRange(shopMaps);
        _db.BranchUserRoleMaps.RemoveRange(branchMaps);
        if (role.Scope.Equals("Shop", StringComparison.OrdinalIgnoreCase))
        {
            _db.ShopUserRoleMaps.Add(new ShopUserRoleMap
            {
                ShopId = staff.ShopId,
                UserId = userId,
                RoleCode = role.Code,
                IsActive = true,
                GrantedBy = grantedBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = grantedBy,
            });
        }
        else
        {
            _db.BranchUserRoleMaps.Add(new BranchUserRoleMap
            {
                BranchId = staff.BranchId,
                UserId = userId,
                RoleCode = role.Code,
                IsActive = true,
                GrantedBy = grantedBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = grantedBy,
            });
        }
    }

    private static StaffResponse ToStaffResponse(ShopStaff staff) => new()
    {
        Id = staff.Id,
        ShopId = staff.ShopId,
        BranchId = staff.BranchId,
        UserId = staff.UserId,
        Name = staff.Name,
        Email = staff.Email ?? staff.User?.Email,
        Phone = staff.Phone ?? staff.User?.Phone,
        Role = staff.Role,
        SystemRoleCode = staff.SystemRoleCode,
        CanServeQueues = staff.CanServeQueues,
        CanLogin = staff.CanLogin,
        IsAvailable = staff.IsAvailable,
        IsActive = staff.IsActive,
        EmailConfirmed = staff.User?.EmailConfirmed,
        LastLoginAt = staff.User?.UserAuthentications.FirstOrDefault()?.LastLoginAt,
        ProfilePictureUrl = staff.ProfilePictureUrl
            ?? staff.User?.UserImages.FirstOrDefault(image => image.IsPrimary)?.FileUrl,
        HasCustomProfilePicture = !string.IsNullOrWhiteSpace(staff.ProfilePictureUrl),
        ServiceIds = staff.ServiceStaffMaps.Select(map => map.ServiceId).ToList(),
    };

    private static void ValidateRequest(RoleUpsertRequest request)
    {
        if (request.ShopId <= 0) throw new InvalidOperationException("Shop is required.");
        if (string.IsNullOrWhiteSpace(request.Label)) throw new InvalidOperationException("Role name is required.");
        if (request.Label.Trim().Length > 100) throw new InvalidOperationException("Role name must not exceed 100 characters.");
        string scope = NormalizeScope(request.Scope);
        if (request.PermissionCodes.Any(code => !PermissionCodes.Contains(code)))
            throw new InvalidOperationException("One or more permissions are invalid.");
        if (request.PermissionCodes.Any(code => !IsPermissionAllowedForScope(scope, code)))
            throw new InvalidOperationException("A branch role cannot be granted shop-wide permissions.");
    }

    private static bool IsPermissionAllowedForScope(string scope, string permissionCode) =>
        scope == "Shop"
        || (!permissionCode.StartsWith("shop.", StringComparison.OrdinalIgnoreCase)
            && !permissionCode.Equals("branch.create", StringComparison.OrdinalIgnoreCase));

    private static string NormalizeScope(string scope) =>
        scope.Equals("Shop", StringComparison.OrdinalIgnoreCase) ? "Shop"
        : scope.Equals("Branch", StringComparison.OrdinalIgnoreCase) ? "Branch"
        : throw new InvalidOperationException("Role scope must be Shop or Branch.");

    private static string CustomPrefix(int shopId) => $"Custom_{shopId}_";
}
