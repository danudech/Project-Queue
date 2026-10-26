using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Migrations;

public sealed partial class ScopeWorkspaceData : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>("ShopId", "CustomerTags", nullable: true);
        migrationBuilder.AddColumn<int>("ShopId", "AuditLogs", nullable: true);
        // Preserve all legacy tags and mappings. Create tenant-specific copies
        // from actual customer ownership, never from the acting user's shop.
        migrationBuilder.Sql("""
            INSERT INTO CustomerTags (ShopId, Name, IsActive, CreatedAt)
            SELECT c.ShopId, t.Name, CAST(MAX(CAST(t.IsActive AS int)) AS bit), GETUTCDATE()
            FROM CustomerTagMaps m JOIN Customers c ON c.Id=m.CustomerId JOIN CustomerTags t ON t.Id=m.TagId
            WHERE t.ShopId IS NULL GROUP BY c.ShopId, t.Name;
            INSERT INTO CustomerTagMaps (CustomerId, TagId, CreatedAt, CreatedBy)
            SELECT m.CustomerId, n.Id, MIN(m.CreatedAt), MIN(m.CreatedBy)
            FROM CustomerTagMaps m JOIN Customers c ON c.Id=m.CustomerId
            JOIN CustomerTags t ON t.Id=m.TagId AND t.ShopId IS NULL
            JOIN CustomerTags n ON n.Name=t.Name AND n.ShopId=c.ShopId
            GROUP BY m.CustomerId, n.Id;
            """);
        migrationBuilder.CreateIndex("IX_CustomerTags_ShopId_Name", "CustomerTags", new[] { "ShopId", "Name" }, unique: true, filter: "[ShopId] IS NOT NULL");
        migrationBuilder.CreateIndex("IX_AuditLogs_ShopId_CreatedAt", "AuditLogs", new[] { "ShopId", "CreatedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        throw new InvalidOperationException("This migration preserves legacy data. Rollback requires a reviewed data reconciliation migration.");
}

