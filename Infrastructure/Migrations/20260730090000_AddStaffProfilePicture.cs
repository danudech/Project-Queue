using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Queue.Infrastructure.Persistence;

#nullable disable

namespace Queue.Infrastructure.Migrations;

[DbContext(typeof(QueueDbContext))]
[Migration("20260730090000_AddStaffProfilePicture")]
public partial class AddStaffProfilePicture : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ProfilePictureUrl",
            table: "ShopStaffs",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ProfilePictureUrl",
            table: "ShopStaffs");
    }
}
