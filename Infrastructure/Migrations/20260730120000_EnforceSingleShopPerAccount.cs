using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnforceSingleShopPerAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Shops_OwnerId",
                table: "Shops");

            migrationBuilder.AddColumn<int>(
                name: "HomeShopId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                IF EXISTS (
                    SELECT OwnerId
                    FROM Shops
                    GROUP BY OwnerId
                    HAVING COUNT(*) > 1
                )
                    THROW 51000, 'Cannot enforce one-account-one-shop: an account owns more than one shop.', 1;

                ;WITH AccountShops AS (
                    SELECT OwnerId AS UserId, Id AS ShopId FROM Shops
                    UNION
                    SELECT UserId, ShopId FROM ShopUserRoleMaps WHERE IsActive = 1
                    UNION
                    SELECT burm.UserId, branch.ShopId
                    FROM BranchUserRoleMaps burm
                    INNER JOIN ShopBranches branch ON branch.Id = burm.BranchId
                    WHERE burm.IsActive = 1
                    UNION
                    SELECT UserId, ShopId
                    FROM ShopStaffs
                    WHERE UserId IS NOT NULL AND CanLogin = 1 AND IsActive = 1
                )
                SELECT UserId
                INTO #ConflictingAccountShops
                FROM AccountShops
                GROUP BY UserId
                HAVING COUNT(DISTINCT ShopId) > 1;

                IF EXISTS (SELECT 1 FROM #ConflictingAccountShops)
                BEGIN
                    DROP TABLE #ConflictingAccountShops;
                    THROW 51001, 'Cannot enforce one-account-one-shop: an account is linked to more than one shop.', 1;
                END;
                DROP TABLE #ConflictingAccountShops;

                ;WITH AccountShops AS (
                    SELECT OwnerId AS UserId, Id AS ShopId FROM Shops
                    UNION
                    SELECT UserId, ShopId FROM ShopUserRoleMaps WHERE IsActive = 1
                    UNION
                    SELECT burm.UserId, branch.ShopId
                    FROM BranchUserRoleMaps burm
                    INNER JOIN ShopBranches branch ON branch.Id = burm.BranchId
                    WHERE burm.IsActive = 1
                    UNION
                    SELECT UserId, ShopId
                    FROM ShopStaffs
                    WHERE UserId IS NOT NULL AND CanLogin = 1 AND IsActive = 1
                )
                UPDATE users
                SET HomeShopId = accountShop.ShopId
                FROM Users users
                INNER JOIN (
                    SELECT UserId, MIN(ShopId) AS ShopId
                    FROM AccountShops
                    GROUP BY UserId
                ) accountShop ON accountShop.UserId = users.Id;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_HomeShopId",
                table: "Users",
                column: "HomeShopId");

            migrationBuilder.CreateIndex(
                name: "UX_Shops_OwnerId",
                table: "Shops",
                column: "OwnerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_HomeShop",
                table: "Users",
                column: "HomeShopId",
                principalTable: "Shops",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_HomeShop",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_HomeShopId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "UX_Shops_OwnerId",
                table: "Shops");

            migrationBuilder.DropColumn(
                name: "HomeShopId",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Shops_OwnerId",
                table: "Shops",
                column: "OwnerId");
        }
    }
}
