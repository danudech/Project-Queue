using System.Text;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    public partial class SeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =======================================================
            // 1. CSV ADDRESS (ของเดิมคุณ — ไม่แตะ)
            // =======================================================
            var csvFileName = "database.csv";
            var csvPath = Path.Combine(Directory.GetCurrentDirectory(), csvFileName);

            if (!File.Exists(csvPath))
                csvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "API", csvFileName);

            if (!File.Exists(csvPath))
                throw new FileNotFoundException($"ไม่พบไฟล์ {csvFileName}");

            var lines = File.ReadAllLines(csvPath, Encoding.UTF8);

            var provinces = new Dictionary<string, int>();
            var districts = new Dictionary<string, int>();

            int provId = 1, distId = 1, subId = 1;

            var sqlProvinces = new StringBuilder();
            var sqlDistricts = new StringBuilder();
            var sqlSubdistricts = new StringBuilder();

            sqlProvinces.AppendLine("SET IDENTITY_INSERT Provinces ON;");
            sqlDistricts.AppendLine("SET IDENTITY_INSERT Districts ON;");
            sqlSubdistricts.AppendLine("SET IDENTITY_INSERT Subdistricts ON;");

            for (int i = 1; i < lines.Length; i++)
            {
                var cols = lines[i].Split(',');
                if (cols.Length < 4) continue;

                string prov = cols[0].Trim().Replace("'", "''");
                string dist = cols[1].Trim().Replace("'", "''");
                string sub = cols[2].Trim().Replace("'", "''");
                string zip = cols[3].Trim().Replace(".0", "");

                if (!provinces.ContainsKey(prov))
                {
                    provinces[prov] = provId;
                    sqlProvinces.AppendLine($"INSERT INTO Provinces (Id, NameTh, NameEn) VALUES ({provId}, N'{prov}', '');");
                    provId++;
                }

                string distKey = prov + "_" + dist;
                if (!districts.ContainsKey(distKey))
                {
                    districts[distKey] = distId;
                    sqlDistricts.AppendLine($"INSERT INTO Districts (Id, ProvinceId, NameTh, NameEn) VALUES ({distId}, {provinces[prov]}, N'{dist}', '');");
                    distId++;
                }

                sqlSubdistricts.AppendLine($"INSERT INTO Subdistricts (Id, DistrictId, NameTh, NameEn, Zipcode) VALUES ({subId}, {districts[distKey]}, N'{sub}', '', '{zip}');");
                subId++;
            }

            sqlProvinces.AppendLine("SET IDENTITY_INSERT Provinces OFF;");
            sqlDistricts.AppendLine("SET IDENTITY_INSERT Districts OFF;");
            sqlSubdistricts.AppendLine("SET IDENTITY_INSERT Subdistricts OFF;");

            migrationBuilder.Sql(sqlProvinces.ToString());
            migrationBuilder.Sql(sqlDistricts.ToString());
            migrationBuilder.Sql(sqlSubdistricts.ToString());

            // =======================================================
            // 2. MASTER STATUS (แก้ให้ safe)
            // =======================================================
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM MasterStatuses)
BEGIN
INSERT INTO MasterStatuses (Type, Code, NameTh, NameEn) VALUES

('USER_STATUS','ACTIVE',N'ใช้งาน','Active'),
('USER_STATUS','INACTIVE',N'ไม่ใช้งาน','Inactive'),

('BOOKING_STATUS','WAITING',N'รอคิว','Waiting'),
('BOOKING_STATUS','CONFIRMED',N'ยืนยันแล้ว','Confirmed'),
('BOOKING_STATUS','CANCELLED',N'ยกเลิก','Cancelled'),

('QUEUE_STATUS','WAITING',N'รอ','Waiting'),
('QUEUE_STATUS','SERVING',N'กำลังให้บริการ','Serving'),
('QUEUE_STATUS','DONE',N'เสร็จแล้ว','Done'),

('PAYMENT_STATUS','PENDING',N'รอดำเนินการ','Pending'),
('PAYMENT_STATUS','PAID',N'ชำระแล้ว','Paid'),
('PAYMENT_STATUS','FAILED',N'ล้มเหลว','Failed');
END
");

            // =======================================================
            // 3. MOCK DATA (แก้สำคัญ)
            // =======================================================

            var ownerGuid = Guid.NewGuid();
            var customerGuid = Guid.NewGuid();
            var staffGuid = Guid.NewGuid();
            var adminGuid = Guid.NewGuid();
            var shopGuid = Guid.NewGuid();
            var branchGuid = Guid.NewGuid();
            var serviceGuid = Guid.NewGuid();
            var slotGuid = Guid.NewGuid();
            var bookingGuid = Guid.NewGuid();

            var sql = $@"

-- Roles
SET IDENTITY_INSERT UserRoles ON;
INSERT INTO UserRoles (Id, Name) VALUES 
(1,'Admin'),(2,'ShopOwner'),(3,'Staff'),(4,'Customer');
SET IDENTITY_INSERT UserRoles OFF;

-- Address
SET IDENTITY_INSERT Addresses ON;
INSERT INTO Addresses (Id, HouseNo, Street, ProvinceId, DistrictId, SubdistrictId, Zipcode)
VALUES (1,'99/9',N'สุขุมวิท',1,1,1,'10110');
SET IDENTITY_INSERT Addresses OFF;

-- Users (ใช้ subquery แทน hardcode)
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (Id, Guid, Name, Phone, Email, StatusId, EmailConfirmed, EmailConfirmedAt)
VALUES
(1,'{ownerGuid}','Shop Owner','0811111111','owner@test.com',
 (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),1,GETDATE()),

(2,'{customerGuid}','Customer','0822222222','customer@test.com',
 (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),1,GETDATE()),

(3,'{staffGuid}','Staff','0833333333','staff@test.com',
 (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),1,GETDATE()),

(4,'{adminGuid}','Admin','0000000000','admin',
 (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),1,GETDATE());
SET IDENTITY_INSERT Users OFF;

-- Email Confirm (ครบทุก user)
INSERT INTO EmailConfirmations (UserId, Token, TokenHash, ExpiredAt, IsUsed, CreatedAt)
VALUES
(1,'t1','h1',DATEADD(day,1,GETDATE()),1,GETDATE()),
(2,'t2','h2',DATEADD(day,1,GETDATE()),1,GETDATE()),
(3,'t3','h3',DATEADD(day,1,GETDATE()),1,GETDATE()),
(4,'t4','h4',DATEADD(day,1,GETDATE()),1,GETDATE());

SET IDENTITY_INSERT UserAuthentications ON;
INSERT INTO UserAuthentications (Id, UserId, Provider, ProviderId, PasswordHash)
VALUES (1, 4, 'Local', 'admin', 'PBKDF2$sha256$200000$zZ2ILwM1/pS1lRHdsHtr5g==$5BxeuArlWToEcGLuoTr3XmsIKH3OCswTjOtyE/77Rhk='); -- รหัสผ่าน 1234
SET IDENTITY_INSERT UserAuthentications OFF;

INSERT INTO UserRoleMaps (UserId, RoleId) VALUES 
(1, 2), -- User 1 = ShopOwner
(2, 4), -- User 2 = Customer
(3, 3), -- User 3 = Staff
(4, 1); -- User 4 = Admin (ผูก Role 1 ให้ Admin)


-- Shop
SET IDENTITY_INSERT Shops ON;
INSERT INTO Shops (Id, Guid, Name, OwnerId, AddressId, StatusId)
VALUES (1,'{shopGuid}','Demo Shop',1,1,
 (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'));
SET IDENTITY_INSERT Shops OFF;

-- Branch
SET IDENTITY_INSERT ShopBranches ON;
INSERT INTO ShopBranches (Id, Guid, ShopId, Name, AddressId, Phone)
VALUES (1, NEWID(), 1, N'สาขาหลัก', 1, '020000000');
SET IDENTITY_INSERT ShopBranches OFF;

-- Queue Category
SET IDENTITY_INSERT QueueCategories ON;
INSERT INTO QueueCategories (Id, ShopId, Prefix, Name)
VALUES (1,1,'A',N'คิวทั่วไป');
SET IDENTITY_INSERT QueueCategories OFF;

-- Slot
SET IDENTITY_INSERT QueueSlots ON;
INSERT INTO QueueSlots (Id, Guid, ShopId, BranchId, Date, StartTime, EndTime, MaxQueue)
VALUES (1, NEWID(), 1, 1, GETDATE(), '09:00','18:00',50);
SET IDENTITY_INSERT QueueSlots OFF;

-- Booking
SET IDENTITY_INSERT Bookings ON;
INSERT INTO Bookings (Id, Guid, UserId, ShopId, BranchId, QueueSlotId, QueueCategoryId, QueueNumber, StatusId)
VALUES (1,'{bookingGuid}',2,1,1,1,1,'A001',
 (SELECT Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='WAITING'));
SET IDENTITY_INSERT Bookings OFF;
";

            migrationBuilder.Sql(sql);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM BookingServices;");
            migrationBuilder.Sql("DELETE FROM Bookings;");
            migrationBuilder.Sql("DELETE FROM Shops;");
            migrationBuilder.Sql("DELETE FROM EmailConfirmations;");
            migrationBuilder.Sql("DELETE FROM Users;");
            migrationBuilder.Sql("DELETE FROM Addresses;");
            migrationBuilder.Sql("DELETE FROM MasterStatuses;");
            migrationBuilder.Sql("DELETE FROM ShopBranches;");
            migrationBuilder.Sql("DELETE FROM QueueCategories;");
            migrationBuilder.Sql("DELETE FROM QueueSlots;");

        }
    }
}