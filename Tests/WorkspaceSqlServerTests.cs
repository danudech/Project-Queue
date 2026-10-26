using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Request;
using Queue.Domain.Entities;
using Queue.Infrastructure.Persistence;
using Queue.Infrastructure.Services;
using Xunit;

namespace Queue.Tests;

public sealed class WorkspaceSqlServerTests
{
    [Fact]
    public async Task SqlServer_workspace_queries_and_tag_writes_work_in_a_rolled_back_transaction()
    {
        var connection = Environment.GetEnvironmentVariable("EZQUEUE_TEST_SQLSERVER");
        if (string.IsNullOrWhiteSpace(connection)) Assert.Skip("Set EZQUEUE_TEST_SQLSERVER to run the development SQL Server integration check.");
        var ct = TestContext.Current.CancellationToken;
        await using var db = new QueueDbContext(new DbContextOptionsBuilder<QueueDbContext>().UseSqlServer(connection).Options);
        await using var transaction = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        var shop = await db.Shops.AsNoTracking().Where(s => s.IsActive && s.Owner.HomeShopId == s.Id).FirstOrDefaultAsync(ct);
        if (shop == null) Assert.Skip("No active shop with an owner is available for SQL integration testing.");
        var service = new ShopWorkspace(db, new PermissionScopeService(db));
        foreach (var module in new[] { "tags", "customers", "analytics", "statuses", "audit" })
            await service.ReadAsync(shop.OwnerId, shop.Id, module, null, null, null, 1, ct);
        var from = DateTime.Today.AddDays(-29);
        var until = DateTime.Today.AddDays(1);
        var report = await service.ReadAsync(shop.OwnerId, shop.Id, "analytics", null, from, DateTime.Today, 1, ct);
        Assert.Equal(await db.Bookings.CountAsync(b => b.Branch.ShopId == shop.Id && b.QueueSlot.Date >= from && b.QueueSlot.Date < until, ct), report.Metrics.Single(m => m.Name == "Bookings").Value);
        Assert.Equal(await db.Queues.CountAsync(q => q.Branch.ShopId == shop.Id && q.CreatedAt >= from && q.CreatedAt < until, ct), report.Metrics.Single(m => m.Name == "Queues").Value);
        var branch = await db.ShopBranches.AsNoTracking().Where(b => b.ShopId == shop.Id && b.IsActive).FirstOrDefaultAsync(ct);
        if (branch != null)
        {
            await service.ReadAsync(shop.OwnerId, shop.Id, "categories", branch.Id, null, null, 1, ct);
            await service.ReadAsync(shop.OwnerId, shop.Id, "bookings", branch.Id, null, null, 1, ct);
            var prefix = Guid.NewGuid().ToString("N")[..5].ToUpperInvariant();
            await service.SaveAsync(shop.OwnerId, new WorkspaceRequest { ShopId = shop.Id, BranchId = branch.Id, Module = "categories", Name = "Verification-" + Guid.NewGuid().ToString("N"), Prefix = prefix }, ct);
            var category = await db.QueueCategories.SingleAsync(c => c.BranchId == branch.Id && c.Prefix == prefix, ct);
            var booking = await db.Bookings.FirstOrDefaultAsync(b => b.BranchId == branch.Id, ct);
            if (booking != null)
            {
                await service.SaveAsync(shop.OwnerId, new WorkspaceRequest { ShopId = shop.Id, BranchId = branch.Id, Module = "category-assignment", BookingId = booking.Id, CategoryId = category.Id }, ct);
                Assert.Equal(category.Id, (await db.Bookings.AsNoTracking().SingleAsync(b => b.Id == booking.Id, ct)).QueueCategoryId);
            }
        }
        var name = "Verification-" + Guid.NewGuid().ToString("N");
        await service.SaveAsync(shop.OwnerId, new WorkspaceRequest { ShopId = shop.Id, Module = "tags", Name = name }, ct);
        var tag = await db.CustomerTags.SingleAsync(t => t.ShopId == shop.Id && t.Name == name, ct);
        Assert.True(tag.IsActive);
        Assert.True(await db.AuditLogs.AnyAsync(l => l.ShopId == shop.Id && l.RecordId == tag.Id.ToString() && l.TableName == "CustomerTags", ct));
        var customer = await db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.ShopId == shop.Id && c.IsActive, ct);
        if (customer != null)
        {
            await service.SaveAsync(shop.OwnerId, new WorkspaceRequest { ShopId = shop.Id, Module = "tag-assignment", CustomerId = customer.Id, TagId = tag.Id }, ct);
            Assert.True(await db.CustomerTagMaps.AnyAsync(m => m.CustomerId == customer.Id && m.TagId == tag.Id, ct));
        }
        await transaction.RollbackAsync(ct);
    }
}
