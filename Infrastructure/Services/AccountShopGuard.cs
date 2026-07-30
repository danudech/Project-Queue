using Microsoft.EntityFrameworkCore;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Services;

/// <summary>
/// Enforces the product invariant that one account belongs to exactly one shop.
/// A user can still work in multiple branches of that same shop.
/// </summary>
public sealed class AccountShopGuard
{
    private readonly QueueDbContext _db;

    public AccountShopGuard(QueueDbContext db) => _db = db;

    public async Task EnsureCanJoinAsync(int userId, int shopId, CancellationToken ct)
    {
        int? currentShopId = await _db.Users.AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.HomeShopId)
            .SingleOrDefaultAsync(ct);

        if (currentShopId.HasValue && currentShopId.Value != shopId)
            throw new InvalidOperationException(
                "This account is already linked to another shop. Use a different account for this shop.");
    }

    public async Task BindAsync(int userId, int shopId, CancellationToken ct)
    {
        var user = await _db.Users.SingleOrDefaultAsync(item => item.Id == userId, ct)
            ?? throw new KeyNotFoundException("User not found.");
        if (user.HomeShopId.HasValue && user.HomeShopId.Value != shopId)
            throw new InvalidOperationException(
                "This account is already linked to another shop. Use a different account for this shop.");
        user.HomeShopId = shopId;
    }

    public async Task EnsureEmailCanJoinAsync(string email, int shopId, CancellationToken ct)
    {
        string normalized = email.Trim().ToLower();
        int? userId = await _db.Users.AsNoTracking()
            .Where(user => user.Email != null && user.Email.ToLower() == normalized)
            .Select(user => (int?)user.Id)
            .SingleOrDefaultAsync(ct);
        if (userId.HasValue)
        {
            await EnsureCanJoinAsync(userId.Value, shopId, ct);
        }

        bool pendingAtAnotherShop = await _db.ShopStaffs.AsNoTracking().AnyAsync(staff =>
            staff.UserId == null
            && staff.CanLogin
            && staff.IsActive
            && staff.Email != null
            && staff.Email.ToLower() == normalized
            && staff.ShopId != shopId, ct);
        if (pendingAtAnotherShop)
            throw new InvalidOperationException(
                "This email already has a pending invitation from another shop.");
    }
}
