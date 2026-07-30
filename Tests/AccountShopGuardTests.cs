using Microsoft.EntityFrameworkCore;
using Queue.Domain.Entities;
using Queue.Infrastructure.Persistence;
using Queue.Infrastructure.Services;
using Xunit;

namespace Queue.Tests;

public sealed class AccountShopGuardTests
{
    [Fact]
    public async Task EnsureCanJoin_rejects_another_shop()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb();
        db.Users.Add(User(1, homeShopId: 10));
        await db.SaveChangesAsync(ct);
        var guard = new AccountShopGuard(db);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(
            () => guard.EnsureCanJoinAsync(1, 20, ct));

        Assert.Contains("already linked to another shop", error.Message);
    }

    [Fact]
    public async Task Bind_allows_multiple_branches_in_the_same_shop()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb();
        db.Users.Add(User(1, homeShopId: 10));
        await db.SaveChangesAsync(ct);
        var guard = new AccountShopGuard(db);

        await guard.BindAsync(1, 10, ct);
        await db.SaveChangesAsync(ct);

        Assert.Equal(10, (await db.Users.SingleAsync(ct)).HomeShopId);
    }

    [Fact]
    public async Task Pending_invitation_from_another_shop_is_rejected()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb();
        db.ShopStaffs.Add(new ShopStaff
        {
            Id = 1,
            ShopId = 10,
            BranchId = 100,
            Name = "Pending user",
            Email = "staff@example.com",
            Role = "STAFF",
            CanLogin = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        var guard = new AccountShopGuard(db);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => guard.EnsureEmailCanJoinAsync(
                "staff@example.com",
                20,
                ct));
    }

    [Fact]
    public async Task Scoped_permission_rejects_a_shop_outside_the_accounts_home_shop()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb();
        var account = User(1, homeShopId: 20);
        var owner = User(2, homeShopId: 10);
        db.Users.AddRange(account, owner);
        db.Shops.Add(new Shop
        {
            Id = 10,
            Guid = Guid.NewGuid(),
            Name = "Another shop",
            OwnerId = owner.Id,
            Owner = owner,
            StatusId = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        var permissions = new PermissionScopeService(db);

        bool allowed = await permissions.HasShopAsync(
            account.Id,
            10,
            "shop.view",
            ct);

        Assert.False(allowed);
    }

    private static QueueDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<QueueDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new QueueDbContext(options);
    }

    private static User User(int id, int? homeShopId) => new()
    {
        Id = id,
        Guid = Guid.NewGuid(),
        Name = $"User {id}",
        Email = $"user{id}@example.com",
        StatusId = 1,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        HomeShopId = homeShopId,
    };
}
