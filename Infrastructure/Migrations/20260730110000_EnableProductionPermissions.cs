using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableProductionPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM ShopRolePermissions
                WHERE PermissionCode IN (
                    'shop.delete',
                    'branch.delete',
                    'report.view',
                    'subscription.view',
                    'subscription.manage'
                );

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'ShopOwner'
                      AND PermissionCode = 'customer.view'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'ShopOwner', 'customer.view', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'ShopOwner'
                      AND PermissionCode = 'customer.manage'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'ShopOwner', 'customer.manage', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'ShopManager'
                      AND PermissionCode = 'customer.view'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'ShopManager', 'customer.view', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'ShopManager'
                      AND PermissionCode = 'customer.manage'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'ShopManager', 'customer.manage', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'BranchManager'
                      AND PermissionCode = 'customer.view'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'BranchManager', 'customer.view', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'BranchManager'
                      AND PermissionCode = 'customer.manage'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'BranchManager', 'customer.manage', 1, GETDATE());

                IF NOT EXISTS (
                    SELECT 1 FROM ShopRolePermissions
                    WHERE ShopId IS NULL
                      AND RoleCode = 'Staff'
                      AND PermissionCode = 'customer.view'
                )
                    INSERT INTO ShopRolePermissions
                        (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt)
                    VALUES (NULL, 'Staff', 'customer.view', 1, GETDATE());
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM ShopRolePermissions
                WHERE ShopId IS NULL
                  AND PermissionCode IN ('customer.view', 'customer.manage');
                """);
        }
    }
}
