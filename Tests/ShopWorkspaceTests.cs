using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Request;
using Queue.Domain.Entities;
using Queue.Infrastructure.Persistence;
using Queue.Infrastructure.Services;
using Xunit;

namespace Queue.Tests;

public sealed class ShopWorkspaceTests
{
    private static QueueDbContext CreateDb() => new(new DbContextOptionsBuilder<QueueDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static async Task Seed(QueueDbContext db, CancellationToken ct)
    {
        db.Users.AddRange(new User { Id = 1, HomeShopId = 10, Name = "Owner", Email = "owner@example.test", IsActive = true },
            new User { Id = 2, HomeShopId = 20, Name = "Other", Email = "other@example.test", IsActive = true },
            new User { Id = 3, HomeShopId = 10, Name = "Staff", Email = "staff@example.test", IsActive = true });
        db.Shops.AddRange(new Shop { Id = 10, OwnerId = 1, Name = "Shop", IsActive = true }, new Shop { Id = 20, OwnerId = 2, Name = "Other", IsActive = true });
        db.ShopBranches.AddRange(new ShopBranch { Id = 100, ShopId = 10, Name = "Main", Phone = "0811111111", IsActive = true }, new ShopBranch { Id = 200, ShopId = 20, Name = "Other", Phone = "0822222222", IsActive = true });
        db.Customers.AddRange(new Customer { Id = 1, ShopId = 10, Name = "Customer", Phone = "0811111111", IsActive = true }, new Customer { Id = 2, ShopId = 20, Name = "Other", Phone = "0822222222", IsActive = true });
        db.CustomerTags.AddRange(new CustomerTag { Id = 1, ShopId = 10, Name = "VIP", IsActive = true }, new CustomerTag { Id = 2, ShopId = 20, Name = "Private", IsActive = true }, new CustomerTag { Id = 3, Name = "Legacy", IsActive = true });
        await db.SaveChangesAsync(ct);
    }

    [Fact]
    public async Task Tags_exclude_other_shops_and_legacy_global_records()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        var response = await service.ReadAsync(1, 10, "tags", null, null, null, 1, ct);
        Assert.Equal("VIP", Assert.Single(response.Rows).Name);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ReadAsync(1, 20, "tags", null, null, null, 1, ct));
    }

    [Fact]
    public async Task Assigning_a_foreign_tag_or_customer_is_rejected()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, Module = "tag-assignment", CustomerId = 1, TagId = 2 }, ct));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, Module = "tag-assignment", CustomerId = 2, TagId = 1 }, ct));
        Assert.Empty(await db.CustomerTagMaps.ToListAsync(ct));
    }

    [Fact]
    public async Task Tag_assignment_persists_and_can_be_removed_without_deleting_customer()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        var request = new WorkspaceRequest { ShopId = 10, Module = "tag-assignment", CustomerId = 1, TagId = 1 };
        await service.SaveAsync(1, request, ct);
        Assert.Single(await db.CustomerTagMaps.ToListAsync(ct));
        request.Delete = true;
        await service.SaveAsync(1, request, ct);
        Assert.Empty(await db.CustomerTagMaps.ToListAsync(ct));
        Assert.Equal(2, await db.Customers.CountAsync(ct));
    }

    [Fact]
    public async Task Deactivation_preserves_existing_tag_assignments()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        db.CustomerTagMaps.Add(new CustomerTagMap { CustomerId = 1, TagId = 1 }); await db.SaveChangesAsync(ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        await service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, Module = "tags", Id = 1, Name = "VIP", Delete = true }, ct);
        Assert.False((await db.CustomerTags.SingleAsync(t => t.Id == 1, ct)).IsActive);
        Assert.Single(await db.CustomerTagMaps.ToListAsync(ct));
    }

    [Theory]
    [InlineData("audit")]
    [InlineData("statuses")]
    [InlineData("analytics")]
    public async Task Owner_modules_reject_nonowners_and_foreign_owners(string module)
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ReadAsync(3, 10, module, null, null, null, 1, ct));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ReadAsync(2, 10, module, null, null, null, 1, ct));
    }

    [Fact]
    public async Task Categories_reject_foreign_branch_and_duplicate_prefix()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, BranchId = 200, Module = "categories", Name = "Test", Prefix = "T" }, ct));
        await service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, BranchId = 100, Module = "categories", Name = "Appointment", Prefix = "A" }, ct);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.SaveAsync(1, new WorkspaceRequest { ShopId = 10, BranchId = 100, Module = "categories", Name = "Another", Prefix = "A" }, ct));
    }

    [Fact]
    public async Task Audit_is_scoped_and_does_not_copy_customer_contact_values()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var customer = await db.Customers.SingleAsync(c => c.Id == 1, ct);
        customer.Phone = "0899999999"; customer.UpdatedBy = 1;
        await db.SaveChangesAsync(ct);
        var response = await new ShopWorkspace(db, new PermissionScopeService(db)).ReadAsync(1, 10, "audit", null, null, null, 1, ct);
        Assert.Contains(response.Activities, a => (a.TableName == "Customers" || a.TableName == "Customer") && a.Fields!.Contains("Phone"));
        Assert.DoesNotContain(response.Activities, a => a.Fields?.Contains("0899999999") == true);
        var expected = await db.AuditLogs.CountAsync(l => l.ShopId == 10, ct);
        Assert.Equal(expected, response.Total);
    }

    [Fact]
    public async Task Analytics_validates_range_and_returns_real_empty_counts()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var db = CreateDb(); await Seed(db, ct);
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        var result = await service.ReadAsync(1, 10, "analytics", null, null, null, 1, ct);
        Assert.All(result.Metrics, metric => Assert.Equal(0, metric.Value));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReadAsync(1, 10, "analytics", null, DateTime.Today, DateTime.Today.AddDays(-1), 1, ct));
    }
}



