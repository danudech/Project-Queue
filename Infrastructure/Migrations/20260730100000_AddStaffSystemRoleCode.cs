using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffSystemRoleCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SystemRoleCode",
                table: "ShopStaffs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE ShopStaffs
                SET SystemRoleCode = 'Staff'
                WHERE CanLogin = 1 AND SystemRoleCode IS NULL;

                INSERT INTO BranchUserRoleMaps
                    (BranchId, UserId, RoleCode, IsActive, GrantedBy, CreatedAt, CreatedBy)
                SELECT
                    staff.BranchId,
                    staff.UserId,
                    'Staff',
                    1,
                    staff.CreatedBy,
                    GETDATE(),
                    staff.CreatedBy
                FROM ShopStaffs staff
                WHERE staff.CanLogin = 1
                  AND staff.IsActive = 1
                  AND staff.UserId IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM BranchUserRoleMaps roleMap
                      WHERE roleMap.BranchId = staff.BranchId
                        AND roleMap.UserId = staff.UserId
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SystemRoleCode",
                table: "ShopStaffs");
        }
    }
}
