using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    public partial class SeedData : Migration
    {
        private class ProvinceJson
        {
            public int id { get; set; }
            public string name_th { get; set; }
            public string name_en { get; set; }
        }

        private class DistrictJson
        {
            public int id { get; set; }
            public int province_id { get; set; }
            public string name_th { get; set; }
            public string name_en { get; set; }
        }

        private class SubdistrictJson
        {
            public int id { get; set; }
            public int district_id { get; set; }
            public string name_th { get; set; }
            public string name_en { get; set; }
            public object zip_code { get; set; }
        }

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 0. ปิด Constraint ทั้งหมดก่อนเริ่มทำงาน
            migrationBuilder.Sql("EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';");

            var baseDir = Directory.GetCurrentDirectory();
            string GetFilePath(string fileName)
            {
                var path = Path.Combine(baseDir, "SeedData", fileName);
                if (!File.Exists(path))
                    path = Path.Combine(baseDir, "..", "API", "SeedData", fileName);
                if (!File.Exists(path))
                    path = Path.Combine(baseDir, "SeedData", fileName);
                return path;
            }

            var provPath = GetFilePath("provinces.json");
            var distPath = GetFilePath("districts.json");
            var subPath  = GetFilePath("sub_districts.json");

            // --- 1.1 Insert Provinces ---
            if (File.Exists(provPath))
            {
                var json = File.ReadAllText(provPath, Encoding.UTF8);
                var provinces = JsonSerializer.Deserialize<List<ProvinceJson>>(json);
                if (provinces != null)
                {
                    var sqlbuild = new StringBuilder();
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Provinces ON;");
                    foreach (var p in provinces)
                    {
                        var nameTh = p.name_th?.Replace("'", "''") ?? "";
                        var nameEn = p.name_en?.Replace("'", "''") ?? "";
                        sqlbuild.AppendLine($"INSERT INTO Provinces (Id, NameTh, NameEn) VALUES ({p.id}, N'{nameTh}', N'{nameEn}');");
                    }
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Provinces OFF;");
                    migrationBuilder.Sql(sqlbuild.ToString());
                }
            }

            // --- 1.2 Insert Districts ---
            if (File.Exists(distPath))
            {
                var json = File.ReadAllText(distPath, Encoding.UTF8);
                var districts = JsonSerializer.Deserialize<List<DistrictJson>>(json);
                if (districts != null)
                {
                    var sqlbuild = new StringBuilder();
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Districts ON;");
                    foreach (var d in districts)
                    {
                        var nameTh = d.name_th?.Replace("'", "''") ?? "";
                        var nameEn = d.name_en?.Replace("'", "''") ?? "";
                        sqlbuild.AppendLine($"INSERT INTO Districts (Id, ProvinceId, NameTh, NameEn) VALUES ({d.id}, {d.province_id}, N'{nameTh}', N'{nameEn}');");
                    }
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Districts OFF;");
                    migrationBuilder.Sql(sqlbuild.ToString());
                }
            }
            else
            {
                throw new Exception($"SeedData Failed: File not found at {distPath}");
            }

            // --- 1.3 Insert Subdistricts ---
            if (File.Exists(subPath))
            {
                var json = File.ReadAllText(subPath, Encoding.UTF8);
                var subdistricts = JsonSerializer.Deserialize<List<SubdistrictJson>>(json);
                if (subdistricts != null)
                {
                    var sqlbuild = new StringBuilder();
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Subdistricts ON;");
                    int count = 0;
                    foreach (var s in subdistricts)
                    {
                        var nameTh = s.name_th?.Replace("'", "''") ?? "";
                        var nameEn = s.name_en?.Replace("'", "''") ?? "";
                        var zip    = s.zip_code?.ToString()?.Trim() ?? "";
                        sqlbuild.AppendLine($"INSERT INTO Subdistricts (Id, DistrictId, NameTh, NameEn, Zipcode) VALUES ({s.id}, {s.district_id}, N'{nameTh}', N'{nameEn}', '{zip}');");
                        count++;
                        if (count % 1000 == 0)
                        {
                            migrationBuilder.Sql(sqlbuild.ToString());
                            sqlbuild.Clear();
                        }
                    }
                    sqlbuild.AppendLine("SET IDENTITY_INSERT Subdistricts OFF;");
                    if (sqlbuild.Length > 25) migrationBuilder.Sql(sqlbuild.ToString());
                }
            }

            // --- 2. Master Status ---
            migrationBuilder.Sql(@"
            IF NOT EXISTS (SELECT 1 FROM MasterStatuses)
            BEGIN
                INSERT INTO MasterStatuses (Type, Code, NameTh, NameEn, IsActive, CreatedAt) VALUES

                -- ─── USER_STATUS ─────────────────────────────────────────────
                ('USER_STATUS',         'ACTIVE',           N'ใช้งาน',                          'Active',               1, GETDATE()),
                ('USER_STATUS',         'INACTIVE',         N'ไม่ใช้งาน',                       'Inactive',             1, GETDATE()),

                -- ─── SHOP_STATUS ─────────────────────────────────────────────
                ('SHOP_STATUS',         'ACTIVE',           N'เปิดใช้งาน',                      'Active',               1, GETDATE()),
                ('SHOP_STATUS',         'INACTIVE',         N'ปิดใช้งาน',                       'Inactive',             1, GETDATE()),

                -- ─── BOOKING_STATUS ──────────────────────────────────────────
                -- flow: WAITING → CONFIRMED → CHECKED_IN → DONE
                --                           → CANCELLED / NO_SHOW
                ('BOOKING_STATUS',      'WAITING',          N'รอการยืนยัน',                     'Waiting',              1, GETDATE()),
                ('BOOKING_STATUS',      'CONFIRMED',        N'ยืนยันแล้ว',                      'Confirmed',            1, GETDATE()),
                ('BOOKING_STATUS',      'CHECKED_IN',       N'เช็คอินแล้ว',                     'Checked In',           1, GETDATE()),
                ('BOOKING_STATUS',      'DONE',             N'เสร็จสิ้น',                       'Done',                 1, GETDATE()),
                ('BOOKING_STATUS',      'CANCELLED',        N'ยกเลิก',                          'Cancelled',            1, GETDATE()),
                ('BOOKING_STATUS',      'NO_SHOW',          N'ไม่มาตามนัด',                     'No Show',              1, GETDATE()),

                -- ─── QUEUE_STATUS ─────────────────────────────────────────────
                -- flow: WAITING → SERVING → DONE
                --                         → CANCELLED / SKIPPED
                ('QUEUE_STATUS',        'WAITING',          N'รอ',                              'Waiting',              1, GETDATE()),
                ('QUEUE_STATUS',        'SERVING',          N'กำลังให้บริการ',                  'Serving',              1, GETDATE()),
                ('QUEUE_STATUS',        'DONE',             N'เสร็จแล้ว',                       'Done',                 1, GETDATE()),
                ('QUEUE_STATUS',        'CANCELLED',        N'ยกเลิก',                          'Cancelled',            1, GETDATE()),
                ('QUEUE_STATUS',        'SKIPPED',          N'ข้ามคิว',                         'Skipped',              1, GETDATE()),

                -- ─── PAYMENT_STATUS ──────────────────────────────────────────
                ('PAYMENT_STATUS',      'PENDING',          N'รอดำเนินการ',                     'Pending',              1, GETDATE()),
                ('PAYMENT_STATUS',      'PAID',             N'ชำระแล้ว',                        'Paid',                 1, GETDATE()),
                ('PAYMENT_STATUS',      'FAILED',           N'ล้มเหลว',                         'Failed',               1, GETDATE()),
                ('PAYMENT_STATUS',      'REFUNDED',         N'คืนเงินแล้ว',                     'Refunded',             1, GETDATE()),

                -- ─── NOTIFICATION_STATUS ─────────────────────────────────────
                ('NOTIFICATION_STATUS', 'UNREAD',           N'ยังไม่อ่าน',                      'Unread',               1, GETDATE()),
                ('NOTIFICATION_STATUS', 'READ',             N'อ่านแล้ว',                        'Read',                 1, GETDATE()),

                -- ─── INVOICE_STATUS ──────────────────────────────────────────
                ('INVOICE_STATUS',      'PENDING',          N'รอชำระ',                          'Pending',              1, GETDATE()),
                ('INVOICE_STATUS',      'PAID',             N'ชำระแล้ว',                        'Paid',                 1, GETDATE()),
                ('INVOICE_STATUS',      'CANCELLED',        N'ยกเลิก',                          'Cancelled',            1, GETDATE()),
                ('INVOICE_STATUS',      'OVERDUE',          N'เกินกำหนดชำระ',                   'Overdue',              1, GETDATE()),

                -- ─── SHOP_TYPE ───────────────────────────────────────────────
                -- สุขภาพ & ความงาม
                ('SHOP_TYPE', 'CLINIC',         N'🏥 คลินิก / สถานพยาบาล',         N'🏥 Clinic',                1, GETDATE()),
                ('SHOP_TYPE', 'HOSPITAL',       N'🏨 โรงพยาบาล',                   N'🏨 Hospital',              1, GETDATE()),
                ('SHOP_TYPE', 'DENTAL',         N'🦷 คลินิกทันตกรรม',              N'🦷 Dental Clinic',         1, GETDATE()),
                ('SHOP_TYPE', 'PHARMACY',       N'💊 ร้านขายยา',                   N'💊 Pharmacy',              1, GETDATE()),
                ('SHOP_TYPE', 'SPA',            N'💆 สปา / นวดแผนไทย',             N'💆 Spa & Massage',         1, GETDATE()),
                ('SHOP_TYPE', 'SALON',          N'✂️ ร้านเสริมสวย / ตัดผม',        N'✂️ Beauty Salon',          1, GETDATE()),
                ('SHOP_TYPE', 'NAIL',           N'💅 ร้านทำเล็บ',                  N'💅 Nail Studio',           1, GETDATE()),
                ('SHOP_TYPE', 'FITNESS',        N'💪 ฟิตเนส / โยคะ',               N'💪 Fitness & Yoga',        1, GETDATE()),
                ('SHOP_TYPE', 'HOSPITAL_GOV',   N'🏥 โรงพยาบาลรัฐ',                N'🏥 Public Hospital',       1, GETDATE()),
                -- อาหาร & เครื่องดื่ม
                ('SHOP_TYPE', 'RESTAURANT',     N'🍴 ร้านอาหาร',                   N'🍴 Restaurant',            1, GETDATE()),
                ('SHOP_TYPE', 'CAFE',           N'☕ คาเฟ่ / เครื่องดื่ม',         N'☕ Café',                  1, GETDATE()),
                ('SHOP_TYPE', 'BAKERY',         N'🥐 เบเกอรี่',                    N'🥐 Bakery',                1, GETDATE()),
                -- ยานยนต์
                ('SHOP_TYPE', 'CAR_SERVICE',    N'🚗 ศูนย์บริการรถยนต์',           N'🚗 Car Service',           1, GETDATE()),
                ('SHOP_TYPE', 'MOTORCYCLE',     N'🏍️ ร้านซ่อมมอเตอร์ไซค์',         N'🏍️ Motorcycle Repair',    1, GETDATE()),
                ('SHOP_TYPE', 'CAR_WASH',       N'🧼 ร้านล้างรถ',                  N'🧼 Car Wash',              1, GETDATE()),
                -- การเงิน & ราชการ
                ('SHOP_TYPE', 'BANK',           N'💰 ธนาคาร / การเงิน',            N'💰 Bank',                  1, GETDATE()),
                ('SHOP_TYPE', 'GOVERNMENT',     N'🏛️ หน่วยงานราชการ',              N'🏛️ Government',            1, GETDATE()),
                ('SHOP_TYPE', 'INSURANCE',      N'🛡️ ประกันภัย',                   N'🛡️ Insurance',             1, GETDATE()),
                -- การศึกษา & บริการส่วนตัว
                ('SHOP_TYPE', 'TUTOR',          N'📚 ติวเตอร์ / สอนพิเศษ',         N'📚 Tutoring',              1, GETDATE()),
                ('SHOP_TYPE', 'STUDIO',         N'📸 สตูดิโอ / ถ่ายภาพ',           N'📸 Studio',                1, GETDATE()),
                ('SHOP_TYPE', 'LAWYER',         N'⚖️ ทนายความ / กฎหมาย',           N'⚖️ Legal Service',         1, GETDATE()),
                ('SHOP_TYPE', 'FREELANCE',      N'💻 ฟรีแลนซ์ / บริการส่วนตัว',    N'💻 Freelance',             1, GETDATE()),
                ('SHOP_TYPE', 'CONSULTANT',     N'🤝 ที่ปรึกษา',                   N'🤝 Consultant',            1, GETDATE()),
                ('SHOP_TYPE', 'PET',            N'🐾 ร้านสัตว์เลี้ยง / สัตวแพทย์', N'🐾 Pet & Vet',             1, GETDATE()),
                ('SHOP_TYPE', 'ONLINE',         N'🌐 บริการออนไลน์',               N'🌐 Online Service',        1, GETDATE()),
                -- อื่น ๆ
                ('SHOP_TYPE', 'OTHER',          N'✨ อื่น ๆ',                      N'✨ Other',                 1, GETDATE());
            END
        ");

            // --- 3. Mock Data ---
            var guids = new
            {
                Owner    = Guid.NewGuid(),
                Customer = Guid.NewGuid(),
                Staff    = Guid.NewGuid(),
                Admin    = Guid.NewGuid(),
                Shop     = Guid.NewGuid(),
                Service1 = Guid.NewGuid(),
                Service2 = Guid.NewGuid(),
                Service3 = Guid.NewGuid(),
                Service4 = Guid.NewGuid(),
                Booking1 = Guid.NewGuid(),
                Booking2 = Guid.NewGuid(),
                Booking3 = Guid.NewGuid(),
                Booking4 = Guid.NewGuid(),
                Queue1   = Guid.NewGuid(),
                Queue2   = Guid.NewGuid(),
                Payment1 = Guid.NewGuid(),
                Sub1     = Guid.NewGuid(),
                Sub2     = Guid.NewGuid(),
            };

            string sqlMock = $@"
                -- =====================================================
                -- ROLES
                -- =====================================================
                SET IDENTITY_INSERT Roles ON;
                IF NOT EXISTS (SELECT 1 FROM Roles WHERE Id = 1)
                BEGIN
                    INSERT INTO Roles (Id, Name, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, 'Admin',     1, GETDATE(), NULL),
                    (2, 'ShopOwner', 1, GETDATE(), NULL),
                    (3, 'Staff',     1, GETDATE(), NULL),
                    (4, 'Customer',  1, GETDATE(), NULL);
                END
                SET IDENTITY_INSERT Roles OFF;

                -- =====================================================
                -- ADDRESSES (3 ที่อยู่: สาขาหลัก + สาขา 2 + สาขา 3)
                -- =====================================================
                SET IDENTITY_INSERT Addresses ON;
                IF NOT EXISTS (SELECT 1 FROM Addresses WHERE Id = 1)
                BEGIN
                    INSERT INTO Addresses (Id, HouseNo, Street, ProvinceId, DistrictId, SubdistrictId, Zipcode, CreatedAt, CreatedBy) VALUES
                    (1, '99/9',  N'สุขุมวิท',   1, 1001, 100101, '10110', GETDATE(), NULL),
                    (2, '12/4',  N'สีลม',       1, 1002, 100201, '10500', GETDATE(), NULL),
                    (3, '55/1',  N'รัชดาภิเษก', 1, 1003, 100301, '10900', GETDATE(), NULL);
                END
                SET IDENTITY_INSERT Addresses OFF;

                -- =====================================================
                -- USERS (Admin=4, Owner=1, Staff=3, Customer=2,5, Inactive=6)
                -- =====================================================
                SET IDENTITY_INSERT Users ON;
                IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = 1)
                BEGIN
                    INSERT INTO Users (Id, Guid, Name, Phone, Email, StatusId, EmailConfirmed, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, '{guids.Owner}',    N'นาย ธีรพล สุขสมบัติ',    '0811111111', 'owner@demo.com',     (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),   1, 1, GETDATE(), NULL),
                    (2, '{guids.Customer}', N'นางสาว วรรณา ใจดี',       '0822222222', 'customer@demo.com',  (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),   1, 1, GETDATE(), NULL),
                    (3, '{guids.Staff}',    N'นาย สมชาย มีแรง',         '0833333333', 'staff@demo.com',     (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),   1, 1, GETDATE(), NULL),
                    (4, '{guids.Admin}',    N'System Admin',             '0000000000', 'admin@demo.com',     (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),   1, 1, GETDATE(), NULL),
                    (5, '{guids.Sub1}',     N'นาย ประเสริฐ ดีงาม',      '0844444444', 'customer2@demo.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'),   1, 1, GETDATE(), NULL),
                    (6, '{guids.Sub2}',     N'นางสาว มนัสนันท์ สวยงาม', '0855555555', 'customer3@demo.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='INACTIVE'), 0, 0, GETDATE(), NULL);
                END
                SET IDENTITY_INSERT Users OFF;

                -- =====================================================
                -- USER IMAGES
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM UserImages WHERE UserId = 1)
                BEGIN
                    INSERT INTO UserImages (UserId, FileUrl, FileName, ContentType, FileSize, IsPrimary, CreatedAt, CreatedBy) VALUES
                    (1, 'https://cdn.demo.com/users/1/avatar.jpg', 'avatar.jpg', 'image/jpeg', 102400, 1, GETDATE(), 1),
                    (2, 'https://cdn.demo.com/users/2/avatar.jpg', 'avatar.jpg', 'image/jpeg',  81920, 1, GETDATE(), 2),
                    (3, 'https://cdn.demo.com/users/3/avatar.jpg', 'avatar.jpg', 'image/jpeg',  65536, 1, GETDATE(), 3),
                    (4, 'https://cdn.demo.com/users/4/avatar.jpg', 'avatar.jpg', 'image/jpeg',  40960, 1, GETDATE(), 4);
                END

                -- =====================================================
                -- USER AUTHENTICATIONS
                -- =====================================================
                SET IDENTITY_INSERT UserAuthentications ON;
                IF NOT EXISTS (SELECT 1 FROM UserAuthentications WHERE Id = 1)
                BEGIN
                    INSERT INTO UserAuthentications (Id, UserId, Provider, ProviderId, PasswordHash, LastLoginAt) VALUES
                    (1, 4, 'Local',  'admin@demo.com',    'PBKDF2$sha256$200000$zZ2ILwM1/pS1lRHdsHtr5g==$5BxeuArlWToEcGLuoTr3XmsIKH3OCswTjOtyE/77Rhk=', GETDATE()),
                    (2, 1, 'Local',  'owner@demo.com',    'PBKDF2$sha256$200000$aB3CDwM1/pS2lRHdsItr5g==$6CyeuBrlXToFcHMuoUs4YntJLI4PDtwUkPuzF/88Sil=',  GETDATE()),
                    (3, 2, 'Google', 'google_uid_000002', NULL,                                                                                             GETDATE()),
                    (4, 3, 'Local',  'staff@demo.com',    'PBKDF2$sha256$200000$cD4EFxN2/qT3mSIetJus6h==$7DzfvCsmYUpGdINvoVt5ZouKMJ5QEuxVlQvgG/99Tjm=',  GETDATE()),
                    (5, 5, 'Line',   'line_uid_000005',   NULL,                                                                                             GETDATE());
                END
                SET IDENTITY_INSERT UserAuthentications OFF;

                -- =====================================================
                -- EMAIL CONFIRMATIONS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM EmailConfirmations WHERE UserId = 1)
                BEGIN
                    INSERT INTO EmailConfirmations (UserId, Token, TokenHash, ExpiredAt, IsUsed, ConfirmedAt, CreatedAt, CreatedBy) VALUES
                    (1, 'tok_owner_001',  'hash_owner_001',  DATEADD(day,  1, GETDATE()), 1, GETDATE(), GETDATE(), NULL),
                    (2, 'tok_cust_002',   'hash_cust_002',   DATEADD(day,  1, GETDATE()), 1, GETDATE(), GETDATE(), NULL),
                    (3, 'tok_staff_003',  'hash_staff_003',  DATEADD(day,  1, GETDATE()), 1, GETDATE(), GETDATE(), NULL),
                    (4, 'tok_admin_004',  'hash_admin_004',  DATEADD(day,  1, GETDATE()), 1, GETDATE(), GETDATE(), NULL),
                    (5, 'tok_cust2_005',  'hash_cust2_005',  DATEADD(day,  1, GETDATE()), 0, NULL,      GETDATE(), NULL),
                    (6, 'tok_cust3_006',  'hash_cust3_006',  DATEADD(day, -1, GETDATE()), 0, NULL,      GETDATE(), NULL); -- expired
                END

                -- =====================================================
                -- USER ROLE MAPS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM UserRoleMaps WHERE UserId = 1)
                BEGIN
                    INSERT INTO UserRoleMaps (UserId, RoleId, CreatedAt, CreatedBy) VALUES
                    (1, 2, GETDATE(), 4), -- Owner    → ShopOwner
                    (2, 4, GETDATE(), 4), -- Customer → Customer
                    (3, 3, GETDATE(), 4), -- Staff    → Staff
                    (4, 1, GETDATE(), 4), -- Admin    → Admin
                    (4, 2, GETDATE(), 4), -- Admin    → ShopOwner (multi-role)
                    (5, 4, GETDATE(), 4); -- Customer2→ Customer
                END

                -- =====================================================
                -- USER SESSIONS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM UserSessions WHERE UserId = 4)
                BEGIN
                    INSERT INTO UserSessions (Guid, UserId, Session, Token, RefreshToken, RefreshSalt, RefreshTokenExpiredAt, ExpiredAt, CreatedAt, CreatedBy) VALUES
                    (NEWID(), 4, 'sess_admin_001', 'jwt_access_token_admin_001', 'ref_admin_001', 'salt_admin_001', DATEADD(day, 30, GETDATE()), DATEADD(hour, 1, GETDATE()), GETDATE(), 4),
                    (NEWID(), 1, 'sess_owner_001', 'jwt_access_token_owner_001', 'ref_owner_001', 'salt_owner_001', DATEADD(day, 30, GETDATE()), DATEADD(hour, 1, GETDATE()), GETDATE(), 1),
                    (NEWID(), 2, 'sess_cust_001',  'jwt_access_token_cust_001',  'ref_cust_001',  'salt_cust_001',  DATEADD(day,  7, GETDATE()), DATEADD(hour, 1, GETDATE()), GETDATE(), 2);
                END

                -- =====================================================
                -- SHOP
                -- =====================================================
                SET IDENTITY_INSERT Shops ON;
                IF NOT EXISTS (SELECT 1 FROM Shops WHERE Id = 1)
                BEGIN
                    INSERT INTO Shops (Id, Guid, Name, OwnerId, StatusId, TypeId, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, '{guids.Shop}', N'คลินิกสุขภาพดี Demo', 1,
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='SHOP_STATUS' AND Code='ACTIVE'),
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='SHOP_TYPE'   AND Code='CLINIC'),
                        1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT Shops OFF;

                -- =====================================================
                -- SHOP BRANCHES (2 สาขา)
                --   Branch 1: สุขุมวิท (สาขาหลัก)
                --   Branch 2: สีลม
                -- =====================================================
                SET IDENTITY_INSERT ShopBranches ON;
                IF NOT EXISTS (SELECT 1 FROM ShopBranches WHERE Id = 1)
                BEGIN
                    INSERT INTO ShopBranches (Id, Guid, ShopId, Name, AddressId, Phone, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, NEWID(), 1, N'สาขาสุขุมวิท (สาขาหลัก)', 1, '021111111', 1, GETDATE(), 1),
                    (2, NEWID(), 1, N'สาขาสีลม',                 2, '022222222', 1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT ShopBranches OFF;

                -- =====================================================
                -- SHOP STAFFS
                -- ✅ BRANCH-BASED: Staff ผูกกับ Branch
                --   Staff 1 (Owner) อยู่สาขา 1
                --   Staff 2 (Staff) อยู่สาขา 1 และ สาขา 2 (2 rows)
                -- =====================================================
                SET IDENTITY_INSERT ShopStaffs ON;
                IF NOT EXISTS (SELECT 1 FROM ShopStaffs WHERE Id = 1)
                BEGIN
                    INSERT INTO ShopStaffs (Id, ShopId, BranchId, UserId, Role, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, 1, 1, 1, 'Owner', 1, GETDATE(), 1), -- Owner ประจำสาขา 1 (สุขุมวิท)
                    (2, 1, 1, 3, 'Staff', 1, GETDATE(), 1), -- Staff ประจำสาขา 1
                    (3, 1, 2, 3, 'Staff', 1, GETDATE(), 1); -- Staff คนเดิม ดูแลสาขา 2 ด้วย
                END
                SET IDENTITY_INSERT ShopStaffs OFF;

                -- =====================================================
                -- SHOP SETTINGS
                -- ✅ BRANCH-BASED: BranchId nullable
                --   NULL     = shop-level (ทุกสาขาใช้ร่วม)
                --   มีค่า   = branch-level override เฉพาะสาขานั้น
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM ShopSettings WHERE ShopId = 1)
                BEGIN
                    INSERT INTO ShopSettings (ShopId, BranchId, [Key], Value, CreatedAt, CreatedBy) VALUES
                    -- Shop-level settings (ใช้กับทุกสาขา)
                    (1, NULL, 'QUEUE_RESET_DAILY',     'true',       GETDATE(), 1),
                    (1, NULL, 'NOTIFY_BEFORE_MINUTES', '15',         GETDATE(), 1),
                    (1, NULL, 'CURRENCY',              'THB',        GETDATE(), 1),
                    -- Branch-level override: สาขา 1 รับคิวได้มากกว่า
                    (1, 1,    'MAX_QUEUE_PER_SLOT',    '50',         GETDATE(), 1),
                    (1, 1,    'ALLOW_WALK_IN',         'true',       GETDATE(), 1),
                    -- Branch-level override: สาขา 2 รับคิวน้อยกว่า ไม่รับ Walk-in
                    (1, 2,    'MAX_QUEUE_PER_SLOT',    '20',         GETDATE(), 1),
                    (1, 2,    'ALLOW_WALK_IN',         'false',      GETDATE(), 1);
                END

                -- =====================================================
                -- SHOP BUSINESS HOURS
                -- ✅ BRANCH-BASED: ไม่มี ShopId (ดึงผ่าน Branch)
                --   สาขา 1: จ-ศ 09:00-18:00, ส 10:00-16:00, อา 10:00-14:00
                --   สาขา 2: จ-ศ 09:00-18:00, ส 10:00-16:00 (หยุดวันอาทิตย์)
                --   DayOfWeek: 0=Sun, 1=Mon, ... 6=Sat
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM ShopBusinessHours WHERE BranchId = 1)
                BEGIN
                    INSERT INTO ShopBusinessHours (BranchId, DayOfWeek, OpenTime, CloseTime, IsActive, CreatedAt, CreatedBy) VALUES
                    -- สาขา 1 สุขุมวิท
                    (1, 1, '09:00', '18:00', 1, GETDATE(), 1),
                    (1, 2, '09:00', '18:00', 1, GETDATE(), 1),
                    (1, 3, '09:00', '18:00', 1, GETDATE(), 1),
                    (1, 4, '09:00', '18:00', 1, GETDATE(), 1),
                    (1, 5, '09:00', '18:00', 1, GETDATE(), 1),
                    (1, 6, '10:00', '16:00', 1, GETDATE(), 1),
                    (1, 0, '10:00', '14:00', 1, GETDATE(), 1),
                    -- สาขา 2 สีลม (หยุดวันอาทิตย์ = ไม่ insert DayOfWeek=0)
                    (2, 1, '09:00', '18:00', 1, GETDATE(), 1),
                    (2, 2, '09:00', '18:00', 1, GETDATE(), 1),
                    (2, 3, '09:00', '18:00', 1, GETDATE(), 1),
                    (2, 4, '09:00', '18:00', 1, GETDATE(), 1),
                    (2, 5, '09:00', '18:00', 1, GETDATE(), 1),
                    (2, 6, '10:00', '16:00', 1, GETDATE(), 1);
                END

                -- =====================================================
                -- SHOP HOLIDAYS
                -- ✅ BRANCH-BASED: แต่ละสาขาหยุดไม่เหมือนกันได้
                --   สาขา 1: หยุด 2 วัน (ปีใหม่ + สงกรานต์)
                --   สาขา 2: หยุด 1 วัน (ปีใหม่เท่านั้น)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM ShopHolidays WHERE ShopId = 1)
                BEGIN
                    INSERT INTO ShopHolidays (ShopId, BranchId, HolidayDate, Reason, CreatedAt, CreatedBy) VALUES
                    (1, 1, CAST(DATEADD(day,  7, GETDATE()) AS DATE), N'วันหยุดพิเศษ - ปีใหม่',   GETDATE(), 1),
                    (1, 1, CAST(DATEADD(day, 14, GETDATE()) AS DATE), N'วันหยุดพิเศษ - สงกรานต์', GETDATE(), 1),
                    (1, 2, CAST(DATEADD(day,  7, GETDATE()) AS DATE), N'วันหยุดพิเศษ - ปีใหม่',   GETDATE(), 1);
                END

                -- =====================================================
                -- QUEUE CATEGORIES
                -- ✅ BRANCH-BASED: Prefix unique ต่อ Branch
                --   สาขา 1: A=ทั่วไป, B=เร่งด่วน, P=VIP
                --   สาขา 2: A=ทั่วไป, U=เร่งด่วน (prefix ต่างกันได้)
                -- =====================================================
                SET IDENTITY_INSERT QueueCategories ON;
                IF NOT EXISTS (SELECT 1 FROM QueueCategories WHERE Id = 1)
                BEGIN
                    INSERT INTO QueueCategories (Id, ShopId, BranchId, Prefix, Name, Description, IsActive, CreatedAt, CreatedBy) VALUES
                    -- สาขา 1
                    (1, 1, 1, 'A', N'คิวทั่วไป',   N'คิวสำหรับผู้ป่วยทั่วไป',   1, GETDATE(), 1),
                    (2, 1, 1, 'B', N'คิวเร่งด่วน', N'คิวสำหรับเคสเร่งด่วน',     1, GETDATE(), 1),
                    (3, 1, 1, 'P', N'คิว VIP',      N'คิวสำหรับสมาชิก Premium',   1, GETDATE(), 1),
                    -- สาขา 2
                    (4, 1, 2, 'A', N'คิวทั่วไป',   N'คิวสำหรับผู้ป่วยทั่วไป',   1, GETDATE(), 1),
                    (5, 1, 2, 'U', N'คิวเร่งด่วน', N'คิวสำหรับเคสเร่งด่วน',     1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT QueueCategories OFF;

                -- =====================================================
                -- SERVICE CATEGORIES
                -- ✅ BRANCH-BASED: แต่ละสาขามีหมวดบริการของตัวเอง
                --   สาขา 1: ทั่วไป / เฉพาะทาง / พรีเมียม
                --   สาขา 2: ทั่วไป / เฉพาะทาง (ไม่มีพรีเมียม)
                -- =====================================================
                SET IDENTITY_INSERT ServiceCategories ON;
                IF NOT EXISTS (SELECT 1 FROM ServiceCategories WHERE Id = 1)
                BEGIN
                    INSERT INTO ServiceCategories (Id, ShopId, BranchId, Name, IsActive, CreatedAt, CreatedBy) VALUES
                    -- สาขา 1
                    (1, 1, 1, N'บริการทั่วไป',   1, GETDATE(), 1),
                    (2, 1, 1, N'บริการเฉพาะทาง', 1, GETDATE(), 1),
                    (3, 1, 1, N'บริการพรีเมียม',  1, GETDATE(), 1),
                    -- สาขา 2
                    (4, 1, 2, N'บริการทั่วไป',   1, GETDATE(), 1),
                    (5, 1, 2, N'บริการเฉพาะทาง', 1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT ServiceCategories OFF;

                -- =====================================================
                -- SERVICES
                -- ✅ BRANCH-BASED: บริการผูกกับ Branch
                --   สาขา 1: 3 บริการ (ตรวจทั่วไป / ตรวจเลือด / ปรึกษาเฉพาะทาง)
                --   สาขา 2: 2 บริการ (ตรวจทั่วไป / ตรวจเลือด — ราคาต่างกัน)
                -- =====================================================
                SET IDENTITY_INSERT Services ON;
                IF NOT EXISTS (SELECT 1 FROM Services WHERE Id = 1)
                BEGIN
                    INSERT INTO Services (Id, Guid, ShopId, BranchId, Name, Duration, Price, IsActive, CreatedAt, CreatedBy) VALUES
                    -- สาขา 1 สุขุมวิท
                    (1, '{guids.Service1}', 1, 1, N'ตรวจร่างกายทั่วไป',     30,    0.00, 1, GETDATE(), 1),
                    (2, '{guids.Service2}', 1, 1, N'ตรวจเลือด / Lab',       60,  500.00, 1, GETDATE(), 1),
                    (3, '{guids.Service3}', 1, 1, N'ปรึกษาแพทย์เฉพาะทาง',  45,  800.00, 1, GETDATE(), 1),
                    -- สาขา 2 สีลม (ราคาและระยะเวลาต่างกัน)
                    (4, '{guids.Service4}', 1, 2, N'ตรวจร่างกายทั่วไป',     30,    0.00, 1, GETDATE(), 1),
                    (5, NEWID(),            1, 2, N'ตรวจเลือด / Lab',       60,  450.00, 1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT Services OFF;

                -- =====================================================
                -- SERVICE CATEGORY MAPS
                -- (ServiceId ผูกกับ CategoryId ที่อยู่ Branch เดียวกัน)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM ServiceCategoryMaps WHERE ServiceId = 1)
                BEGIN
                    INSERT INTO ServiceCategoryMaps (ServiceId, CategoryId, CreatedAt, CreatedBy) VALUES
                    -- สาขา 1
                    (1, 1, GETDATE(), 1), -- ตรวจทั่วไป   → บริการทั่วไป (Branch 1)
                    (2, 2, GETDATE(), 1), -- ตรวจเลือด   → บริการเฉพาะทาง (Branch 1)
                    (3, 2, GETDATE(), 1), -- ปรึกษาแพทย์ → บริการเฉพาะทาง (Branch 1)
                    (3, 3, GETDATE(), 1), -- ปรึกษาแพทย์ → บริการพรีเมียม (Branch 1) multi-cat
                    -- สาขา 2
                    (4, 4, GETDATE(), 1), -- ตรวจทั่วไป  → บริการทั่วไป (Branch 2)
                    (5, 5, GETDATE(), 1); -- ตรวจเลือด   → บริการเฉพาะทาง (Branch 2)
                END

                -- =====================================================
                -- SERVICE STAFF MAPS
                -- (StaffId อ้างอิง ShopStaffs.Id ซึ่งผูกกับ Branch อยู่แล้ว)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM ServiceStaffMaps WHERE ServiceId = 1)
                BEGIN
                    INSERT INTO ServiceStaffMaps (ServiceId, StaffId, CreatedAt, CreatedBy) VALUES
                    -- Services ของ Branch 1 → Staff ของ Branch 1 (StaffId 1, 2)
                    (1, 1, GETDATE(), 1), -- ตรวจทั่วไป  (B1) → Owner (B1)
                    (1, 2, GETDATE(), 1), -- ตรวจทั่วไป  (B1) → Staff (B1)
                    (2, 2, GETDATE(), 1), -- ตรวจเลือด   (B1) → Staff (B1)
                    (3, 1, GETDATE(), 1), -- ปรึกษาแพทย์ (B1) → Owner (B1)
                    -- Services ของ Branch 2 → Staff ของ Branch 2 (StaffId 3)
                    (4, 3, GETDATE(), 1), -- ตรวจทั่วไป  (B2) → Staff (B2)
                    (5, 3, GETDATE(), 1); -- ตรวจเลือด   (B2) → Staff (B2)
                END

                -- =====================================================
                -- QUEUE SLOTS (วันนี้ + พรุ่งนี้, แยกตาม Branch)
                -- =====================================================
                SET IDENTITY_INSERT QueueSlots ON;
                IF NOT EXISTS (SELECT 1 FROM QueueSlots WHERE Id = 1)
                BEGIN
                    INSERT INTO QueueSlots (Id, Guid, ShopId, BranchId, Date, StartTime, EndTime, MaxQueue, CurrentUsage, IsActive, CreatedAt, CreatedBy) VALUES
                    -- Branch 1 วันนี้
                    (1, NEWID(), 1, 1, CAST(GETDATE() AS DATE),                '09:00', '12:00', 50, 2, 1, GETDATE(), 1),
                    (2, NEWID(), 1, 1, CAST(GETDATE() AS DATE),                '13:00', '18:00', 50, 0, 1, GETDATE(), 1),
                    -- Branch 2 วันนี้
                    (3, NEWID(), 1, 2, CAST(GETDATE() AS DATE),                '09:00', '12:00', 20, 1, 1, GETDATE(), 1),
                    (4, NEWID(), 1, 2, CAST(GETDATE() AS DATE),                '13:00', '18:00', 20, 0, 1, GETDATE(), 1),
                    -- Branch 1 พรุ่งนี้
                    (5, NEWID(), 1, 1, CAST(DATEADD(day, 1, GETDATE()) AS DATE), '09:00', '12:00', 50, 0, 1, GETDATE(), 1),
                    (6, NEWID(), 1, 1, CAST(DATEADD(day, 1, GETDATE()) AS DATE), '13:00', '18:00', 50, 0, 1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT QueueSlots OFF;

                -- =====================================================
                -- BOOKINGS
                -- ✅ BRANCH-BASED: ตัด ShopId ออก ดึงผ่าน Branch ได้
                --   Booking 1,2,4: Branch 1 สุขุมวิท
                --   Booking 3:     Branch 2 สีลม
                -- =====================================================
                SET IDENTITY_INSERT Bookings ON;
                IF NOT EXISTS (SELECT 1 FROM Bookings WHERE Id = 1)
                BEGIN
                    INSERT INTO Bookings (Id, Guid, UserId, BranchId, QueueSlotId, QueueCategoryId, QueueNumber, Remark, StatusId, CreatedAt, CreatedBy) VALUES
                    (1, '{guids.Booking1}', 2, 1, 1, 1, 1, N'ขอนัดคุณหมอด้านอายุรกรรม',
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='CONFIRMED'), GETDATE(), 2),
                    (2, '{guids.Booking2}', 5, 1, 1, 1, 2, NULL,
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='WAITING'), GETDATE(), 5),
                    (3, '{guids.Booking3}', 2, 2, 3, 4, 1, N'เร่งด่วน - ปวดท้องรุนแรง',
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='DONE'), DATEADD(day, -1, GETDATE()), 2),
                    (4, '{guids.Booking4}', 5, 1, 2, 1, 3, NULL,
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='CANCELLED'), GETDATE(), 5);
                END
                SET IDENTITY_INSERT Bookings OFF;

                -- =====================================================
                -- BOOKING SERVICES
                -- (ServiceId ต้องอยู่ Branch เดียวกับ Booking.BranchId)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM BookingServices WHERE BookingId = 1)
                BEGIN
                    INSERT INTO BookingServices (BookingId, ServiceId, CreatedAt, CreatedBy) VALUES
                    (1, 1, GETDATE(), 2), -- Booking 1 (B1) → ตรวจทั่วไป  (B1:Svc1)
                    (1, 3, GETDATE(), 2), -- Booking 1 (B1) → ปรึกษาแพทย์ (B1:Svc3) multi-service
                    (2, 1, GETDATE(), 5), -- Booking 2 (B1) → ตรวจทั่วไป  (B1:Svc1)
                    (3, 5, GETDATE(), 2), -- Booking 3 (B2) → ตรวจเลือด   (B2:Svc5)
                    (4, 1, GETDATE(), 5); -- Booking 4 (B1) → ตรวจทั่วไป  (B1:Svc1)
                END

                -- =====================================================
                -- QUEUES (Walk-in)
                -- ✅ BRANCH-BASED: ตัด ShopId ออก ดึงผ่าน Branch ได้
                -- =====================================================
                SET IDENTITY_INSERT Queues ON;
                IF NOT EXISTS (SELECT 1 FROM Queues WHERE Id = 1)
                BEGIN
                    INSERT INTO Queues (Id, Guid, BranchId, QueueNumber, StatusId, Type, CreatedAt, CreatedBy) VALUES
                    (1, NEWID(), 1, 1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='SERVING'),  'WALK_IN', GETDATE(), NULL),
                    (2, NEWID(), 1, 2, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='WAITING'),  'BOOKING', GETDATE(), 2),
                    (3, NEWID(), 2, 1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='DONE'),     'WALK_IN', DATEADD(hour, -2, GETDATE()), NULL),
                    (4, NEWID(), 1, 3, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='WAITING'),  'BOOKING', GETDATE(), 5);
                END
                SET IDENTITY_INSERT Queues OFF;

                -- =====================================================
                -- QUEUE LOGS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM QueueLogs WHERE QueueId = 1)
                BEGIN
                    INSERT INTO QueueLogs (QueueId, StatusId, Timestamp, CreatedBy) VALUES
                    (1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='WAITING'), DATEADD(minute, -30, GETDATE()), NULL),
                    (1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='SERVING'), DATEADD(minute,  -5, GETDATE()), 3),
                    (2, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='WAITING'), GETDATE(), 2),
                    (3, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='WAITING'), DATEADD(hour, -3, GETDATE()), NULL),
                    (3, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='SERVING'), DATEADD(hour, -2, GETDATE()), 3),
                    (3, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='QUEUE_STATUS' AND Code='DONE'),    DATEADD(hour, -1, GETDATE()), 3);
                END

                -- =====================================================
                -- CUSTOMERS (ผูกระดับ Shop — ลูกค้าคนเดียวใช้ได้ทุกสาขา)
                -- =====================================================
                SET IDENTITY_INSERT Customers ON;
                IF NOT EXISTS (SELECT 1 FROM Customers WHERE Id = 1)
                BEGIN
                    INSERT INTO Customers (Id, Guid, ShopId, UserId, Name, Phone, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, NEWID(), 1, 2, N'นางสาว วรรณา ใจดี',  '0822222222', 1, GETDATE(), 1),
                    (2, NEWID(), 1, 5, N'นาย ประเสริฐ ดีงาม', '0844444444', 1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT Customers OFF;

                -- =====================================================
                -- CUSTOMER NOTES
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM CustomerNotes WHERE CustomerId = 1)
                BEGIN
                    INSERT INTO CustomerNotes (CustomerId, Note, CreatedAt, CreatedBy) VALUES
                    (1, N'แพ้ยาเพนิซิลิน - ห้ามจ่ายยากลุ่มนี้',        GETDATE(), 1),
                    (1, N'ผู้ป่วยโรคเบาหวาน ต้องตรวจน้ำตาลทุกครั้ง',   GETDATE(), 3),
                    (2, N'ลูกค้า VIP - ให้บริการก่อน',                   GETDATE(), 1);
                END

                -- =====================================================
                -- CUSTOMER TAGS
                -- =====================================================
                SET IDENTITY_INSERT CustomerTags ON;
                IF NOT EXISTS (SELECT 1 FROM CustomerTags WHERE Id = 1)
                BEGIN
                    INSERT INTO CustomerTags (Id, Name, IsActive, CreatedAt, CreatedBy) VALUES
                    (1, N'VIP',         1, GETDATE(), 1),
                    (2, N'แพ้ยา',       1, GETDATE(), 1),
                    (3, N'โรคเรื้อรัง', 1, GETDATE(), 1),
                    (4, N'ผู้สูงอายุ',  1, GETDATE(), 1),
                    (5, N'เด็ก',        1, GETDATE(), 1);
                END
                SET IDENTITY_INSERT CustomerTags OFF;

                -- =====================================================
                -- CUSTOMER TAG MAPS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM CustomerTagMaps WHERE CustomerId = 1)
                BEGIN
                    INSERT INTO CustomerTagMaps (CustomerId, TagId, CreatedAt, CreatedBy) VALUES
                    (1, 2, GETDATE(), 1), -- วรรณา    → แพ้ยา
                    (1, 3, GETDATE(), 1), -- วรรณา    → โรคเรื้อรัง
                    (2, 1, GETDATE(), 1); -- ประเสริฐ → VIP
                END

                -- =====================================================
                -- PAYMENTS (สำหรับ Booking 3 ที่ DONE)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM Payments WHERE BookingId = 3)
                BEGIN
                    INSERT INTO Payments (Guid, BookingId, Amount, Method, StatusId, CreatedAt, CreatedBy) VALUES
                    (NEWID(), 3, 450.00, 'QR_CODE',
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='PAYMENT_STATUS' AND Code='PAID'), GETDATE(), 3);
                END

                -- =====================================================
                -- PAYMENT TRANSACTIONS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM PaymentTransactions WHERE Provider = 'PromptPay')
                BEGIN
                    INSERT INTO PaymentTransactions (PaymentId, Provider, TransactionRef, CreatedAt, CreatedBy)
                    SELECT TOP 1 Id, 'PromptPay', 'PP' + CAST(ABS(CHECKSUM(NEWID())) % 900000000 + 100000000 AS VARCHAR), GETDATE(), 3
                    FROM Payments WHERE BookingId = 3;
                END

                -- =====================================================
                -- NOTIFICATIONS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM Notifications WHERE UserId = 2)
                BEGIN
                    INSERT INTO Notifications (Guid, UserId, Type, Title, Message, StatusId, CreatedAt, CreatedBy) VALUES
                    (NEWID(), 2, 'BOOKING', N'ยืนยันการจอง',
                        N'การจองคิวหมายเลข A001 ของคุณได้รับการยืนยันแล้ว วันที่ ' + CONVERT(NVARCHAR, CAST(GETDATE() AS DATE), 107),
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='NOTIFICATION_STATUS' AND Code='READ'),   GETDATE(), NULL),
                    (NEWID(), 2, 'QUEUE',   N'ใกล้ถึงคิวของคุณแล้ว',
                        N'คุณเป็นคิวที่ 2 อีกประมาณ 15 นาที กรุณาเตรียมตัว',
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='NOTIFICATION_STATUS' AND Code='UNREAD'), GETDATE(), NULL),
                    (NEWID(), 5, 'BOOKING', N'การจองถูกยกเลิก',
                        N'การจองคิวหมายเลข A003 ของคุณถูกยกเลิกแล้ว',
                        (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='NOTIFICATION_STATUS' AND Code='UNREAD'), GETDATE(), NULL);
                END

                -- =====================================================
                -- NOTIFICATION LOGS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM NotificationLogs WHERE NotificationId IN (SELECT Id FROM Notifications WHERE UserId = 2))
                BEGIN
                    INSERT INTO NotificationLogs (NotificationId, StatusId, SentAt, CreatedBy)
                    SELECT n.Id,
                           (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='NOTIFICATION_STATUS' AND Code='READ'),
                           GETDATE(), NULL
                    FROM Notifications n WHERE n.UserId = 2 AND n.Type = 'BOOKING';
                END

                -- =====================================================
                -- SUBSCRIPTIONS (SaaS Plan — ผูกระดับ Shop)
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM Subscriptions WHERE ShopId = 1)
                BEGIN
                    INSERT INTO Subscriptions (Guid, ShopId, PlanName, Price, StartDate, EndDate, IsActive, CreatedAt, CreatedBy) VALUES
                    (NEWID(), 1, 'Professional', 999.00, DATEADD(month, -1, GETDATE()), DATEADD(month, 11, GETDATE()), 1, GETDATE(), 4);
                END

                -- =====================================================
                -- INVOICES
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM Invoices WHERE ShopId = 1)
                BEGIN
                    INSERT INTO Invoices (Guid, ShopId, Amount, StatusId, CreatedAt, CreatedBy) VALUES
                    (NEWID(), 1, 999.00, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='INVOICE_STATUS' AND Code='PAID'),    DATEADD(month, -1, GETDATE()), 4),
                    (NEWID(), 1, 999.00, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='INVOICE_STATUS' AND Code='PENDING'), GETDATE(), 4);
                END

                -- =====================================================
                -- SYSTEM CONFIGS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM SystemConfigs WHERE [Key] = 'APP_VERSION')
                BEGIN
                    INSERT INTO SystemConfigs ([Key], Value, CreatedAt, CreatedBy) VALUES
                    ('APP_VERSION',         '1.0.0',        GETDATE(), 4),
                    ('MAINTENANCE_MODE',    'false',         GETDATE(), 4),
                    ('MAX_BOOKING_DAYS',    '30',            GETDATE(), 4),
                    ('DEFAULT_TIMEZONE',    'Asia/Bangkok',  GETDATE(), 4),
                    ('SMTP_FROM',           'noreply@demo.com', GETDATE(), 4);
                END

                -- =====================================================
                -- AUDIT LOGS
                -- =====================================================
                IF NOT EXISTS (SELECT 1 FROM AuditLogs WHERE TableName = 'Users')
                BEGIN
                    INSERT INTO AuditLogs (TableName, RecordId, Action, OldValue, NewValue, CreatedAt, CreatedBy) VALUES
                    ('Users',    '1', 'INSERT', NULL,                                N'{{""Name"":""ธีรพล สุขสมบัติ""}}', GETDATE(), 4),
                    ('Bookings', '3', 'UPDATE', N'{{""StatusId"":""WAITING""}}',     N'{{""StatusId"":""DONE""}}',         GETDATE(), 3),
                    ('Bookings', '4', 'UPDATE', N'{{""StatusId"":""WAITING""}}',     N'{{""StatusId"":""CANCELLED""}}',    GETDATE(), 5);
                END

                -- =====================================================
                -- เปิด Constraint ทั้งหมดและตรวจสอบความถูกต้อง
                -- =====================================================
                EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
            ";

            migrationBuilder.Sql(sqlMock);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

                DELETE FROM AuditLogs;
                DELETE FROM SystemConfigs;
                DELETE FROM Invoices;
                DELETE FROM Subscriptions;
                DELETE FROM NotificationLogs;
                DELETE FROM Notifications;
                DELETE FROM PaymentTransactions;
                DELETE FROM Payments;
                DELETE FROM CustomerTagMaps;
                DELETE FROM CustomerTags;
                DELETE FROM CustomerNotes;
                DELETE FROM Customers;
                DELETE FROM QueueLogs;
                DELETE FROM Queues;
                DELETE FROM BookingServices;
                DELETE FROM Bookings;
                DELETE FROM QueueSlots;
                DELETE FROM ServiceStaffMaps;
                DELETE FROM ServiceCategoryMaps;
                DELETE FROM Services;
                DELETE FROM QueueCategories;
                DELETE FROM ServiceCategories;
                DELETE FROM ShopHolidays;
                DELETE FROM ShopBusinessHours;
                DELETE FROM ShopSettings;
                DELETE FROM ShopStaffs;
                DELETE FROM ShopBranches;
                DELETE FROM Shops;
                DELETE FROM UserSessions;
                DELETE FROM UserAuthentications;
                DELETE FROM UserImages;
                DELETE FROM EmailConfirmations;
                DELETE FROM UserRoleMaps;
                DELETE FROM Users;
                DELETE FROM Roles;
                DELETE FROM Addresses;
                DELETE FROM Subdistricts;
                DELETE FROM Districts;
                DELETE FROM Provinces;
                DELETE FROM MasterStatuses;

                EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
            ");
        }
    }
}