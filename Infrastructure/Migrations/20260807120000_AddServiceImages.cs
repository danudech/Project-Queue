using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations;

public partial class AddServiceImages : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ImageUrl",
            table: "Services",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.Sql(@"
            INSERT INTO ServiceCategories (ShopId, BranchId, Name, IsActive, CreatedAt)
            SELECT b.ShopId, b.Id, v.Name, 1, GETDATE()
            FROM ShopBranches b
            CROSS JOIN (VALUES
                (N'ผมและการจัดแต่งทรงผม'),
                (N'สีผมและเคมี'),
                (N'ดูแลผิวหน้า'),
                (N'เล็บมือและเล็บเท้า'),
                (N'สปาและผ่อนคลาย')
            ) v(Name)
            WHERE NOT EXISTS (
                SELECT 1 FROM ServiceCategories c
                WHERE c.ShopId = b.ShopId AND c.BranchId = b.Id AND c.Name = v.Name
            );");

        migrationBuilder.Sql(@"
            INSERT INTO ServiceCategoryMaps (ServiceId, CategoryId, CreatedAt)
            SELECT s.Id, c.Id, GETDATE()
            FROM Services s
            INNER JOIN ServiceCategories c ON c.ShopId = s.ShopId AND c.BranchId = s.BranchId
            WHERE NOT EXISTS (SELECT 1 FROM ServiceCategoryMaps m WHERE m.ServiceId = s.Id)
              AND ((s.Name LIKE N'%ผม%' OR s.Name LIKE '%Hair%' OR s.Name LIKE '%Beard%') AND c.Name = N'ผมและการจัดแต่งทรงผม'
                OR (s.Name LIKE '%Color%' OR s.Name LIKE N'%สี%') AND c.Name = N'สีผมและเคมี'
                OR (s.Name LIKE '%Facial%' OR s.Name LIKE '%Skin%') AND c.Name = N'ดูแลผิวหน้า'
                OR (s.Name LIKE '%Nail%' OR s.Name LIKE '%Manicure%' OR s.Name LIKE '%Pedicure%') AND c.Name = N'เล็บมือและเล็บเท้า'
                OR (s.Name LIKE '%Spa%' OR s.Name LIKE '%Scalp%') AND c.Name = N'สปาและผ่อนคลาย');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "ImageUrl", table: "Services");
    }
}
