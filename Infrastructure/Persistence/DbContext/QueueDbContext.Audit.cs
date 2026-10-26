using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Queue.Domain.Entities;
using System.Text.Json;

namespace Queue.Infrastructure.Persistence;

public partial class QueueDbContext
{
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ChangeTracker.DetectChanges();
        var pending = new List<(EntityEntry Entry, int ShopId, string Action, string Fields, int? Actor)>();
        foreach (var entry in ChangeTracker.Entries().Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted).ToList())
        {
            // Restrict auditing to operational entities; never serialize credentials,
            // contact details, tokens, messages, or configuration values.
            if (entry.Entity is not (Shop or ShopBranch or ShopSetting or ShopBusinessHour or ShopHoliday or ShopStaff or Domain.Entities.Service or ServiceCategory or Customer or CustomerNote or CustomerTag or QueueCategory or Booking or Domain.Entities.Queue or ShopRole or ShopRolePermission or ShopUserRoleMap or BranchUserRoleMap)) continue;
            int? shopId = entry.Entity is Shop shop ? shop.Id : entry.Metadata.FindProperty("ShopId") != null ? entry.Property("ShopId").CurrentValue as int? : null;
            if (!shopId.HasValue && entry.Metadata.FindProperty("BranchId") != null && entry.Property("BranchId").CurrentValue is int branchId)
                shopId = await ShopBranches.AsNoTracking().Where(b => b.Id == branchId).Select(b => (int?)b.ShopId).SingleOrDefaultAsync(cancellationToken);
            if (!shopId.HasValue && entry.Entity is CustomerNote note)
                shopId = await Customers.AsNoTracking().Where(c => c.Id == note.CustomerId).Select(c => (int?)c.ShopId).SingleOrDefaultAsync(cancellationToken);
            if (!shopId.HasValue || shopId <= 0) continue;
            var actorProperty = entry.Metadata.FindProperty("UpdatedBy") != null && entry.Property("UpdatedBy").CurrentValue != null ? "UpdatedBy" : "CreatedBy";
            int? actor = entry.Metadata.FindProperty(actorProperty) != null ? entry.Property(actorProperty).CurrentValue as int? : null;
            pending.Add((entry, shopId.Value, entry.State.ToString(), JsonSerializer.Serialize(entry.Properties.Where(p => p.IsModified || entry.State != EntityState.Modified).Select(p => p.Metadata.Name).ToArray()), actor));
        }
        if (pending.Count == 0) return await base.SaveChangesAsync(cancellationToken);
        await using var transaction = Database.IsRelational() && Database.CurrentTransaction == null
            ? await Database.BeginTransactionAsync(cancellationToken) : null;
        var result = await base.SaveChangesAsync(cancellationToken);
        foreach (var record in pending)
        {
            var key = string.Join(",", record.Entry.Metadata.FindPrimaryKey()!.Properties.Select(p => record.Entry.Property(p.Name).CurrentValue?.ToString() ?? ""));
            AuditLogs.Add(new AuditLog { ShopId = record.ShopId, TableName = record.Entry.Metadata.GetTableName() ?? record.Entry.Metadata.ClrType.Name, RecordId = key.Length <= 100 ? key : key[..100], Action = record.Action, CreatedAt = DateTime.UtcNow, CreatedBy = record.Actor, NewValue = record.Fields });
        }
        await base.SaveChangesAsync(cancellationToken);
        if (transaction != null) await transaction.CommitAsync(cancellationToken);
        return result;
    }
}

