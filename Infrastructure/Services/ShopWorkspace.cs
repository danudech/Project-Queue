using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Services;

public sealed class ShopWorkspace(QueueDbContext db, PermissionScopeService scope) : IShopWorkspace
{
    private async Task<bool> IsOwner(int userId, int shopId, CancellationToken ct) =>
        await db.Shops.AnyAsync(s => s.Id == shopId && s.OwnerId == userId && s.IsActive, ct)
        && await db.Users.AnyAsync(u => u.Id == userId && u.HomeShopId == shopId, ct);

    private async Task RequireOwner(int userId, int shopId, CancellationToken ct)
    {
        if (!await IsOwner(userId, shopId, ct)) throw new UnauthorizedAccessException();
    }

    public async Task<WorkspaceResponse> ReadAsync(int userId, int shopId, string module, int? branchId, DateTime? from, DateTime? to, int page, CancellationToken ct)
    {
        var result = new WorkspaceResponse();
        page = Math.Clamp(page, 1, 100000);
        if (module is "statuses" or "audit") await RequireOwner(userId, shopId, ct);
        else if (module is "tags" or "customers") await scope.EnsureShopAsync(userId, shopId, "customer.view", ct);
        else if (module is "categories" or "bookings")
        {
            if (!branchId.HasValue) throw new InvalidOperationException("Select a branch.");
            await scope.EnsureBranchAsync(userId, branchId.Value, module == "bookings" ? "booking.view" : "queue.view", ct);
            if (!await db.ShopBranches.AnyAsync(b => b.Id == branchId && b.ShopId == shopId, ct)) throw new UnauthorizedAccessException();
        }
        else if (module == "analytics") await RequireOwner(userId, shopId, ct);
        else throw new InvalidOperationException("Unknown module.");

        switch (module)
        {
            case "tags":
                result.CanEdit = await scope.HasShopAsync(userId, shopId, "customer.edit", ct);
                result.Rows = await db.CustomerTags.AsNoTracking().Where(t => t.ShopId == shopId)
                    .OrderBy(t => t.Name).Select(t => new WorkspaceRow(t.Id, t.Name, null, t.IsActive, null, null,
                        t.CustomerTagMaps.Count(m => m.Customer.ShopId == shopId))) .ToListAsync(ct);
                break;
            case "customers":
                var customers = db.Customers.AsNoTracking().Where(c => c.ShopId == shopId && c.IsActive);
                result.Total = await customers.CountAsync(ct);
                result.Rows = await customers.OrderBy(c => c.Name).ThenBy(c => c.Id).Skip((page - 1) * 50).Take(50)
                    .Select(c => new WorkspaceRow(c.Id, c.Name, c.Phone, c.IsActive, null, null, 0,
                        c.CustomerTagMaps.Where(m => m.Tag.ShopId == shopId).Select(m => m.TagId).ToList())).ToListAsync(ct);
                break;
            case "categories":
                result.CanEdit = await scope.HasBranchAsync(userId, branchId!.Value, "queue.manage", ct);
                result.Rows = await db.QueueCategories.AsNoTracking().Where(c => c.ShopId == shopId && c.BranchId == branchId)
                    .OrderBy(c => c.Name).Select(c => new WorkspaceRow(c.Id, c.Name, c.Description, c.IsActive, c.BranchId, c.Prefix, c.Bookings.Count)) .ToListAsync(ct);
                break;
            case "bookings":
                var bookings = db.Bookings.AsNoTracking().Where(b => b.BranchId == branchId);
                result.Total = await bookings.CountAsync(ct);
                result.Rows = await bookings.OrderByDescending(b => b.Id).Skip((page - 1) * 50).Take(50)
                    .Select(b => new WorkspaceRow(b.Id, b.GuestName ?? (b.User != null ? b.User.Name ?? "Booking" : "Booking"),
                        b.QueueSlot.Date.ToString() + " " + b.Status.NameEn, true, b.BranchId, null, 0,
                        b.QueueCategoryId.HasValue ? new List<int> { b.QueueCategoryId.Value } : new List<int>())).ToListAsync(ct);
                break;
            case "statuses":
                // Workflow codes are shared platform data. Shop owners may inspect them,
                // but changing them would alter other tenants and break state transitions.
                result.Rows = await db.MasterStatuses.AsNoTracking().Where(s => s.Type == "BOOKING_STATUS" || s.Type == "QUEUE_STATUS")
                    .OrderBy(s => s.Type).ThenBy(s => s.Id)
                    .Select(s => new WorkspaceRow(s.Id, s.NameTh + " / " + s.NameEn, s.Type + " / " + s.Code, s.IsActive)).ToListAsync(ct);
                break;
            case "audit":
                var logs = db.AuditLogs.AsNoTracking().Where(l => l.ShopId == shopId);
                result.Total = await logs.CountAsync(ct);
                result.Activities = await logs.OrderByDescending(l => l.Id).Skip((page - 1) * 50).Take(50)
                    .Select(l => new WorkspaceActivity(l.Id, l.TableName, l.RecordId, l.Action, l.CreatedAt, l.CreatedBy, l.NewValue)).ToListAsync(ct);
                break;
            case "analytics":
                var start = (from ?? DateTime.Today.AddDays(-29)).Date;
                var end = (to ?? DateTime.Today).Date.AddDays(1);
                if (end <= start || (end - start).TotalDays > 366) throw new InvalidOperationException("Select a date range of up to 366 days.");
                if (branchId.HasValue && !await db.ShopBranches.AnyAsync(b => b.Id == branchId && b.ShopId == shopId, ct)) throw new UnauthorizedAccessException();
                var range = db.Bookings.AsNoTracking().Where(b => b.Branch.ShopId == shopId && (!branchId.HasValue || b.BranchId == branchId) && b.QueueSlot.Date >= start && b.QueueSlot.Date < end);
                var queues = db.Queues.AsNoTracking().Where(q => q.Branch.ShopId == shopId && (!branchId.HasValue || q.BranchId == branchId) && q.CreatedAt >= start && q.CreatedAt < end);
                result.Metrics = [new("Bookings", await range.CountAsync(ct)), new("Queues", await queues.CountAsync(ct))];
                var bookingStats = await range.GroupBy(b => new { b.Status.Code, b.Status.NameTh, b.Status.NameEn }).Select(g => new { g.Key, Count = g.Count() }).ToListAsync(ct);
                var queueStats = await queues.GroupBy(q => new { q.Status.Code, q.Status.NameTh, q.Status.NameEn }).Select(g => new { g.Key, Count = g.Count() }).ToListAsync(ct);
                result.Rows = bookingStats.Select((g, i) => new WorkspaceRow(i, g.Key.NameTh + " / " + g.Key.NameEn, "BOOKING / " + g.Key.Code, true, Count: g.Count))
                    .Concat(queueStats.Select((g, i) => new WorkspaceRow(i + 1000, g.Key.NameTh + " / " + g.Key.NameEn, "QUEUE / " + g.Key.Code, true, Count: g.Count))).ToList();
                break;
        }
        if (module is not ("customers" or "bookings" or "audit")) result.Total = result.Rows.Count;
        return result;
    }

    public async Task SaveAsync(int userId, WorkspaceRequest request, CancellationToken ct)
    {
        // Serializable makes duplicate checks and assignments atomic on SQL Server.
        await using var transaction = db.Database.IsRelational() && db.Database.CurrentTransaction == null
            ? await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct) : null;
        var name = request.Name?.Trim() ?? "";
        if (request.Module is "tags" or "tag-assignment")
        {
            await scope.EnsureShopAsync(userId, request.ShopId, "customer.edit", ct);
            if (request.Module == "tag-assignment")
            {
                var customer = await db.Customers.SingleOrDefaultAsync(c => c.Id == request.CustomerId && c.ShopId == request.ShopId && c.IsActive, ct) ?? throw new KeyNotFoundException();
                var tag = await db.CustomerTags.SingleOrDefaultAsync(t => t.Id == request.TagId && t.ShopId == request.ShopId, ct) ?? throw new KeyNotFoundException();
                var map = await db.CustomerTagMaps.SingleOrDefaultAsync(m => m.CustomerId == customer.Id && m.TagId == tag.Id, ct);
                if (request.Delete) { if (map != null) db.CustomerTagMaps.Remove(map); }
                else if (!tag.IsActive) throw new InvalidOperationException("This tag is inactive.");
                else if (map == null) db.CustomerTagMaps.Add(new CustomerTagMap { CustomerId = customer.Id, TagId = tag.Id, CreatedAt = DateTime.UtcNow, CreatedBy = userId });
            }
            else
            {
                if (string.IsNullOrWhiteSpace(name)) throw new InvalidOperationException("Name is required.");
                var tag = request.Id.HasValue ? await db.CustomerTags.SingleOrDefaultAsync(t => t.Id == request.Id && t.ShopId == request.ShopId, ct) ?? throw new KeyNotFoundException() : new CustomerTag { ShopId = request.ShopId, CreatedAt = DateTime.UtcNow, CreatedBy = userId };
                if (await db.CustomerTags.AnyAsync(t => t.ShopId == request.ShopId && t.Name == name && t.Id != tag.Id, ct)) throw new InvalidOperationException("This name already exists.");
                tag.Name = name; tag.IsActive = !request.Delete && request.IsActive; tag.UpdatedAt = DateTime.UtcNow; tag.UpdatedBy = userId;
                if (!request.Id.HasValue) db.CustomerTags.Add(tag);
            }
        }
        else if (request.Module is "categories" or "category-assignment")
        {
            if (!request.BranchId.HasValue) throw new InvalidOperationException("Select a branch.");
            await scope.EnsureBranchAsync(userId, request.BranchId.Value, "queue.manage", ct);
            if (!await db.ShopBranches.AnyAsync(b => b.Id == request.BranchId && b.ShopId == request.ShopId, ct)) throw new UnauthorizedAccessException();
            if (request.Module == "category-assignment")
            {
                await scope.EnsureBranchAsync(userId, request.BranchId.Value, "booking.manage", ct);
                var booking = await db.Bookings.SingleOrDefaultAsync(b => b.Id == request.BookingId && b.BranchId == request.BranchId, ct) ?? throw new KeyNotFoundException();
                if (request.CategoryId.HasValue && !await db.QueueCategories.AnyAsync(c => c.Id == request.CategoryId && c.ShopId == request.ShopId && c.BranchId == request.BranchId && c.IsActive, ct)) throw new InvalidOperationException("Select an active category in this branch.");
                booking.QueueCategoryId = request.CategoryId;
                booking.UpdatedAt = DateTime.UtcNow; booking.UpdatedBy = userId;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(name) || !Regex.IsMatch(request.Prefix ?? "", "^[A-Z0-9]{1,5}$")) throw new InvalidOperationException("Name and a prefix of 1–5 uppercase letters or digits are required.");
                var category = request.Id.HasValue ? await db.QueueCategories.SingleOrDefaultAsync(c => c.Id == request.Id && c.ShopId == request.ShopId && c.BranchId == request.BranchId, ct) ?? throw new KeyNotFoundException() : new QueueCategory { ShopId = request.ShopId, BranchId = request.BranchId.Value, CreatedAt = DateTime.UtcNow, CreatedBy = userId };
                if (await db.QueueCategories.AnyAsync(c => c.BranchId == request.BranchId && c.Id != category.Id && (c.Name == name || c.Prefix == request.Prefix), ct)) throw new InvalidOperationException("This name or prefix already exists in the branch.");
                category.Name = name; category.Prefix = request.Prefix ?? ""; if (!request.Delete) category.Description = request.Description?.Trim(); category.IsActive = !request.Delete && request.IsActive; category.UpdatedAt = DateTime.UtcNow; category.UpdatedBy = userId;
                if (!request.Id.HasValue) db.QueueCategories.Add(category);
            }
        }
        else throw new InvalidOperationException("Unknown or read-only module.");
        // Save changes and the audit event together. Only identifiers and field names
        // are retained here; customer contact information is never copied into logs.
        if (request.Module == "tag-assignment") db.AuditLogs.Add(new AuditLog { ShopId = request.ShopId, TableName = request.Module, RecordId = (request.Id ?? request.CustomerId ?? request.BookingId ?? 0).ToString(), Action = request.Delete ? "DEACTIVATE_OR_UNLINK" : "SAVE", CreatedAt = DateTime.UtcNow, CreatedBy = userId, NewValue = JsonSerializer.Serialize(new { request.Id, request.BranchId, request.CustomerId, request.TagId, request.BookingId, request.CategoryId }) });
        await db.SaveChangesAsync(ct);
        if (transaction != null) await transaction.CommitAsync(ct);
    }
}






