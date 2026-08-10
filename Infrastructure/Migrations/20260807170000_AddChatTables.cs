using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations;

public partial class AddChatTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "ChatConversations",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                BranchId = table.Column<int>(type: "int", nullable: false),
                BookingId = table.Column<int>(type: "int", nullable: true),
                CustomerUserId = table.Column<int>(type: "int", nullable: true),
                CustomerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                CustomerEmail = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                CustomerEmailVerified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                CustomerAvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                CustomerTokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "PENDING"),
                AssignedStaffUserId = table.Column<int>(type: "int", nullable: true),
                AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                IsClosed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ChatConversations", x => x.Id);
                table.ForeignKey("FK_ChatConversations_Bookings_BookingId", x => x.BookingId, "Bookings", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_ChatConversations_ShopBranches_BranchId", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                table.ForeignKey("FK_ChatConversations_Users_CustomerUserId", x => x.CustomerUserId, "Users", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_ChatConversations_Users_AssignedStaffUserId", x => x.AssignedStaffUserId, "Users", "Id", onDelete: ReferentialAction.NoAction);
            });

        migrationBuilder.CreateTable(
            name: "ChatMessages",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                ConversationId = table.Column<int>(type: "int", nullable: false),
                SenderUserId = table.Column<int>(type: "int", nullable: true),
                SenderType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                SentAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ChatMessages", x => x.Id);
                table.ForeignKey("FK_ChatMessages_ChatConversations_ConversationId", x => x.ConversationId, "ChatConversations", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_ChatMessages_Users_SenderUserId", x => x.SenderUserId, "Users", "Id", onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex("IX_ChatConversations_Guid", "ChatConversations", "Guid", unique: true);
        migrationBuilder.CreateIndex("IX_ChatConversations_BranchId_LastMessageAt", "ChatConversations", new[] { "BranchId", "LastMessageAt" });
        migrationBuilder.CreateIndex("IX_ChatConversations_BookingId", "ChatConversations", "BookingId");
        migrationBuilder.CreateIndex("IX_ChatConversations_CustomerUserId", "ChatConversations", "CustomerUserId");
        migrationBuilder.CreateIndex("IX_ChatMessages_Guid", "ChatMessages", "Guid", unique: true);
        migrationBuilder.CreateIndex("IX_ChatMessages_ConversationId_SentAt", "ChatMessages", new[] { "ConversationId", "SentAt" });
        migrationBuilder.CreateIndex("IX_ChatMessages_SenderUserId", "ChatMessages", "SenderUserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "ChatMessages");
        migrationBuilder.DropTable(name: "ChatConversations");
    }
}
