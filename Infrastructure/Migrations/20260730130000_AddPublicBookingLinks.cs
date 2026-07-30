using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicBookingLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicSlug",
                table: "Shops",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Shops]
                SET [PublicSlug] = CONCAT(
                    'ezqueue-',
                    LOWER(LEFT(REPLACE(CONVERT(varchar(36), [Guid]), '-', ''), 12)))
                WHERE [PublicSlug] IS NULL OR LTRIM(RTRIM([PublicSlug])) = '';
                """);

            migrationBuilder.AlterColumn<string>(
                name: "PublicSlug",
                table: "Shops",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(180)",
                oldMaxLength: 180,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnlineBookingEnabled",
                table: "ShopBranches",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PublicBookingId",
                table: "ShopBranches",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "(newid())");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Bookings",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "GuestEmail",
                table: "Bookings",
                type: "nvarchar(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                table: "Bookings",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestPhone",
                table: "Bookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "UX_Shops_PublicSlug",
                table: "Shops",
                column: "PublicSlug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_ShopBranches_PublicBookingId",
                table: "ShopBranches",
                column: "PublicBookingId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Shops_PublicSlug",
                table: "Shops");

            migrationBuilder.DropIndex(
                name: "UX_ShopBranches_PublicBookingId",
                table: "ShopBranches");

            migrationBuilder.DropColumn(
                name: "PublicSlug",
                table: "Shops");

            migrationBuilder.DropColumn(
                name: "IsOnlineBookingEnabled",
                table: "ShopBranches");

            migrationBuilder.DropColumn(
                name: "PublicBookingId",
                table: "ShopBranches");

            migrationBuilder.DropColumn(
                name: "GuestEmail",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestPhone",
                table: "Bookings");

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM [Bookings] WHERE [UserId] IS NULL)
                    THROW 50001, 'Cannot roll back public booking migration while guest bookings exist.', 1;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
