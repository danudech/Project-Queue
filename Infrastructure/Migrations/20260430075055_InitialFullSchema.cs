using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialFullSchema : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =========================
            // MASTER STATUS
            // =========================
            migrationBuilder.CreateTable(
                name: "MasterStatuses",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Type = table.Column<string>(maxLength: 50),
                    Code = table.Column<string>(maxLength: 50),
                    NameTh = table.Column<string>(maxLength: 150),
                    NameEn = table.Column<string>(maxLength: 150),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterStatuses", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_MasterStatuses_Type_Code",
                table: "MasterStatuses",
                columns: new[] { "Type", "Code" },
                unique: true
            );

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
                    table.ForeignKey("FK_Districts_Provinces", x => x.ProvinceId, "Provinces", "Id", onDelete: ReferentialAction.NoAction);
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
                    table.ForeignKey("FK_Subdistricts_Districts", x => x.DistrictId, "Districts", "Id", onDelete: ReferentialAction.NoAction);
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
                    Zipcode = table.Column<string>(maxLength: 10),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey("FK_Addr_Prov", x => x.ProvinceId, "Provinces", "Id");
                    table.ForeignKey("FK_Addr_Dist", x => x.DistrictId, "Districts", "Id");
                    table.ForeignKey("FK_Addr_Sub", x => x.SubdistrictId, "Subdistricts", "Id");
                });

            // =========================
            // ROLES
            // =========================
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>()
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            // =========================
            // USERS
            // =========================
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>()
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Guid = table.Column<Guid>(nullable: false, defaultValueSql: "(newid())"),
                    Name = table.Column<string>(maxLength: 150, nullable: true),
                    Email = table.Column<string>(maxLength: 150, nullable: true),
                    Phone = table.Column<string>(maxLength: 20, nullable: true),
                    StatusId = table.Column<int>(nullable: false),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey("FK_Users_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

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
                name: "IX_Users_StatusId",
                table: "Users",
                column: "StatusId");

            // =========================
            // USER ROLE MAPS
            // =========================
            migrationBuilder.CreateTable(
                name: "UserRoleMaps",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false),
                    RoleId = table.Column<int>(nullable: false),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoleMaps", x => new { x.UserId, x.RoleId });

                    table.ForeignKey(
                        name: "FK_URM_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);

                    table.ForeignKey(
                        name: "FK_URM_Role",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoleMaps_RoleId",
                table: "UserRoleMaps",
                column: "RoleId");

            // =========================
            // EMAIL CONFIRMATION
            // =========================
            migrationBuilder.CreateTable(
                name: "EmailConfirmations",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    UserId = table.Column<int>(),
                    Token = table.Column<string>(maxLength: 200),
                    TokenHash = table.Column<string>(maxLength: 500),
                    ExpiredAt = table.Column<DateTime>(),
                    IsUsed = table.Column<bool>(defaultValue: false),
                    ConfirmedAt = table.Column<DateTime>(nullable: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailConfirmations_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction
                    );
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_UserId",
                table: "EmailConfirmations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_Token",
                table: "EmailConfirmations",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_EmailConfirmations_TokenHash",
                table: "EmailConfirmations",
                column: "TokenHash");

            // =========================
            // USER IMAGES
            // =========================
            migrationBuilder.CreateTable(
                name: "UserImages",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    UserId = table.Column<int>(),
                    FileUrl = table.Column<string>(maxLength: 500),
                    FileName = table.Column<string>(maxLength: 255),
                    ContentType = table.Column<string>(maxLength: 100),
                    FileSize = table.Column<long>(),
                    IsPrimary = table.Column<bool>(defaultValue: false),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserImages_User",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserImages_UserId_IsPrimary",
                table: "UserImages",
                columns: new[] { "UserId", "IsPrimary" });

            // =========================
            // USER AUTHENTICATIONS
            // =========================
            migrationBuilder.CreateTable(
                name: "UserAuthentications",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    UserId = table.Column<int>(),
                    Provider = table.Column<string>(maxLength: 50),
                    ProviderId = table.Column<string>(maxLength: 150),
                    PasswordHash = table.Column<string>(maxLength: 500, nullable: true),
                    LastLoginAt = table.Column<DateTime>(nullable: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAuthentications", x => x.Id);
                    table.ForeignKey("FK_UserAuth_User", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserAuthentications_UserId",
                table: "UserAuthentications",
                column: "UserId");

            // =========================
            // USER SESSIONS
            // =========================
            migrationBuilder.CreateTable(
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    UserId = table.Column<int>(),
                    Session = table.Column<string>(nullable: true),
                    Token = table.Column<string>(),
                    RefreshToken = table.Column<string>(nullable: true),
                    RefreshSalt = table.Column<string>(maxLength: 200, nullable: true),
                    RefreshTokenExpiredAt = table.Column<DateTime>(nullable: true),
                    ExpiredAt = table.Column<DateTime>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessions", x => x.Id);
                    table.ForeignKey("FK_UserSessions_User", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_Guid",
                table: "UserSessions",
                column: "Guid",
                unique: true);

            // =========================
            // SHOP
            // =========================
            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    Name = table.Column<string>(maxLength: 150),
                    OwnerId = table.Column<int>(),
                    TypeId = table.Column<int>(nullable: true),
                    StatusId = table.Column<int>(),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shops", x => x.Id);
                    table.ForeignKey("FK_Shops_Owner", x => x.OwnerId, "Users", "Id");
                    table.ForeignKey("FK_Shops_Type", x => x.TypeId, "MasterStatuses", "Id");
                    table.ForeignKey("FK_Shops_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            migrationBuilder.CreateIndex("IX_Shops_Guid", "Shops", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_Shops_OwnerId", "Shops", "OwnerId");
            migrationBuilder.CreateIndex("IX_Shops_TypeId", "Shops", "TypeId");

            migrationBuilder.CreateTable(
                name: "ShopBranches",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),
                    Name = table.Column<string>(maxLength: 150),
                    AddressId = table.Column<int>(),
                    Phone = table.Column<string>(maxLength: 20),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopBranches", x => x.Id);
                    table.ForeignKey("FK_SB_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SB_Address", x => x.AddressId, "Addresses", "Id");
                });

            migrationBuilder.CreateIndex("IX_ShopBranches_Guid", "ShopBranches", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_ShopBranches_ShopId", "ShopBranches", "ShopId");

            migrationBuilder.CreateTable(
                name: "ShopStaffs",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    // ✅ BRANCH-BASED: Staff ผูกกับ Branch แทน Shop โดยตรง
                    //    ShopId เก็บไว้เพื่อ query ภาพรวมระดับ Shop ได้ง่าย
                    ShopId = table.Column<int>(),
                    BranchId = table.Column<int>(),
                    UserId = table.Column<int>(),
                    Role = table.Column<string>(maxLength: 50),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopStaffs", x => x.Id);
                    table.ForeignKey("FK_SS_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SS_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SS_User", x => x.UserId, "Users", "Id");
                });

            // ✅ Unique ต่อ Branch (ไม่ใช่ Shop) — Staff คนเดียวอาจอยู่หลาย Branch ได้
            migrationBuilder.CreateIndex(
                name: "IX_ShopStaffs_BranchId_UserId",
                table: "ShopStaffs",
                columns: new[] { "BranchId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex("IX_ShopStaffs_ShopId", "ShopStaffs", "ShopId");

            // ✅ BRANCH-BASED: ShopSettings แยกตาม Branch ได้
            //    BranchId nullable → null = ระดับ Shop (global), มีค่า = เฉพาะ Branch นั้น
            migrationBuilder.CreateTable(
                name: "ShopSettings",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    ShopId = table.Column<int>(),
                    BranchId = table.Column<int>(nullable: true),   // null = shop-level setting
                    Key = table.Column<string>(maxLength: 100),
                    Value = table.Column<string>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopSettings", x => x.Id);
                    table.ForeignKey("FK_ShopSettings_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_ShopSettings_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            // ✅ Key unique ต่อ (Shop + Branch) — ถ้า Branch เป็น null ใช้ IS NULL เพิ่ม filtered index แยก
            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_ShopId_BranchId_Key",
                table: "ShopSettings",
                columns: new[] { "ShopId", "BranchId", "Key" });

            // ✅ BRANCH-BASED: BusinessHours อิง Branch แต่เดิมมี ShopId ซ้ำซ้อน → ตัดออก
            //    ดึง ShopId ผ่าน Branch ได้เสมอ
            migrationBuilder.CreateTable(
                name: "ShopBusinessHours",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    BranchId = table.Column<int>(),
                    DayOfWeek = table.Column<int>(),
                    OpenTime = table.Column<TimeSpan>(),
                    CloseTime = table.Column<TimeSpan>(),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopBusinessHours", x => x.Id);
                    table.ForeignKey("FK_ShopBusinessHours_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShopBusinessHours_BranchId_DayOfWeek",
                table: "ShopBusinessHours",
                columns: new[] { "BranchId", "DayOfWeek" },
                unique: true);

            // ✅ BRANCH-BASED: Holiday แยกตาม Branch
            //    ShopId เก็บไว้เพื่อ query holiday ภาพรวม Shop ได้ง่าย
            migrationBuilder.CreateTable(
                name: "ShopHolidays",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    ShopId = table.Column<int>(),
                    BranchId = table.Column<int>(),
                    HolidayDate = table.Column<DateTime>(type: "date"),
                    Reason = table.Column<string>(maxLength: 200),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopHolidays", x => x.Id);
                    table.ForeignKey("FK_Holidays_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_Holidays_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShopHolidays_BranchId_HolidayDate",
                table: "ShopHolidays",
                columns: new[] { "BranchId", "HolidayDate" },
                unique: true);

            migrationBuilder.CreateIndex("IX_ShopHolidays_ShopId", "ShopHolidays", "ShopId");

            // =========================
            // SERVICE  (ทั้งหมดอิง Branch)
            // =========================

            // ✅ BRANCH-BASED: QueueCategory แยกตาม Branch
            //    แต่ละสาขาอาจมี prefix/หมวดคิวต่างกัน เช่น สาขา A ใช้ A001 / สาขา B ใช้ B001
            migrationBuilder.CreateTable(
                name: "QueueCategories",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    ShopId = table.Column<int>(),     // เก็บไว้เพื่อ query ระดับ Shop
                    BranchId = table.Column<int>(),   // ✅ เพิ่ม: owner หลักคือ Branch
                    Prefix = table.Column<string>(maxLength: 5),
                    Name = table.Column<string>(maxLength: 100),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueCategories", x => x.Id);
                    table.ForeignKey("FK_QC_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_QC_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            // ✅ Prefix unique ต่อ Branch (ไม่ใช่ Shop)
            migrationBuilder.CreateIndex(
                name: "IX_QueueCategories_BranchId_Prefix",
                table: "QueueCategories",
                columns: new[] { "BranchId", "Prefix" },
                unique: true);

            migrationBuilder.CreateIndex("IX_QueueCategories_ShopId", "QueueCategories", "ShopId");

            // ✅ BRANCH-BASED: ServiceCategory แยกตาม Branch
            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    ShopId = table.Column<int>(),     // เก็บไว้เพื่อ query ระดับ Shop
                    BranchId = table.Column<int>(),   // ✅ เพิ่ม: owner หลักคือ Branch
                    Name = table.Column<string>(maxLength: 150),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                    table.ForeignKey("FK_SC_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SC_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex("IX_ServiceCategories_BranchId", "ServiceCategories", "BranchId");
            migrationBuilder.CreateIndex("IX_ServiceCategories_ShopId", "ServiceCategories", "ShopId");

            // ✅ BRANCH-BASED: Service แยกตาม Branch
            //    แต่ละสาขาอาจมีบริการ/ราคา/ระยะเวลาต่างกัน
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),     // เก็บไว้เพื่อ query ระดับ Shop
                    BranchId = table.Column<int>(),   // ✅ เปลี่ยน: owner หลักคือ Branch
                    Name = table.Column<string>(maxLength: 150),
                    Duration = table.Column<int>(),
                    Price = table.Column<decimal>(type: "decimal(10,2)"),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey("FK_Services_Shop", x => x.ShopId, "Shops", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_Services_Branch", x => x.BranchId, "ShopBranches", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex("IX_Services_Guid", "Services", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_Services_BranchId", "Services", "BranchId");
            migrationBuilder.CreateIndex("IX_Services_ShopId", "Services", "ShopId");

            migrationBuilder.CreateTable(
                name: "ServiceCategoryMaps",
                columns: table => new
                {
                    ServiceId = table.Column<int>(),
                    CategoryId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategoryMaps", x => new { x.ServiceId, x.CategoryId });
                    table.ForeignKey("FK_SCM_Service", x => x.ServiceId, "Services", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SCM_Category", x => x.CategoryId, "ServiceCategories", "Id", onDelete: ReferentialAction.NoAction);
                });

            // ✅ ServiceStaffMaps: Staff ผูกกับ Service ซึ่งผูกกับ Branch อยู่แล้ว
            migrationBuilder.CreateTable(
                name: "ServiceStaffMaps",
                columns: table => new
                {
                    ServiceId = table.Column<int>(),
                    StaffId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceStaffMaps", x => new { x.ServiceId, x.StaffId });
                    table.ForeignKey("FK_SSM_Service", x => x.ServiceId, "Services", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_SSM_Staff", x => x.StaffId, "ShopStaffs", "Id", onDelete: ReferentialAction.NoAction);
                });

            // =========================
            // BOOKING / QUEUE  (อิง Branch)
            // =========================

            // ✅ QueueSlots อิง Branch อยู่แล้ว — คง ShopId ไว้เพื่อ query ระดับ Shop
            migrationBuilder.CreateTable(
                name: "QueueSlots",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),
                    BranchId = table.Column<int>(),
                    Date = table.Column<DateTime>(),
                    StartTime = table.Column<TimeSpan>(),
                    EndTime = table.Column<TimeSpan>(),
                    MaxQueue = table.Column<int>(),
                    CurrentUsage = table.Column<int>(defaultValue: 0),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueSlots", x => x.Id);
                    table.ForeignKey("FK_QS_Shop", x => x.ShopId, "Shops", "Id");
                    table.ForeignKey("FK_QS_Branch", x => x.BranchId, "ShopBranches", "Id");
                });

            migrationBuilder.CreateIndex("IX_QueueSlots_Guid", "QueueSlots", "Guid", unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QueueSlots_Branch_Date_StartTime",
                table: "QueueSlots",
                columns: new[] { "BranchId", "Date", "StartTime" },
                unique: true);

            // ✅ BRANCH-BASED: Booking อิง Branch เป็นหลัก
            //    ตัด ShopId ออก — ดึงผ่าน Branch.ShopId ได้เสมอ
            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    UserId = table.Column<int>(),
                    BranchId = table.Column<int>(),         // ✅ owner หลักคือ Branch
                    QueueSlotId = table.Column<int>(),
                    QueueCategoryId = table.Column<int>(nullable: true),
                    QueueNumber = table.Column<int>(nullable: true),
                    Remark = table.Column<string>(nullable: true),
                    StatusId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey("FK_Bookings_User", x => x.UserId, "Users", "Id");
                    table.ForeignKey("FK_Bookings_Branch", x => x.BranchId, "ShopBranches", "Id");
                    table.ForeignKey("FK_Bookings_Slot", x => x.QueueSlotId, "QueueSlots", "Id");
                    table.ForeignKey("FK_Bookings_Category", x => x.QueueCategoryId, "QueueCategories", "Id");
                    table.ForeignKey("FK_Bookings_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            migrationBuilder.CreateIndex("IX_Bookings_Guid", "Bookings", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_Bookings_BranchId", "Bookings", "BranchId");
            migrationBuilder.CreateIndex("IX_Bookings_StatusId", "Bookings", "StatusId");
            migrationBuilder.CreateIndex("IX_Bookings_QueueSlotId", "Bookings", "QueueSlotId");
            migrationBuilder.CreateIndex("IX_Bookings_QueueCategoryId", "Bookings", "QueueCategoryId");
            migrationBuilder.CreateIndex("IX_Bookings_QueueNumber", "Bookings", "QueueNumber");

            migrationBuilder.CreateTable(
                name: "BookingServices",
                columns: table => new
                {
                    BookingId = table.Column<int>(),
                    ServiceId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingServices", x => new { x.BookingId, x.ServiceId });
                    table.ForeignKey("FK_BS_Booking", x => x.BookingId, "Bookings", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_BS_Service", x => x.ServiceId, "Services", "Id");
                });

            // ✅ BRANCH-BASED: Queue อิง Branch
            //    ตัด ShopId ออก — ดึงผ่าน Branch.ShopId ได้
            migrationBuilder.CreateTable(
                name: "Queues",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    BranchId = table.Column<int>(),   // ✅ owner หลักคือ Branch
                    QueueNumber = table.Column<int>(),
                    StatusId = table.Column<int>(),
                    Type = table.Column<string>(maxLength: 20),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Queues", x => x.Id);
                    table.ForeignKey("FK_Queues_Branch", x => x.BranchId, "ShopBranches", "Id");
                    table.ForeignKey("FK_Queues_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            migrationBuilder.CreateIndex("IX_Queues_Guid", "Queues", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_Queues_StatusId", "Queues", "StatusId");
            migrationBuilder.CreateIndex("IX_Queues_BranchId", "Queues", "BranchId");

            migrationBuilder.CreateTable(
                name: "QueueLogs",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    QueueId = table.Column<int>(),
                    StatusId = table.Column<int>(),
                    Timestamp = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueLogs", x => x.Id);
                    table.ForeignKey("FK_QueueLogs_Queue", x => x.QueueId, "Queues", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_QueueLogs_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            // =========================
            // CUSTOMER
            // =========================
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),
                    UserId = table.Column<int>(),
                    Name = table.Column<string>(maxLength: 150),
                    Phone = table.Column<string>(maxLength: 20),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                    table.ForeignKey("FK_Customers_Shop", x => x.ShopId, "Shops", "Id");
                    table.ForeignKey("FK_Customers_User", x => x.UserId, "Users", "Id");
                });

            migrationBuilder.CreateIndex("IX_Customers_Guid", "Customers", "Guid", unique: true);
            migrationBuilder.CreateIndex("IX_Customers_ShopId", "Customers", "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserId_ShopId",
                table: "Customers",
                columns: new[] { "UserId", "ShopId" },
                unique: true);

            migrationBuilder.CreateTable(
                name: "CustomerNotes",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    CustomerId = table.Column<int>(),
                    Note = table.Column<string>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerNotes", x => x.Id);
                    table.ForeignKey("FK_CustomerNotes_Customer", x => x.CustomerId, "Customers", "Id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTags",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Name = table.Column<string>(maxLength: 100),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table => table.PrimaryKey("PK_CustomerTags", x => x.Id));

            migrationBuilder.CreateTable(
                name: "CustomerTagMaps",
                columns: table => new
                {
                    CustomerId = table.Column<int>(),
                    TagId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTagMaps", x => new { x.CustomerId, x.TagId });
                    table.ForeignKey("FK_CTM_Customer", x => x.CustomerId, "Customers", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_CTM_Tag", x => x.TagId, "CustomerTags", "Id", onDelete: ReferentialAction.NoAction);
                });

            // =========================
            // PAYMENT
            // =========================
            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    BookingId = table.Column<int>(),
                    Amount = table.Column<decimal>(type: "decimal(10,2)"),
                    Method = table.Column<string>(maxLength: 50),
                    StatusId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey("FK_Payments_Booking", x => x.BookingId, "Bookings", "Id");
                    table.ForeignKey("FK_Payments_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    PaymentId = table.Column<int>(),
                    Provider = table.Column<string>(maxLength: 50),
                    TransactionRef = table.Column<string>(maxLength: 150),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.ForeignKey("FK_PaymentTransactions_Payment", x => x.PaymentId, "Payments", "Id", onDelete: ReferentialAction.NoAction);
                });

            // =========================
            // NOTIFICATION
            // =========================
            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    UserId = table.Column<int>(),
                    Type = table.Column<string>(maxLength: 50),
                    Title = table.Column<string>(maxLength: 150),
                    Message = table.Column<string>(),
                    StatusId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey("FK_Notifications_User", x => x.UserId, "Users", "Id");
                    table.ForeignKey("FK_Notifications_Status", x => x.StatusId, "MasterStatuses", "Id");
                });

            migrationBuilder.CreateTable(
                name: "NotificationLogs",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    NotificationId = table.Column<int>(),
                    StatusId = table.Column<int>(),
                    SentAt = table.Column<DateTime>(),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLogs", x => x.Id);
                    table.ForeignKey("FK_NotificationLogs_Notification", x => x.NotificationId, "Notifications", "Id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey("FK_NotificationLogs_Status", x => x.StatusId, "MasterStatuses", "Id", onDelete: ReferentialAction.NoAction);
                });

            // =========================
            // SYSTEM
            // =========================
            migrationBuilder.CreateTable(
                name: "SystemConfigs",
                columns: table => new
                {
                    Key = table.Column<string>(maxLength: 100),
                    Value = table.Column<string>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
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
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table => table.PrimaryKey("PK_AuditLogs", x => x.Id));

            // =========================
            // SAAS
            // =========================
            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),
                    PlanName = table.Column<string>(maxLength: 100),
                    Price = table.Column<decimal>(type: "decimal(10,2)"),
                    StartDate = table.Column<DateTime>(),
                    EndDate = table.Column<DateTime>(),
                    IsActive = table.Column<bool>(defaultValue: true),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
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
                    Id = table.Column<int>().Annotation("SqlServer:Identity", "1,1"),
                    Guid = table.Column<Guid>(defaultValueSql: "NEWID()"),
                    ShopId = table.Column<int>(),
                    Amount = table.Column<decimal>(type: "decimal(10,2)"),
                    StatusId = table.Column<int>(),
                    CreatedAt = table.Column<DateTime>(defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<int>(nullable: true),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey("FK_Invoices_Shop", x => x.ShopId, "Shops", "Id");
                    table.ForeignKey("FK_Invoices_Status", x => x.StatusId, "MasterStatuses", "Id", onDelete: ReferentialAction.NoAction);
                });
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
            migrationBuilder.DropTable("UserImages");
            migrationBuilder.DropTable("EmailConfirmations");
            migrationBuilder.DropTable("UserRoleMaps");
            migrationBuilder.DropTable("Users");
            migrationBuilder.DropTable("Roles");
            migrationBuilder.DropTable("Addresses");
            migrationBuilder.DropTable("Subdistricts");
            migrationBuilder.DropTable("Districts");
            migrationBuilder.DropTable("Provinces");
            migrationBuilder.DropTable("MasterStatuses");
        }
    }
}