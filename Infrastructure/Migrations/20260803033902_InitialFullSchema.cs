using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(QueueDbContext))]
    [Migration("20260803033902_InitialFullSchema")]
    public partial class InitialFullSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecordId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameTh = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Provinces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameTh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provinces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShopRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemConfigs",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemConfigs", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "Districts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProvinceId = table.Column<int>(type: "int", nullable: false),
                    NameTh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Districts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Districts_Provinces",
                        column: x => x.ProvinceId,
                        principalTable: "Provinces",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Subdistricts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DistrictId = table.Column<int>(type: "int", nullable: false),
                    NameTh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Zipcode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subdistricts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subdistricts_Districts",
                        column: x => x.DistrictId,
                        principalTable: "Districts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HouseNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Street = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProvinceId = table.Column<int>(type: "int", nullable: false),
                    DistrictId = table.Column<int>(type: "int", nullable: false),
                    SubdistrictId = table.Column<int>(type: "int", nullable: false),
                    Zipcode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addr_Dist",
                        column: x => x.DistrictId,
                        principalTable: "Districts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Addr_Prov",
                        column: x => x.ProvinceId,
                        principalTable: "Provinces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Addr_Sub",
                        column: x => x.SubdistrictId,
                        principalTable: "Subdistricts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    GuestName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    GuestPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    GuestEmail = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    QueueSlotId = table.Column<int>(type: "int", nullable: false),
                    AssignedStaffId = table.Column<int>(type: "int", nullable: true),
                    QueueCategoryId = table.Column<int>(type: "int", nullable: true),
                    QueueNumber = table.Column<int>(type: "int", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Booking",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentId = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionRef = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Payment",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BookingServices",
                columns: table => new
                {
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingServices", x => new { x.BookingId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_BS_Booking",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BranchUserRoleMaps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    GrantedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchUserRoleMaps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTagMaps",
                columns: table => new
                {
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTagMaps", x => new { x.CustomerId, x.TagId });
                    table.ForeignKey(
                        name: "FK_CTM_Customer",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CTM_Tag",
                        column: x => x.TagId,
                        principalTable: "CustomerTags",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmailConfirmations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailConfirmations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "NotificationLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotificationId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationLogs_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QueueCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    Prefix = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QueueLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QueueId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QueueLogs_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Queues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    BookingId = table.Column<int>(type: "int", nullable: true),
                    QueueNumber = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    AssignedStaffId = table.Column<int>(type: "int", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Queues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Queues_Booking",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Queues_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QueueSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    MaxQueue = table.Column<int>(type: "int", nullable: false),
                    CurrentUsage = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueSlots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceCategoryMaps",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategoryMaps", x => new { x.ServiceId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_SCM_Category",
                        column: x => x.CategoryId,
                        principalTable: "ServiceCategories",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    StaffSelectionMode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "OPTIONAL"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SlotInterval = table.Column<int>(type: "int", nullable: true),
                    AdvanceBookingWindow = table.Column<int>(type: "int", nullable: true),
                    BufferBetweenServices = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceStaffMaps",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceStaffMaps", x => new { x.ServiceId, x.StaffId });
                    table.ForeignKey(
                        name: "FK_SSM_Service",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopBranches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    PublicBookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    IsOnlineBookingEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    AddressId = table.Column<int>(type: "int", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopBranches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SB_Address",
                        column: x => x.AddressId,
                        principalTable: "Addresses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopBusinessHours",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    OpenTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    CloseTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopBusinessHours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShopBusinessHours_Branch",
                        column: x => x.BranchId,
                        principalTable: "ShopBranches",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopHolidays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    HolidayDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopHolidays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Holidays_Branch",
                        column: x => x.BranchId,
                        principalTable: "ShopBranches",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopRolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: true),
                    RoleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PermissionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsGranted = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopRolePermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PublicSlug = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    TypeId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shops_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Shops_Type",
                        column: x => x.TypeId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShopSettings_Branch",
                        column: x => x.BranchId,
                        principalTable: "ShopBranches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ShopSettings_Shop",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    PlanName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Shop",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    HomeShopId = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_HomeShop",
                        column: x => x.HomeShopId,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Status",
                        column: x => x.StatusId,
                        principalTable: "MasterStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopStaffs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SystemRoleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CanServeQueues = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CanLogin = table.Column<bool>(type: "bit", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopStaffs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SS_Branch",
                        column: x => x.BranchId,
                        principalTable: "ShopBranches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SS_Shop",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SS_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ShopUserRoleMaps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShopId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    GrantedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopUserRoleMaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SURM_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SURM_Shop",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SURM_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserAuthentications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProviderId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAuthentications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAuth_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserImages_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoleMaps",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoleMaps", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_URM_Role",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_URM_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Session = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshSalt = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RefreshTokenExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSessions_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_DistrictId",
                table: "Addresses",
                column: "DistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_ProvinceId",
                table: "Addresses",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_SubdistrictId",
                table: "Addresses",
                column: "SubdistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_AssignedStaffId",
                table: "Bookings",
                column: "AssignedStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BranchId",
                table: "Bookings",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Guid",
                table: "Bookings",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_QueueCategoryId",
                table: "Bookings",
                column: "QueueCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_QueueNumber",
                table: "Bookings",
                column: "QueueNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_QueueSlotId",
                table: "Bookings",
                column: "QueueSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StatusId",
                table: "Bookings",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingServices_ServiceId",
                table: "BookingServices",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchUserRoleMaps_BranchId",
                table: "BranchUserRoleMaps",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchUserRoleMaps_BranchId_UserId_RoleCode",
                table: "BranchUserRoleMaps",
                columns: new[] { "BranchId", "UserId", "RoleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BranchUserRoleMaps_GrantedBy",
                table: "BranchUserRoleMaps",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_BranchUserRoleMaps_UserId",
                table: "BranchUserRoleMaps",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNotes_CustomerId",
                table: "CustomerNotes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Guid",
                table: "Customers",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_ShopId",
                table: "Customers",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserId_ShopId",
                table: "Customers",
                columns: new[] { "UserId", "ShopId" },
                unique: true,
                filter: "([UserId] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTagMaps_TagId",
                table: "CustomerTagMaps",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_ProvinceId",
                table: "Districts",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_Token",
                table: "EmailConfirmations",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_TokenHash",
                table: "EmailConfirmations",
                column: "TokenHash");

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_UserId",
                table: "EmailConfirmations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ShopId",
                table: "Invoices",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_StatusId",
                table: "Invoices",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_MasterStatuses_Type_Code",
                table: "MasterStatuses",
                columns: new[] { "Type", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_NotificationId",
                table: "NotificationLogs",
                column: "NotificationId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_StatusId",
                table: "NotificationLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_StatusId",
                table: "Notifications",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingId",
                table: "Payments",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StatusId",
                table: "Payments",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_PaymentId",
                table: "PaymentTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueCategories_BranchId_Prefix",
                table: "QueueCategories",
                columns: new[] { "BranchId", "Prefix" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QueueCategories_ShopId",
                table: "QueueCategories",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueLogs_QueueId",
                table: "QueueLogs",
                column: "QueueId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueLogs_StatusId",
                table: "QueueLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_AssignedStaffId",
                table: "Queues",
                column: "AssignedStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_BookingId",
                table: "Queues",
                column: "BookingId",
                unique: true,
                filter: "[BookingId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_BranchId",
                table: "Queues",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_Guid",
                table: "Queues",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Queues_ServiceId",
                table: "Queues",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_StatusId",
                table: "Queues",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueSlots_Branch_Date_StartTime",
                table: "QueueSlots",
                columns: new[] { "BranchId", "Date", "StartTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QueueSlots_Guid",
                table: "QueueSlots",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QueueSlots_ShopId",
                table: "QueueSlots",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCategories_BranchId",
                table: "ServiceCategories",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCategories_ShopId",
                table: "ServiceCategories",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCategoryMaps_CategoryId",
                table: "ServiceCategoryMaps",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_BranchId",
                table: "Services",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Guid",
                table: "Services",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Services_ShopId",
                table: "Services",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceStaffMaps_StaffId",
                table: "ServiceStaffMaps",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopBranches_AddressId",
                table: "ShopBranches",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopBranches_Guid",
                table: "ShopBranches",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopBranches_ShopId",
                table: "ShopBranches",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "UX_ShopBranches_PublicBookingId",
                table: "ShopBranches",
                column: "PublicBookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopBusinessHours_BranchId_DayOfWeek",
                table: "ShopBusinessHours",
                columns: new[] { "BranchId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopHolidays_BranchId_HolidayDate",
                table: "ShopHolidays",
                columns: new[] { "BranchId", "HolidayDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopHolidays_ShopId",
                table: "ShopHolidays",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopRolePermissions_RoleCode",
                table: "ShopRolePermissions",
                column: "RoleCode");

            migrationBuilder.CreateIndex(
                name: "IX_ShopRolePermissions_ShopId_RoleCode_PermissionCode",
                table: "ShopRolePermissions",
                columns: new[] { "ShopId", "RoleCode", "PermissionCode" },
                unique: true,
                filter: "[ShopId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ShopRoles_Code",
                table: "ShopRoles",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shops_Guid",
                table: "Shops",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shops_StatusId",
                table: "Shops",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Shops_TypeId",
                table: "Shops",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "UX_Shops_OwnerId",
                table: "Shops",
                column: "OwnerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_Shops_PublicSlug",
                table: "Shops",
                column: "PublicSlug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_BranchId",
                table: "ShopSettings",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_ShopId_BranchId_Key",
                table: "ShopSettings",
                columns: new[] { "ShopId", "BranchId", "Key" });

            migrationBuilder.CreateIndex(
                name: "IX_ShopStaffs_BranchId_UserId",
                table: "ShopStaffs",
                columns: new[] { "BranchId", "UserId" },
                unique: true,
                filter: "([UserId] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_ShopStaffs_ShopId",
                table: "ShopStaffs",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopStaffs_UserId",
                table: "ShopStaffs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopUserRoleMaps_GrantedBy",
                table: "ShopUserRoleMaps",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ShopUserRoleMaps_ShopId",
                table: "ShopUserRoleMaps",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopUserRoleMaps_ShopId_UserId_RoleCode",
                table: "ShopUserRoleMaps",
                columns: new[] { "ShopId", "UserId", "RoleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopUserRoleMaps_UserId",
                table: "ShopUserRoleMaps",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Subdistricts_DistrictId",
                table: "Subdistricts",
                column: "DistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_ShopId",
                table: "Subscriptions",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAuthentications_UserId",
                table: "UserAuthentications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserImages_UserId_IsPrimary",
                table: "UserImages",
                columns: new[] { "UserId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoleMaps_RoleId",
                table: "UserRoleMaps",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Guid",
                table: "Users",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_HomeShopId",
                table: "Users",
                column: "HomeShopId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StatusId",
                table: "Users",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_Guid",
                table: "UserSessions",
                column: "Guid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AssignedStaff",
                table: "Bookings",
                column: "AssignedStaffId",
                principalTable: "ShopStaffs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Branch",
                table: "Bookings",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Category",
                table: "Bookings",
                column: "QueueCategoryId",
                principalTable: "QueueCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Slot",
                table: "Bookings",
                column: "QueueSlotId",
                principalTable: "QueueSlots",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_User",
                table: "Bookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BS_Service",
                table: "BookingServices",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BURM_Branch",
                table: "BranchUserRoleMaps",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BURM_GrantedBy",
                table: "BranchUserRoleMaps",
                column: "GrantedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BURM_User",
                table: "BranchUserRoleMaps",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerNotes_Customer",
                table: "CustomerNotes",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Shop",
                table: "Customers",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_User",
                table: "Customers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EmailConfirmations_User",
                table: "EmailConfirmations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Shop",
                table: "Invoices",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationLogs_Notification",
                table: "NotificationLogs",
                column: "NotificationId",
                principalTable: "Notifications",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_User",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QC_Branch",
                table: "QueueCategories",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QC_Shop",
                table: "QueueCategories",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QueueLogs_Queue",
                table: "QueueLogs",
                column: "QueueId",
                principalTable: "Queues",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Queues_AssignedStaff",
                table: "Queues",
                column: "AssignedStaffId",
                principalTable: "ShopStaffs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Queues_Branch",
                table: "Queues",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Queues_Service",
                table: "Queues",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_QS_Branch",
                table: "QueueSlots",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QS_Shop",
                table: "QueueSlots",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SC_Branch",
                table: "ServiceCategories",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SC_Shop",
                table: "ServiceCategories",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SCM_Service",
                table: "ServiceCategoryMaps",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Branch",
                table: "Services",
                column: "BranchId",
                principalTable: "ShopBranches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Shop",
                table: "Services",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SSM_Staff",
                table: "ServiceStaffMaps",
                column: "StaffId",
                principalTable: "ShopStaffs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SB_Shop",
                table: "ShopBranches",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Holidays_Shop",
                table: "ShopHolidays",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SRP_Shop",
                table: "ShopRolePermissions",
                column: "ShopId",
                principalTable: "Shops",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Shops_Owner",
                table: "Shops",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id");

            SeedInitialData(migrationBuilder);
        }

        private static void SeedInitialData(MigrationBuilder migrationBuilder)
        {
            SeedThaiAddresses(migrationBuilder);
            migrationBuilder.Sql(
                """
                INSERT INTO MasterStatuses (Type, Code, NameTh, NameEn, IsActive, CreatedAt) VALUES
                ('USER_STATUS', 'ACTIVE', N'ใช้งาน', 'Active', 1, GETDATE()),
                ('USER_STATUS', 'INACTIVE', N'ไม่ใช้งาน', 'Inactive', 1, GETDATE()),
                ('SHOP_STATUS', 'ACTIVE', N'เปิดใช้งาน', 'Active', 1, GETDATE()),
                ('SHOP_STATUS', 'INACTIVE', N'ปิดใช้งาน', 'Inactive', 1, GETDATE()),
                ('BOOKING_STATUS', 'WAITING', N'รอการยืนยัน', 'Waiting', 1, GETDATE()),
                ('BOOKING_STATUS', 'CONFIRMED', N'ยืนยันแล้ว', 'Confirmed', 1, GETDATE()),
                ('BOOKING_STATUS', 'CHECKED_IN', N'เช็คอินแล้ว', 'Checked In', 1, GETDATE()),
                ('BOOKING_STATUS', 'DONE', N'เสร็จสิ้น', 'Done', 1, GETDATE()),
                ('BOOKING_STATUS', 'CANCELLED', N'ยกเลิก', 'Cancelled', 1, GETDATE()),
                ('BOOKING_STATUS', 'NO_SHOW', N'ไม่มาตามนัด', 'No Show', 1, GETDATE()),
                ('QUEUE_STATUS', 'WAITING', N'รอ', 'Waiting', 1, GETDATE()),
                ('QUEUE_STATUS', 'SERVING', N'กำลังให้บริการ', 'Serving', 1, GETDATE()),
                ('QUEUE_STATUS', 'DONE', N'เสร็จแล้ว', 'Done', 1, GETDATE()),
                ('QUEUE_STATUS', 'CANCELLED', N'ยกเลิก', 'Cancelled', 1, GETDATE()),
                ('QUEUE_STATUS', 'SKIPPED', N'ข้ามคิว', 'Skipped', 1, GETDATE()),
                ('PAYMENT_STATUS', 'PENDING', N'รอดำเนินการ', 'Pending', 1, GETDATE()),
                ('PAYMENT_STATUS', 'PAID', N'ชำระแล้ว', 'Paid', 1, GETDATE()),
                ('PAYMENT_STATUS', 'FAILED', N'ล้มเหลว', 'Failed', 1, GETDATE()),
                ('PAYMENT_STATUS', 'REFUNDED', N'คืนเงินแล้ว', 'Refunded', 1, GETDATE()),
                ('NOTIFICATION_STATUS', 'UNREAD', N'ยังไม่อ่าน', 'Unread', 1, GETDATE()),
                ('NOTIFICATION_STATUS', 'READ', N'อ่านแล้ว', 'Read', 1, GETDATE()),
                ('INVOICE_STATUS', 'PENDING', N'รอชำระ', 'Pending', 1, GETDATE()),
                ('INVOICE_STATUS', 'PAID', N'ชำระแล้ว', 'Paid', 1, GETDATE()),
                ('INVOICE_STATUS', 'CANCELLED', N'ยกเลิก', 'Cancelled', 1, GETDATE()),
                ('INVOICE_STATUS', 'OVERDUE', N'เกินกำหนดชำระ', 'Overdue', 1, GETDATE()),
                ('SHOP_TYPE', 'CLINIC', N'🏥 คลินิก / สถานพยาบาล', N'🏥 Clinic', 1, GETDATE()),
                ('SHOP_TYPE', 'HOSPITAL', N'🏨 โรงพยาบาล', N'🏨 Hospital', 1, GETDATE()),
                ('SHOP_TYPE', 'DENTAL', N'🦷 คลินิกทันตกรรม', N'🦷 Dental Clinic', 1, GETDATE()),
                ('SHOP_TYPE', 'PHARMACY', N'💊 ร้านขายยา', N'💊 Pharmacy', 1, GETDATE()),
                ('SHOP_TYPE', 'SPA', N'💆 สปา / นวดแผนไทย', N'💆 Spa & Massage', 1, GETDATE()),
                ('SHOP_TYPE', 'SALON', N'✂️ ร้านเสริมสวย / ตัดผม', N'✂️ Beauty Salon', 1, GETDATE()),
                ('SHOP_TYPE', 'NAIL', N'💅 ร้านทำเล็บ', N'💅 Nail Studio', 1, GETDATE()),
                ('SHOP_TYPE', 'FITNESS', N'💪 ฟิตเนส / โยคะ', N'💪 Fitness & Yoga', 1, GETDATE()),
                ('SHOP_TYPE', 'HOSPITAL_GOV', N'🏥 โรงพยาบาลรัฐ', N'🏥 Public Hospital', 1, GETDATE()),
                ('SHOP_TYPE', 'RESTAURANT', N'🍴 ร้านอาหาร', N'🍴 Restaurant', 1, GETDATE()),
                ('SHOP_TYPE', 'CAFE', N'☕ คาเฟ่ / เครื่องดื่ม', N'☕ Café', 1, GETDATE()),
                ('SHOP_TYPE', 'BAKERY', N'🥐 เบเกอรี่', N'🥐 Bakery', 1, GETDATE()),
                ('SHOP_TYPE', 'CAR_SERVICE', N'🚗 ศูนย์บริการรถยนต์', N'🚗 Car Service', 1, GETDATE()),
                ('SHOP_TYPE', 'MOTORCYCLE', N'🏍️ ร้านซ่อมมอเตอร์ไซค์', N'🏍️ Motorcycle Repair', 1, GETDATE()),
                ('SHOP_TYPE', 'CAR_WASH', N'🧼 ร้านล้างรถ', N'🧼 Car Wash', 1, GETDATE()),
                ('SHOP_TYPE', 'BANK', N'💰 ธนาคาร / การเงิน', N'💰 Bank', 1, GETDATE()),
                ('SHOP_TYPE', 'GOVERNMENT', N'🏛️ หน่วยงานราชการ', N'🏛️ Government', 1, GETDATE()),
                ('SHOP_TYPE', 'INSURANCE', N'🛡️ ประกันภัย', N'🛡️ Insurance', 1, GETDATE()),
                ('SHOP_TYPE', 'TUTOR', N'📚 ติวเตอร์ / สอนพิเศษ', N'📚 Tutoring', 1, GETDATE()),
                ('SHOP_TYPE', 'STUDIO', N'📸 สตูดิโอ / ถ่ายภาพ', N'📸 Studio', 1, GETDATE()),
                ('SHOP_TYPE', 'LAWYER', N'⚖️ ทนายความ / กฎหมาย', N'⚖️ Legal Service', 1, GETDATE()),
                ('SHOP_TYPE', 'FREELANCE', N'💻 ฟรีแลนซ์ / บริการส่วนตัว', N'💻 Freelance', 1, GETDATE()),
                ('SHOP_TYPE', 'CONSULTANT', N'🤝 ที่ปรึกษา', N'🤝 Consultant', 1, GETDATE()),
                ('SHOP_TYPE', 'PET', N'🐾 ร้านสัตว์เลี้ยง / สัตวแพทย์', N'🐾 Pet & Vet', 1, GETDATE()),
                ('SHOP_TYPE', 'ONLINE', N'🌐 บริการออนไลน์', N'🌐 Online Service', 1, GETDATE()),
                ('SHOP_TYPE', 'OTHER', N'✨ อื่น ๆ', N'✨ Other', 1, GETDATE());

                SET IDENTITY_INSERT Roles ON;
                INSERT INTO Roles (Id, Name, IsActive, CreatedAt, CreatedBy) VALUES
                (1, 'Admin', 1, GETDATE(), NULL),
                (2, 'Customer', 1, GETDATE(), NULL),
                (3, 'Staff', 1, GETDATE(), NULL);
                SET IDENTITY_INSERT Roles OFF;

                SET IDENTITY_INSERT ShopRoles ON;
                INSERT INTO ShopRoles (Id, Code, Label, Scope, IsSystem, IsActive, CreatedAt) VALUES
                (1, 'ShopOwner', N'เจ้าของร้าน', 'Shop', 1, 1, GETDATE()),
                (2, 'ShopManager', N'ผู้จัดการร้าน', 'Shop', 1, 1, GETDATE()),
                (3, 'BranchManager', N'ผู้จัดการสาขา', 'Branch', 1, 1, GETDATE()),
                (4, 'Staff', N'พนักงาน', 'Branch', 1, 1, GETDATE());
                SET IDENTITY_INSERT ShopRoles OFF;

                INSERT INTO ShopRolePermissions
                    (ShopId, RoleCode, PermissionCode, IsGranted, CreatedAt) VALUES
                (NULL, 'ShopOwner', 'shop.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'shop.edit', 1, GETDATE()),
                (NULL, 'ShopOwner', 'branch.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'branch.create', 1, GETDATE()),
                (NULL, 'ShopOwner', 'branch.edit', 1, GETDATE()),
                (NULL, 'ShopOwner', 'staff.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'staff.invite', 1, GETDATE()),
                (NULL, 'ShopOwner', 'staff.edit', 1, GETDATE()),
                (NULL, 'ShopOwner', 'staff.remove', 1, GETDATE()),
                (NULL, 'ShopOwner', 'role.assign', 1, GETDATE()),
                (NULL, 'ShopOwner', 'service.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'service.create', 1, GETDATE()),
                (NULL, 'ShopOwner', 'service.edit', 1, GETDATE()),
                (NULL, 'ShopOwner', 'service.delete', 1, GETDATE()),
                (NULL, 'ShopOwner', 'customer.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'customer.manage', 1, GETDATE()),
                (NULL, 'ShopOwner', 'booking.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'booking.manage', 1, GETDATE()),
                (NULL, 'ShopOwner', 'queue.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'queue.manage', 1, GETDATE()),
                (NULL, 'ShopOwner', 'setting.view', 1, GETDATE()),
                (NULL, 'ShopOwner', 'setting.edit', 1, GETDATE()),
                (NULL, 'ShopManager', 'shop.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'shop.edit', 1, GETDATE()),
                (NULL, 'ShopManager', 'branch.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'branch.create', 1, GETDATE()),
                (NULL, 'ShopManager', 'branch.edit', 1, GETDATE()),
                (NULL, 'ShopManager', 'staff.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'staff.invite', 1, GETDATE()),
                (NULL, 'ShopManager', 'staff.edit', 1, GETDATE()),
                (NULL, 'ShopManager', 'staff.remove', 1, GETDATE()),
                (NULL, 'ShopManager', 'role.assign', 1, GETDATE()),
                (NULL, 'ShopManager', 'service.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'service.create', 1, GETDATE()),
                (NULL, 'ShopManager', 'service.edit', 1, GETDATE()),
                (NULL, 'ShopManager', 'service.delete', 1, GETDATE()),
                (NULL, 'ShopManager', 'customer.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'customer.manage', 1, GETDATE()),
                (NULL, 'ShopManager', 'booking.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'booking.manage', 1, GETDATE()),
                (NULL, 'ShopManager', 'queue.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'queue.manage', 1, GETDATE()),
                (NULL, 'ShopManager', 'setting.view', 1, GETDATE()),
                (NULL, 'ShopManager', 'setting.edit', 1, GETDATE()),
                (NULL, 'BranchManager', 'branch.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'branch.edit', 1, GETDATE()),
                (NULL, 'BranchManager', 'staff.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'staff.invite', 1, GETDATE()),
                (NULL, 'BranchManager', 'staff.edit', 1, GETDATE()),
                (NULL, 'BranchManager', 'staff.remove', 1, GETDATE()),
                (NULL, 'BranchManager', 'service.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'service.edit', 1, GETDATE()),
                (NULL, 'BranchManager', 'customer.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'customer.manage', 1, GETDATE()),
                (NULL, 'BranchManager', 'booking.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'booking.manage', 1, GETDATE()),
                (NULL, 'BranchManager', 'queue.view', 1, GETDATE()),
                (NULL, 'BranchManager', 'queue.manage', 1, GETDATE()),
                (NULL, 'BranchManager', 'setting.view', 1, GETDATE()),
                (NULL, 'Staff', 'branch.view', 1, GETDATE()),
                (NULL, 'Staff', 'service.view', 1, GETDATE()),
                (NULL, 'Staff', 'customer.view', 1, GETDATE()),
                (NULL, 'Staff', 'booking.view', 1, GETDATE()),
                (NULL, 'Staff', 'queue.view', 1, GETDATE()),
                (NULL, 'Staff', 'queue.manage', 1, GETDATE());
                """);
        }

        private static void SeedThaiAddresses(MigrationBuilder migrationBuilder)
        {
            string[] roots =
            [
                Path.Combine(AppContext.BaseDirectory, "SeedData"),
                Path.Combine(Directory.GetCurrentDirectory(), "SeedData"),
                Path.Combine(Directory.GetCurrentDirectory(), "Api", "SeedData"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "Api", "SeedData")
            ];
            string root = roots.FirstOrDefault(path => File.Exists(Path.Combine(path, "provinces.json")))
                ?? throw new FileNotFoundException(
                    "Thai address seed files were not found. Deploy the Api/SeedData directory with the migration.");

            List<ProvinceSeed> provinces = ReadSeed<List<ProvinceSeed>>(root, "provinces.json");
            List<DistrictSeed> districts = ReadSeed<List<DistrictSeed>>(root, "districts.json");
            List<SubdistrictSeed> subdistricts = ReadSeed<List<SubdistrictSeed>>(root, "sub_districts.json");

            var sql = new StringBuilder("SET IDENTITY_INSERT Provinces ON;\n");
            foreach (ProvinceSeed item in provinces)
                sql.AppendLine($"INSERT INTO Provinces (Id, NameTh, NameEn) VALUES ({item.Id}, N'{Escape(item.NameTh)}', N'{Escape(item.NameEn)}');");
            sql.AppendLine("SET IDENTITY_INSERT Provinces OFF;");
            migrationBuilder.Sql(sql.ToString());

            sql.Clear();
            sql.AppendLine("SET IDENTITY_INSERT Districts ON;");
            foreach (DistrictSeed item in districts)
                sql.AppendLine($"INSERT INTO Districts (Id, ProvinceId, NameTh, NameEn) VALUES ({item.Id}, {item.ProvinceId}, N'{Escape(item.NameTh)}', N'{Escape(item.NameEn)}');");
            sql.AppendLine("SET IDENTITY_INSERT Districts OFF;");
            migrationBuilder.Sql(sql.ToString());

            sql.Clear();
            sql.AppendLine("SET IDENTITY_INSERT Subdistricts ON;");
            int count = 0;
            foreach (SubdistrictSeed item in subdistricts)
            {
                sql.AppendLine($"INSERT INTO Subdistricts (Id, DistrictId, NameTh, NameEn, Zipcode) VALUES ({item.Id}, {item.DistrictId}, N'{Escape(item.NameTh)}', N'{Escape(item.NameEn)}', '{Escape(item.ZipCode?.ToString() ?? string.Empty)}');");
                if (++count % 1000 != 0) continue;
                migrationBuilder.Sql(sql.ToString());
                sql.Clear();
            }
            sql.AppendLine("SET IDENTITY_INSERT Subdistricts OFF;");
            migrationBuilder.Sql(sql.ToString());
        }

        private static T ReadSeed<T>(string root, string fileName) =>
            JsonSerializer.Deserialize<T>(
                File.ReadAllText(Path.Combine(root, fileName), Encoding.UTF8),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? throw new InvalidOperationException($"Unable to read seed file: {fileName}");

        private static string Escape(string value) => value.Replace("'", "''");

        private sealed class ProvinceSeed
        {
            public int Id { get; set; }
            [JsonPropertyName("name_th")]
            public string NameTh { get; set; } = string.Empty;
            [JsonPropertyName("name_en")]
            public string NameEn { get; set; } = string.Empty;
        }

        private sealed class DistrictSeed
        {
            public int Id { get; set; }
            [JsonPropertyName("province_id")]
            public int ProvinceId { get; set; }
            [JsonPropertyName("name_th")]
            public string NameTh { get; set; } = string.Empty;
            [JsonPropertyName("name_en")]
            public string NameEn { get; set; } = string.Empty;
        }

        private sealed class SubdistrictSeed
        {
            public int Id { get; set; }
            [JsonPropertyName("district_id")]
            public int DistrictId { get; set; }
            [JsonPropertyName("name_th")]
            public string NameTh { get; set; } = string.Empty;
            [JsonPropertyName("name_en")]
            public string NameEn { get; set; } = string.Empty;
            [JsonPropertyName("zip_code")]
            public object ZipCode { get; set; }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shops_Status",
                table: "Shops");

            migrationBuilder.DropForeignKey(
                name: "FK_Shops_Type",
                table: "Shops");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Status",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Shops_Owner",
                table: "Shops");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "BookingServices");

            migrationBuilder.DropTable(
                name: "BranchUserRoleMaps");

            migrationBuilder.DropTable(
                name: "CustomerNotes");

            migrationBuilder.DropTable(
                name: "CustomerTagMaps");

            migrationBuilder.DropTable(
                name: "EmailConfirmations");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "NotificationLogs");

            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropTable(
                name: "QueueLogs");

            migrationBuilder.DropTable(
                name: "ServiceCategoryMaps");

            migrationBuilder.DropTable(
                name: "ServiceStaffMaps");

            migrationBuilder.DropTable(
                name: "ShopBusinessHours");

            migrationBuilder.DropTable(
                name: "ShopHolidays");

            migrationBuilder.DropTable(
                name: "ShopRolePermissions");

            migrationBuilder.DropTable(
                name: "ShopRoles");

            migrationBuilder.DropTable(
                name: "ShopSettings");

            migrationBuilder.DropTable(
                name: "ShopUserRoleMaps");

            migrationBuilder.DropTable(
                name: "Subscriptions");

            migrationBuilder.DropTable(
                name: "SystemConfigs");

            migrationBuilder.DropTable(
                name: "UserAuthentications");

            migrationBuilder.DropTable(
                name: "UserImages");

            migrationBuilder.DropTable(
                name: "UserRoleMaps");

            migrationBuilder.DropTable(
                name: "UserSessions");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "CustomerTags");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Queues");

            migrationBuilder.DropTable(
                name: "ServiceCategories");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "ShopStaffs");

            migrationBuilder.DropTable(
                name: "QueueCategories");

            migrationBuilder.DropTable(
                name: "QueueSlots");

            migrationBuilder.DropTable(
                name: "ShopBranches");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Subdistricts");

            migrationBuilder.DropTable(
                name: "Districts");

            migrationBuilder.DropTable(
                name: "Provinces");

            migrationBuilder.DropTable(
                name: "MasterStatuses");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Shops");
        }
    }
}
