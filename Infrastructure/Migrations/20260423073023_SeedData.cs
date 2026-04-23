using System.Text;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =======================================================
            // 1. CSV ADDRESS
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
            // 2. MASTER STATUS
            // =======================================================
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM MasterStatuses)
BEGIN
    INSERT INTO MasterStatuses (Type, Code, NameTh, NameEn) VALUES

    -- User
    ('USER_STATUS',  'ACTIVE',     N'ใช้งาน',              'Active'),
    ('USER_STATUS',  'INACTIVE',   N'ไม่ใช้งาน',            'Inactive'),

    -- ✅ FIX: เพิ่ม SHOP_STATUS แยกออกจาก USER_STATUS
    ('SHOP_STATUS',  'ACTIVE',     N'เปิดใช้งาน',           'Active'),
    ('SHOP_STATUS',  'INACTIVE',   N'ปิดใช้งาน',            'Inactive'),

    -- Booking
    ('BOOKING_STATUS','WAITING',   N'รอคิว',                'Waiting'),
    ('BOOKING_STATUS','CONFIRMED', N'ยืนยันแล้ว',            'Confirmed'),
    ('BOOKING_STATUS','CANCELLED', N'ยกเลิก',               'Cancelled'),
    ('BOOKING_STATUS','DONE',      N'เสร็จสิ้น',             'Done'),

    -- Queue
    ('QUEUE_STATUS', 'WAITING',    N'รอ',                   'Waiting'),
    ('QUEUE_STATUS', 'SERVING',    N'กำลังให้บริการ',        'Serving'),
    ('QUEUE_STATUS', 'DONE',       N'เสร็จแล้ว',            'Done'),
    ('QUEUE_STATUS', 'CANCELLED',  N'ยกเลิก',               'Cancelled'),

    -- Payment
    ('PAYMENT_STATUS','PENDING',   N'รอดำเนินการ',           'Pending'),
    ('PAYMENT_STATUS','PAID',      N'ชำระแล้ว',              'Paid'),
    ('PAYMENT_STATUS','FAILED',    N'ล้มเหลว',               'Failed'),

    -- Notification
    ('NOTIFICATION_STATUS','UNREAD', N'ยังไม่อ่าน', 'Unread'),
    ('NOTIFICATION_STATUS','READ',   N'อ่านแล้ว',   'Read'),

    -- Invoice
    ('INVOICE_STATUS','PENDING',   N'รอชำระ',  'Pending'),
    ('INVOICE_STATUS','PAID',      N'ชำระแล้ว', 'Paid'),
    ('INVOICE_STATUS','CANCELLED', N'ยกเลิก',   'Cancelled'),

    -- Shop Type
    ('SHOP_TYPE', 'CLINIC',     N'คลินิก / สถานพยาบาล', 'Clinic'),
    ('SHOP_TYPE', 'SALON',      N'ร้านเสริมสวย / ตัดผม', 'Salon'),
    ('SHOP_TYPE', 'RESTAURANT', N'ร้านอาหาร',             'Restaurant'),
    ('SHOP_TYPE', 'GOVERNMENT', N'หน่วยงานราชการ',       'Government'),
    ('SHOP_TYPE', 'BANK',       N'ธนาคาร / การเงิน',      'Bank'),
    ('SHOP_TYPE', 'OTHER',      N'อื่น ๆ',                'Other');
END
");

            // =======================================================
            // 3. MOCK DATA
            // =======================================================
            var ownerGuid = Guid.NewGuid();
            var customerGuid = Guid.NewGuid();
            var staffGuid = Guid.NewGuid();
            var adminGuid = Guid.NewGuid();
            var shopGuid = Guid.NewGuid();
            var serviceGuid = Guid.NewGuid();
            var bookingGuid = Guid.NewGuid();

            var sql = $@"

-- =========================
-- ROLES
-- ✅ FIX: เปลี่ยนจาก UserRoles → Roles (ตาม Schema จริง)
-- =========================
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (Id, Name) VALUES
(1, 'Admin'),
(2, 'ShopOwner'),
(3, 'Staff'),
(4, 'Customer');
SET IDENTITY_INSERT Roles OFF;

-- =========================
-- ADDRESS (1 รายการสำหรับ mock)
-- =========================
SET IDENTITY_INSERT Addresses ON;
INSERT INTO Addresses (Id, HouseNo, Street, ProvinceId, DistrictId, SubdistrictId, Zipcode)
VALUES (1, '99/9', N'สุขุมวิท', 1, 1, 1, '10110');
SET IDENTITY_INSERT Addresses OFF;

-- =========================
-- USERS
-- ✅ FIX: ลบ EmailConfirmedAt ออก (column นี้ไม่มีใน Users table)
-- =========================
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (Id, Guid, Name, Phone, Email, StatusId, EmailConfirmed, CreatedAt)
VALUES
(1, '{ownerGuid}',    N'Shop Owner', '0811111111', 'owner@test.com',
    (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),

(2, '{customerGuid}', N'Customer',   '0822222222', 'customer@test.com',
    (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),

(3, '{staffGuid}',    N'Staff',      '0833333333', 'staff@test.com',
    (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),

(4, '{adminGuid}',    N'Admin',      '0000000000', 'admin@test.com',
    (SELECT Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE());
SET IDENTITY_INSERT Users OFF;

-- =========================
-- EMAIL CONFIRMATIONS
-- =========================
INSERT INTO EmailConfirmations (UserId, Token, TokenHash, ExpiredAt, IsUsed, ConfirmedAt, CreatedAt)
VALUES
(1, 't1', 'h1', DATEADD(day,1,GETDATE()), 1, GETDATE(), GETDATE()),
(2, 't2', 'h2', DATEADD(day,1,GETDATE()), 1, GETDATE(), GETDATE()),
(3, 't3', 'h3', DATEADD(day,1,GETDATE()), 1, GETDATE(), GETDATE()),
(4, 't4', 'h4', DATEADD(day,1,GETDATE()), 1, GETDATE(), GETDATE());

-- =========================
-- USER AUTHENTICATIONS
-- Admin ใช้ Local login, คนอื่นเป็น OAuth mock
-- =========================
SET IDENTITY_INSERT UserAuthentications ON;
INSERT INTO UserAuthentications (Id, UserId, Provider, ProviderId, PasswordHash)
VALUES
(1, 4, 'Local', 'admin@test.com', 'PBKDF2$sha256$200000$zZ2ILwM1/pS1lRHdsHtr5g==$5BxeuArlWToEcGLuoTr3XmsIKH3OCswTjOtyE/77Rhk='), -- รหัสผ่าน 1234
(2, 1, 'Google', 'google_owner_001',  NULL),
(3, 2, 'Google', 'google_cust_001',   NULL),
(4, 3, 'Google', 'google_staff_001',  NULL);
SET IDENTITY_INSERT UserAuthentications OFF;

-- =========================
-- USER ROLE MAPS
-- =========================
INSERT INTO UserRoleMaps (UserId, RoleId, CreatedAt)
VALUES
(1, 2, GETDATE()), -- owner    → ShopOwner
(2, 4, GETDATE()), -- customer → Customer
(3, 3, GETDATE()), -- staff    → Staff
(4, 1, GETDATE()); -- admin    → Admin

-- =========================
-- SHOP
-- ✅ FIX: ใช้ SHOP_STATUS แทน USER_STATUS
-- =========================
SET IDENTITY_INSERT Shops ON;
INSERT INTO Shops (Id, Guid, Name, OwnerId, StatusId, TypeId)
VALUES (1, '{shopGuid}', N'Demo Shop', 1,
    (SELECT Id FROM MasterStatuses WHERE Type='SHOP_STATUS' AND Code='ACTIVE'),
    (SELECT Id FROM MasterStatuses WHERE Type='SHOP_TYPE' AND Code='CLINIC'));
SET IDENTITY_INSERT Shops OFF;

-- =========================
-- SHOP BRANCH
-- =========================
SET IDENTITY_INSERT ShopBranches ON;
INSERT INTO ShopBranches (Id, Guid, ShopId, Name, AddressId, Phone)
VALUES (1, NEWID(), 1, N'สาขาหลัก', 1, '020000000');
SET IDENTITY_INSERT ShopBranches OFF;

-- =========================
-- SHOP STAFF
-- ✅ FIX: เพิ่ม ShopStaffs ที่หายไป
-- =========================
SET IDENTITY_INSERT ShopStaffs ON;
INSERT INTO ShopStaffs (Id, ShopId, UserId, Role)
VALUES (1, 1, 1, 'Owner'),
       (2, 1, 3, 'Staff');
SET IDENTITY_INSERT ShopStaffs OFF;

-- =========================
-- SHOP BUSINESS HOURS (จ-ศ 09:00-18:00)
-- =========================
INSERT INTO ShopBusinessHours (ShopId, DayOfWeek, OpenTime, CloseTime)
VALUES
(1, 1, '09:00', '18:00'),
(1, 2, '09:00', '18:00'),
(1, 3, '09:00', '18:00'),
(1, 4, '09:00', '18:00'),
(1, 5, '09:00', '18:00');

-- =========================
-- SERVICE
-- =========================
SET IDENTITY_INSERT Services ON;
INSERT INTO Services (Id, Guid, ShopId, Name, Duration, Price, IsActive)
VALUES (1, '{serviceGuid}', 1, N'บริการทั่วไป', 30, 0.00, 1);
SET IDENTITY_INSERT Services OFF;

-- =========================
-- SERVICE STAFF MAP
-- =========================
INSERT INTO ServiceStaffMaps (ServiceId, StaffId, CreatedAt)
VALUES (1, 2, GETDATE()); -- Staff (ShopStaffId=2) รับบริการ ID 1

-- =========================
-- QUEUE CATEGORY
-- =========================
SET IDENTITY_INSERT QueueCategories ON;
INSERT INTO QueueCategories (Id, ShopId, Prefix, Name)
VALUES (1, 1, 'A', N'คิวทั่วไป');
SET IDENTITY_INSERT QueueCategories OFF;

-- =========================
-- QUEUE SLOT
-- =========================
SET IDENTITY_INSERT QueueSlots ON;
INSERT INTO QueueSlots (Id, Guid, ShopId, BranchId, Date, StartTime, EndTime, MaxQueue, CurrentUsage)
VALUES (1, NEWID(), 1, 1, CAST(GETDATE() AS DATE), '09:00', '18:00', 50, 0);
SET IDENTITY_INSERT QueueSlots OFF;

-- =========================
-- BOOKING
-- ✅ FIX: QueueNumber เปลี่ยนเป็น int (ตาม Schema ที่แก้ไขแล้ว)
-- =========================
SET IDENTITY_INSERT Bookings ON;
INSERT INTO Bookings (Id, Guid, UserId, ShopId, BranchId, QueueSlotId, QueueCategoryId, QueueNumber, StatusId, CreatedAt)
VALUES (1, '{bookingGuid}', 2, 1, 1, 1, 1, 1,
    (SELECT Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='WAITING'),
    GETDATE());
SET IDENTITY_INSERT Bookings OFF;

-- =========================
-- CUSTOMER (link User 2 กับ Shop 1)
-- =========================
SET IDENTITY_INSERT Customers ON;
INSERT INTO Customers (Id, Guid, ShopId, UserId, Name, Phone)
VALUES (1, NEWID(), 1, 2, N'Customer', '0822222222');
SET IDENTITY_INSERT Customers OFF;
";

            migrationBuilder.Sql(sql);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ✅ FIX: ลบตาม FK dependency order (child ก่อน parent เสมอ)
            migrationBuilder.Sql("DELETE FROM ServiceStaffMaps;");
            migrationBuilder.Sql("DELETE FROM ServiceCategoryMaps;");
            migrationBuilder.Sql("DELETE FROM BookingServices;");
            migrationBuilder.Sql("DELETE FROM Bookings;");
            migrationBuilder.Sql("DELETE FROM QueueSlots;");
            migrationBuilder.Sql("DELETE FROM QueueCategories;");
            migrationBuilder.Sql("DELETE FROM CustomerTagMaps;");
            migrationBuilder.Sql("DELETE FROM CustomerNotes;");
            migrationBuilder.Sql("DELETE FROM Customers;");
            migrationBuilder.Sql("DELETE FROM Services;");
            migrationBuilder.Sql("DELETE FROM ServiceCategories;");
            migrationBuilder.Sql("DELETE FROM ShopStaffs;");
            migrationBuilder.Sql("DELETE FROM ShopBusinessHours;");
            migrationBuilder.Sql("DELETE FROM ShopHolidays;");
            migrationBuilder.Sql("DELETE FROM ShopBranches;");
            migrationBuilder.Sql("DELETE FROM Shops;");
            migrationBuilder.Sql("DELETE FROM UserRoleMaps;");
            migrationBuilder.Sql("DELETE FROM EmailConfirmations;");
            migrationBuilder.Sql("DELETE FROM UserAuthentications;");
            migrationBuilder.Sql("DELETE FROM UserSessions;");
            migrationBuilder.Sql("DELETE FROM UserImages;");
            migrationBuilder.Sql("DELETE FROM Users;");
            migrationBuilder.Sql("DELETE FROM Roles;");
            migrationBuilder.Sql("DELETE FROM Addresses;");
            migrationBuilder.Sql("DELETE FROM Subdistricts;");
            migrationBuilder.Sql("DELETE FROM Districts;");
            migrationBuilder.Sql("DELETE FROM Provinces;");
            migrationBuilder.Sql("DELETE FROM MasterStatuses;");
        }
    }
}

