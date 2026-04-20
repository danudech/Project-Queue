using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations;

public partial class _InitialBasePlus_Seed : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // =========================
        // ADDRESS
        // =========================
        migrationBuilder.CreateTable(
            name: "Provinces",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                NameTh = table.Column<string>(maxLength: 100),
                NameEn = table.Column<string>(maxLength: 100)
            },
            constraints: table => table.PrimaryKey("PK_Provinces", x => x.Id)
        );

        migrationBuilder.CreateTable(
            name: "Districts",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ProvinceId = table.Column<int>(),
                NameTh = table.Column<string>(maxLength: 100),
                NameEn = table.Column<string>(maxLength: 100)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Districts", x => x.Id);
                table.ForeignKey("FK_Districts_Provinces", x => x.ProvinceId, "Provinces", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Subdistricts",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                DistrictId = table.Column<int>(),
                NameTh = table.Column<string>(maxLength: 100),
                NameEn = table.Column<string>(maxLength: 100),
                Zipcode = table.Column<string>(maxLength: 10)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Subdistricts", x => x.Id);
                table.ForeignKey("FK_Subdistricts_Districts", x => x.DistrictId, "Districts", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Addresses",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                HouseNo = table.Column<string>(maxLength: 50),
                Street = table.Column<string>(maxLength: 100),
                ProvinceId = table.Column<int>(),
                DistrictId = table.Column<int>(),
                SubdistrictId = table.Column<int>(),
                Zipcode = table.Column<string>(maxLength: 10)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Addresses", x => x.Id);
                table.ForeignKey("FK_Addr_Prov", x => x.ProvinceId, "Provinces", "Id");
                table.ForeignKey("FK_Addr_Dist", x => x.DistrictId, "Districts", "Id");
                table.ForeignKey("FK_Addr_Sub", x => x.SubdistrictId, "Subdistricts", "Id");
            });

        // =========================
        // USERS
        // =========================
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150),
                Phone = table.Column<string>(maxLength: 20),
                Email = table.Column<string>(maxLength: 150),
                Status = table.Column<string>(maxLength: 20),
                CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table => table.PrimaryKey("PK_Users", x => x.Id)
        );

        migrationBuilder.CreateTable(
            name: "UserRoles",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                Name = table.Column<string>(maxLength: 50)
            },
            constraints: table => table.PrimaryKey("PK_UserRoles", x => x.Id)
        );

        migrationBuilder.CreateTable(
            name: "UserRoleMaps",
            columns: table => new
            {
                UserId = table.Column<Guid>(),
                RoleId = table.Column<int>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserRoleMaps", x => new { x.UserId, x.RoleId });
                table.ForeignKey("FK_URM_User", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_URM_Role", x => x.RoleId, "UserRoles", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "UserAuthentications",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                UserId = table.Column<Guid>(),
                Provider = table.Column<string>(maxLength: 50),
                ProviderId = table.Column<string>(maxLength: 150),
                PasswordHash = table.Column<string>(maxLength: 500),
                LastLoginAt = table.Column<DateTime>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserAuthentications", x => x.Id);
                table.ForeignKey("FK_UserAuth_User", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "UserSessions",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                UserId = table.Column<Guid>(),
                Token = table.Column<string>(),
                ExpiredAt = table.Column<DateTime>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserSessions", x => x.Id);
                table.ForeignKey("FK_UserSessions_User", x => x.UserId, "Users", "Id");
            });

        // =========================
        // SHOP
        // =========================
        migrationBuilder.CreateTable(
            name: "Shops",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150),
                OwnerId = table.Column<Guid>(),
                AddressId = table.Column<int>(),
                Status = table.Column<string>(maxLength: 20)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Shops", x => x.Id);
                table.ForeignKey("FK_Shops_User", x => x.OwnerId, "Users", "Id");
                table.ForeignKey("FK_Shops_Address", x => x.AddressId, "Addresses", "Id");
            });

        migrationBuilder.CreateTable(
            name: "ShopBranches",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150),
                AddressId = table.Column<int>(),
                Phone = table.Column<string>(maxLength: 20)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ShopBranches", x => x.Id);
                table.ForeignKey("FK_SB_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_SB_Address", x => x.AddressId, "Addresses", "Id");
            });

        migrationBuilder.CreateTable(
            name: "ShopStaffs",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                UserId = table.Column<Guid>(),
                Role = table.Column<string>(maxLength: 50)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ShopStaffs", x => x.Id);
                table.ForeignKey("FK_SS_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_SS_User", x => x.UserId, "Users", "Id");
            });

        migrationBuilder.CreateTable(
            name: "ShopSettings",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                Key = table.Column<string>(maxLength: 100),
                Value = table.Column<string>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ShopSettings", x => x.Id);
                table.ForeignKey("FK_ShopSettings_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ShopBusinessHours",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                DayOfWeek = table.Column<int>(),
                OpenTime = table.Column<TimeSpan>(),
                CloseTime = table.Column<TimeSpan>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ShopBusinessHours", x => x.Id);
                table.ForeignKey("FK_ShopBusinessHours_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ShopHolidays",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                HolidayDate = table.Column<DateTime>(type: "date"),
                Reason = table.Column<string>(maxLength: 200)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ShopHolidays", x => x.Id);
                table.ForeignKey("FK_Holidays_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // SERVICE
        // =========================
        migrationBuilder.CreateTable(
            name: "QueueCategories",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                Prefix = table.Column<string>(maxLength: 5),
                Name = table.Column<string>(maxLength: 100),
                Description = table.Column<string>(maxLength: 500, nullable: true),
                IsActive = table.Column<bool>(defaultValue: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_QueueCategories", x => x.Id);
                table.ForeignKey("FK_QC_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ServiceCategories",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                ShopId = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                table.ForeignKey("FK_SC_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Services",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150),
                Duration = table.Column<int>(),
                Price = table.Column<decimal>(type: "decimal(10,2)"),
                IsActive = table.Column<bool>(defaultValue: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Services", x => x.Id);
                table.ForeignKey("FK_Services_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ServiceCategoryMaps",
            columns: table => new
            {
                ServiceId = table.Column<Guid>(),
                CategoryId = table.Column<int>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ServiceCategoryMaps", x => new { x.ServiceId, x.CategoryId });
                table.ForeignKey("FK_SCM_Service", x => x.ServiceId, "Services", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_SCM_Category", x => x.CategoryId, "ServiceCategories", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ServiceStaffMaps",
            columns: table => new
            {
                ServiceId = table.Column<Guid>(),
                StaffId = table.Column<int>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ServiceStaffMaps", x => new { x.ServiceId, x.StaffId });
                table.ForeignKey("FK_SSM_Service", x => x.ServiceId, "Services", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_SSM_Staff", x => x.StaffId, "ShopStaffs", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // BOOKING / QUEUE
        // =========================
        migrationBuilder.CreateTable(
            name: "QueueSlots",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                BranchId = table.Column<Guid>(),
                Date = table.Column<DateTime>(),
                StartTime = table.Column<TimeSpan>(),
                EndTime = table.Column<TimeSpan>(),
                MaxQueue = table.Column<int>(),
                CurrentUsage = table.Column<int>(defaultValue: 0)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_QueueSlots", x => x.Id);
                table.ForeignKey("FK_QS_Shop", x => x.ShopId, "Shops", "Id");
                table.ForeignKey("FK_QS_Branch", x => x.BranchId, "ShopBranches", "Id");
            });

        migrationBuilder.CreateTable(
            name: "Bookings",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                UserId = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                BranchId = table.Column<Guid>(),
                QueueSlotId = table.Column<Guid>(),
                QueueCategoryId = table.Column<int>(nullable: true),
                QueueNumber = table.Column<string>(maxLength: 10, nullable: true),
                Remark = table.Column<string>(nullable: true),
                Status = table.Column<string>(maxLength: 20),
                CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Bookings", x => x.Id);
                table.ForeignKey("FK_Bookings_User", x => x.UserId, "Users", "Id");
                table.ForeignKey("FK_Bookings_Shop", x => x.ShopId, "Shops", "Id");
                table.ForeignKey("FK_Bookings_Branch", x => x.BranchId, "ShopBranches", "Id");
                table.ForeignKey("FK_Bookings_Slot", x => x.QueueSlotId, "QueueSlots", "Id");
                table.ForeignKey("FK_Bookings_Category", x => x.QueueCategoryId, "QueueCategories", "Id");
            });

        migrationBuilder.CreateTable(
            name: "BookingServices",
            columns: table => new
            {
                BookingId = table.Column<Guid>(),
                ServiceId = table.Column<Guid>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BookingServices", x => new { x.BookingId, x.ServiceId });
                table.ForeignKey("FK_BS_Booking", x => x.BookingId, "Bookings", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_BS_Service", x => x.ServiceId, "Services", "Id");
            });

        migrationBuilder.CreateTable(
            name: "Queues",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                BranchId = table.Column<Guid>(),
                QueueNumber = table.Column<int>(),
                Status = table.Column<string>(maxLength: 20),
                Type = table.Column<string>(maxLength: 20),
                CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Queues", x => x.Id);
                table.ForeignKey("FK_Queues_Shop", x => x.ShopId, "Shops", "Id");
                table.ForeignKey("FK_Queues_Branch", x => x.BranchId, "ShopBranches", "Id");
            });

        migrationBuilder.CreateTable(
            name: "QueueLogs",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                QueueId = table.Column<Guid>(),
                Status = table.Column<string>(maxLength: 20),
                Timestamp = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_QueueLogs", x => x.Id);
                table.ForeignKey("FK_QueueLogs_Queue", x => x.QueueId, "Queues", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // CUSTOMER
        // =========================
        migrationBuilder.CreateTable(
            name: "Customers",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                UserId = table.Column<Guid>(),
                Name = table.Column<string>(maxLength: 150),
                Phone = table.Column<string>(maxLength: 20)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Customers", x => x.Id);
                table.ForeignKey("FK_Customers_Shop", x => x.ShopId, "Shops", "Id");
                table.ForeignKey("FK_Customers_User", x => x.UserId, "Users", "Id");
            });

        migrationBuilder.CreateTable(
            name: "CustomerNotes",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                CustomerId = table.Column<Guid>(),
                Note = table.Column<string>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CustomerNotes", x => x.Id);
                table.ForeignKey("FK_CustomerNotes_Customer", x => x.CustomerId, "Customers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "CustomerTags",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                Name = table.Column<string>(maxLength: 100)
            },
            constraints: table => table.PrimaryKey("PK_CustomerTags", x => x.Id));

        migrationBuilder.CreateTable(
            name: "CustomerTagMaps",
            columns: table => new
            {
                CustomerId = table.Column<Guid>(),
                TagId = table.Column<int>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CustomerTagMaps", x => new { x.CustomerId, x.TagId });
                table.ForeignKey("FK_CTM_Customer", x => x.CustomerId, "Customers", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_CTM_Tag", x => x.TagId, "CustomerTags", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // PAYMENT
        // =========================
        migrationBuilder.CreateTable(
            name: "Payments",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                BookingId = table.Column<Guid>(),
                Amount = table.Column<decimal>(type: "decimal(10,2)"),
                Method = table.Column<string>(maxLength: 50),
                Status = table.Column<string>(maxLength: 20)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Payments", x => x.Id);
                table.ForeignKey("FK_Payments_Booking", x => x.BookingId, "Bookings", "Id");
            });

        migrationBuilder.CreateTable(
            name: "PaymentTransactions",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                PaymentId = table.Column<Guid>(),
                Provider = table.Column<string>(maxLength: 50),
                TransactionRef = table.Column<string>(maxLength: 150)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                table.ForeignKey("FK_PaymentTransactions_Payment", x => x.PaymentId, "Payments", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // NOTIFICATION
        // =========================
        migrationBuilder.CreateTable(
            name: "Notifications",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                UserId = table.Column<Guid>(),
                Type = table.Column<string>(maxLength: 50),
                Title = table.Column<string>(maxLength: 150),
                Message = table.Column<string>(),
                Status = table.Column<string>(maxLength: 20)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Notifications", x => x.Id);
                table.ForeignKey("FK_Notifications_User", x => x.UserId, "Users", "Id");
            });

        migrationBuilder.CreateTable(
            name: "NotificationLogs",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                NotificationId = table.Column<Guid>(),
                Status = table.Column<string>(maxLength: 20),
                SentAt = table.Column<DateTime>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_NotificationLogs", x => x.Id);
                table.ForeignKey("FK_NotificationLogs_Notification", x => x.NotificationId, "Notifications", "Id", onDelete: ReferentialAction.Cascade);
            });

        // =========================
        // SYSTEM
        // =========================
        migrationBuilder.CreateTable(
            name: "SystemConfigs",
            columns: table => new
            {
                Key = table.Column<string>(maxLength: 100),
                Value = table.Column<string>()
            },
            constraints: table => table.PrimaryKey("PK_SystemConfigs", x => x.Key));

        migrationBuilder.CreateTable(
            name: "AuditLogs",
            columns: table => new
            {
                Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                TableName = table.Column<string>(maxLength: 100),
                RecordId = table.Column<string>(maxLength: 100),
                Action = table.Column<string>(maxLength: 50),
                OldValue = table.Column<string>(nullable: true),
                NewValue = table.Column<string>(nullable: true),
                CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table => table.PrimaryKey("PK_AuditLogs", x => x.Id));

        // =========================
        // SAAS
        // =========================
        migrationBuilder.CreateTable(
            name: "Subscriptions",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                PlanName = table.Column<string>(maxLength: 100),
                Price = table.Column<decimal>(type: "decimal(10,2)"),
                StartDate = table.Column<DateTime>(),
                EndDate = table.Column<DateTime>()
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Subscriptions", x => x.Id);
                table.ForeignKey("FK_Subscriptions_Shop", x => x.ShopId, "Shops", "Id");
            });

        migrationBuilder.CreateTable(
            name: "Invoices",
            columns: table => new
            {
                Id = table.Column<Guid>(),
                ShopId = table.Column<Guid>(),
                Amount = table.Column<decimal>(type: "decimal(10,2)"),
                Status = table.Column<string>(maxLength: 20),
                CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Invoices", x => x.Id);
                table.ForeignKey("FK_Invoices_Shop", x => x.ShopId, "Shops", "Id");
            });

        // =========================
        // INDEX
        // =========================
        migrationBuilder.CreateIndex("IX_Bookings_QueueSlotId", "Bookings", "QueueSlotId");
        migrationBuilder.CreateIndex("IX_Bookings_QueueCategoryId", "Bookings", "QueueCategoryId");
        migrationBuilder.CreateIndex("IX_Bookings_QueueNumber", "Bookings", "QueueNumber");
        migrationBuilder.CreateIndex("IX_Queues_ShopId", "Queues", "ShopId");
        migrationBuilder.CreateIndex("IX_Customers_ShopId", "Customers", "ShopId");

        // =========================
        // SEED DATA
        // =========================
        var userId = Guid.NewGuid();
        var shopId = Guid.NewGuid();
        var branchId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var slotId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();

        migrationBuilder.InsertData("Users",
            new[] { "Id", "Name", "Phone", "Email", "Status" },
            new object[] { userId, "Owner", "0999999999", "owner@test.com", "active" });

        migrationBuilder.InsertData("Shops",
            new[] { "Id", "Name", "OwnerId", "Status" },
            new object[] { shopId, "Demo Shop", userId, "active" });

        migrationBuilder.InsertData("ShopBranches",
            new[] { "Id", "ShopId", "Name" },
            new object[] { branchId, shopId, "Main Branch" });

        migrationBuilder.InsertData("Services",
            new[] { "Id", "ShopId", "Name", "Duration", "Price", "IsActive" },
            new object[] { serviceId, shopId, "Haircut", 30, 150m, true });

        migrationBuilder.InsertData("QueueSlots",
            new[] { "Id", "ShopId", "BranchId", "Date", "StartTime", "EndTime", "MaxQueue", "CurrentUsage" },
            new object[] { slotId, shopId, branchId, DateTime.Today, new TimeSpan(9, 0, 0), new TimeSpan(18, 0, 0), 20, 1 });

        migrationBuilder.InsertData("Bookings",
            new[] { "Id", "UserId", "ShopId", "BranchId", "QueueSlotId", "QueueNumber", "Status" },
            new object[] { bookingId, userId, shopId, branchId, slotId, "A001", "waiting" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("Invoices");
        migrationBuilder.DropTable("Subscriptions");
        migrationBuilder.DropTable("AuditLogs");
        migrationBuilder.DropTable("SystemConfigs");
        migrationBuilder.DropTable("NotificationLogs");
        migrationBuilder.DropTable("Notifications");
        migrationBuilder.DropTable("PaymentTransactions");
        migrationBuilder.DropTable("Payments");
        migrationBuilder.DropTable("CustomerTagMaps");
        migrationBuilder.DropTable("CustomerTags");
        migrationBuilder.DropTable("CustomerNotes");
        migrationBuilder.DropTable("Customers");
        migrationBuilder.DropTable("QueueLogs");
        migrationBuilder.DropTable("Queues");
        migrationBuilder.DropTable("BookingServices");
        migrationBuilder.DropTable("Bookings");
        migrationBuilder.DropTable("QueueSlots");
        migrationBuilder.DropTable("ServiceStaffMaps");
        migrationBuilder.DropTable("ServiceCategoryMaps");
        migrationBuilder.DropTable("Services");
        migrationBuilder.DropTable("ServiceCategories");
        migrationBuilder.DropTable("QueueCategories");
        migrationBuilder.DropTable("ShopHolidays");
        migrationBuilder.DropTable("ShopBusinessHours");
        migrationBuilder.DropTable("ShopSettings");
        migrationBuilder.DropTable("ShopStaffs");
        migrationBuilder.DropTable("ShopBranches");
        migrationBuilder.DropTable("Shops");
        migrationBuilder.DropTable("UserSessions");
        migrationBuilder.DropTable("UserAuthentications");
        migrationBuilder.DropTable("UserRoleMaps");
        migrationBuilder.DropTable("UserRoles");
        migrationBuilder.DropTable("Users");
        migrationBuilder.DropTable("Addresses");
        migrationBuilder.DropTable("Subdistricts");
        migrationBuilder.DropTable("Districts");
        migrationBuilder.DropTable("Provinces");
    }
}