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
        // แก้ไข Property Name ให้ตรงกับ Key ในไฟล์ JSON (id, name_th, name_en)
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
            public object zip_code { get; set; } // ใช้ object เพราะบางครั้ง JSON อาจส่งมาเป็นตัวเลขหรือ String
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
            var subPath = GetFilePath("sub_districts.json");

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
                // ถ้าหาไฟล์ไม่เจอ ให้ Migration ระเบิดออกมาเลย จะได้รู้ว่า Path ผิด
                throw new Exception($"SeedData Failed: File not found at {provPath}");
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
                        var zip = s.zip_code?.ToString()?.Trim() ?? "";
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
                    INSERT INTO MasterStatuses (Type, Code, NameTh, NameEn, IsActive) VALUES
                    ('USER_STATUS', 'ACTIVE', N'ใช้งาน', 'Active', 1),
                    ('USER_STATUS', 'INACTIVE', N'ไม่ใช้งาน', 'Inactive', 1),
                    ('SHOP_STATUS', 'ACTIVE', N'เปิดใช้งาน', 'Active', 1),
                    ('SHOP_STATUS', 'INACTIVE', N'ปิดใช้งาน', 'Inactive', 1),
                    ('BOOKING_STATUS','WAITING', N'รอคิว', 'Waiting', 1),
                    ('BOOKING_STATUS','CONFIRMED', N'ยืนยันแล้ว', 'Confirmed', 1),
                    ('BOOKING_STATUS','CANCELLED', N'ยกเลิก', 'Cancelled', 1),
                    ('BOOKING_STATUS','DONE', N'เสร็จสิ้น', 'Done', 1),
                    ('QUEUE_STATUS', 'WAITING', N'รอ', 'Waiting', 1),
                    ('QUEUE_STATUS', 'SERVING', N'กำลังให้บริการ', 'Serving', 1),
                    ('QUEUE_STATUS', 'DONE', N'เสร็จแล้ว', 'Done', 1),
                    ('QUEUE_STATUS', 'CANCELLED', N'ยกเลิก', 'Cancelled', 1),
                    ('PAYMENT_STATUS','PENDING', N'รอดำเนินการ', 'Pending', 1),
                    ('PAYMENT_STATUS','PAID', N'ชำระแล้ว', 'Paid', 1),
                    ('PAYMENT_STATUS','FAILED', N'ล้มเหลว', 'Failed', 1),
                    ('NOTIFICATION_STATUS','UNREAD', N'ยังไม่อ่าน', 'Unread', 1),
                    ('NOTIFICATION_STATUS','READ', N'อ่านแล้ว', 'Read', 1),
                    ('INVOICE_STATUS','PENDING', N'รอชำระ', 'Pending', 1),
                    ('INVOICE_STATUS','PAID', N'ชำระแล้ว', 'Paid', 1),
                    ('INVOICE_STATUS','CANCELLED', N'ยกเลิก', 'Cancelled', 1),

                     -- ─── สุขภาพ & ความงาม ───────────────────────────────────
                    ('SHOP_TYPE', 'CLINIC',       N'🏥 คลินิก / สถานพยาบาล',      N'🏥 Clinic',               1),
                    ('SHOP_TYPE', 'HOSPITAL',     N'🏨 โรงพยาบาล',                N'🏨 Hospital',             1),
                    ('SHOP_TYPE', 'DENTAL',       N'🦷 คลินิกทันตกรรม',           N'🦷 Dental Clinic',        1),
                    ('SHOP_TYPE', 'PHARMACY',     N'💊 ร้านขายยา',                N'💊 Pharmacy',             1),
                    ('SHOP_TYPE', 'SPA',          N'💆 สปา / นวดแผนไทย',          N'💆 Spa & Massage',        1),
                    ('SHOP_TYPE', 'SALON',        N'✂️ ร้านเสริมสวย / ตัดผม',     N'✂️ Beauty Salon',         1),
                    ('SHOP_TYPE', 'NAIL',         N'💅 ร้านทำเล็บ',               N'💅 Nail Studio',          1),
                    ('SHOP_TYPE', 'FITNESS',      N'💪 ฟิตเนส / โยคะ',            N'💪 Fitness & Yoga',       1),

                    -- ─── อาหาร & เครื่องดื่ม ────────────────────────────────
                    ('SHOP_TYPE', 'RESTAURANT',   N'🍴 ร้านอาหาร',                N'🍴 Restaurant',           1),
                    ('SHOP_TYPE', 'CAFE',         N'☕ คาเฟ่ / เครื่องดื่ม',      N'☕ Café',                 1),
                    ('SHOP_TYPE', 'BAKERY',       N'🥐 เบเกอรี่',                 N'🥐 Bakery',               1),

                    -- ─── ยานยนต์ ─────────────────────────────────────────────
                    ('SHOP_TYPE', 'CAR_SERVICE',  N'🚗 ศูนย์บริการรถยนต์',        N'🚗 Car Service',          1),
                    ('SHOP_TYPE', 'MOTORCYCLE',   N'🏍️ ร้านซ่อมมอเตอร์ไซค์',      N'🏍️ Motorcycle Repair',    1),
                    ('SHOP_TYPE', 'CAR_WASH',      N'🧼 ร้านล้างรถ',               N'🧼 Car Wash',             1),

                    -- ─── การเงิน & ราชการ ────────────────────────────────────
                    ('SHOP_TYPE', 'BANK',         N'💰 ธนาคาร / การเงิน',         N'💰 Bank',                 1),
                    ('SHOP_TYPE', 'GOVERNMENT',   N'🏛️ หน่วยงานราชการ',           N'🏛️ Government',           1),
                    ('SHOP_TYPE', 'HOSPITAL_GOV', N'🏥 โรงพยาบาลรัฐ',             N'🏥 Public Hospital',      1),
                    ('SHOP_TYPE', 'INSURANCE',    N'🛡️ ประกันภัย',                N'🛡️ Insurance',            1),

                    -- ─── การศึกษา & บริการส่วนตัว ────────────────────────────
                    ('SHOP_TYPE', 'TUTOR',        N'📚 ติวเตอร์ / สอนพิเศษ',      N'📚 Tutoring',             1),
                    ('SHOP_TYPE', 'STUDIO',       N'📸 สตูดิโอ / ถ่ายภาพ',        N'📸 Studio',               1),
                    ('SHOP_TYPE', 'LAWYER',       N'⚖️ ทนายความ / กฎหมาย',        N'⚖️ Legal Service',         1),
                    ('SHOP_TYPE', 'FREELANCE',    N'💻 ฟรีแลนซ์ / บริการส่วนตัว', N'💻 Freelance',            1),
                    ('SHOP_TYPE', 'CONSULTANT',   N'🤝 ที่ปรึกษา',                N'🤝 Consultant',           1),
                    ('SHOP_TYPE', 'PET',          N'🐾 ร้านสัตว์เลี้ยง / สัตวแพทย์', N'🐾 Pet & Vet',            1),
                    ('SHOP_TYPE', 'ONLINE',       N'🌐 บริการออนไลน์',            N'🌐 Online Service',       1),

                    -- ─── อื่น ๆ ──────────────────────────────────────────────
                    ('SHOP_TYPE', 'OTHER',        N'✨ อื่น ๆ',                   N'✨ Other',                1);

                END

                ");
            // --- 3. Mock Data ---
            var guids = new
            {
                Owner = Guid.NewGuid(),
                Customer = Guid.NewGuid(),
                Staff = Guid.NewGuid(),
                Admin = Guid.NewGuid(),
                Shop = Guid.NewGuid(),
                Service = Guid.NewGuid(),
                Booking = Guid.NewGuid()
            };

            string sqlMock = $@"
                SET IDENTITY_INSERT Roles ON;
                IF NOT EXISTS (SELECT 1 FROM Roles WHERE Id = 1)
                INSERT INTO Roles (Id, Name) VALUES (1, 'Admin'), (2, 'ShopOwner'), (3, 'Staff'), (4, 'Customer');
                SET IDENTITY_INSERT Roles OFF;

                SET IDENTITY_INSERT Addresses ON;
                IF NOT EXISTS (SELECT 1 FROM Addresses WHERE Id = 1)
                INSERT INTO Addresses (Id, HouseNo, Street, ProvinceId, DistrictId, SubdistrictId, Zipcode)
                VALUES (1, '99/9', N'สุขุมวิท', 1, 1001, 100101, '10200'); 
                SET IDENTITY_INSERT Addresses OFF;

                SET IDENTITY_INSERT Users ON;
                INSERT INTO Users (Id, Guid, Name, Phone, Email, StatusId, EmailConfirmed, CreatedAt)
                VALUES 
                (1, '{guids.Owner}', N'Shop Owner', '0811111111', 'owner@test.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),
                (2, '{guids.Customer}', N'Customer', '0822222222', 'customer@test.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),
                (3, '{guids.Staff}', N'Staff', '0833333333', 'staff@test.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE()),
                (4, '{guids.Admin}', N'Admin', '0000000000', 'admin@test.com', (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='USER_STATUS' AND Code='ACTIVE'), 1, GETDATE());
                SET IDENTITY_INSERT Users OFF;

                INSERT INTO EmailConfirmations (UserId, Token, TokenHash, ExpiredAt, IsUsed, ConfirmedAt, CreatedAt)
                VALUES (1, 't1', 'h1', DATEADD(day,1,GETDATE()), 1, GETDATE(), GETDATE());

                SET IDENTITY_INSERT UserAuthentications ON;
                INSERT INTO UserAuthentications (Id, UserId, Provider, ProviderId, PasswordHash)
                VALUES (1, 4, 'Local', 'admin@test.com', 'PBKDF2$sha256$200000$zZ2ILwM1/pS1lRHdsHtr5g==$5BxeuArlWToEcGLuoTr3XmsIKH3OCswTjOtyE/77Rhk=');
                SET IDENTITY_INSERT UserAuthentications OFF;

                INSERT INTO UserRoleMaps (UserId, RoleId, CreatedAt) VALUES (1, 2, GETDATE()), (2, 4, GETDATE()), (3, 3, GETDATE()), (4, 1, GETDATE());

                SET IDENTITY_INSERT Shops ON;
                INSERT INTO Shops (Id, Guid, Name, OwnerId, StatusId, TypeId)
                VALUES (1, '{guids.Shop}', N'Demo Shop', 1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='SHOP_STATUS' AND Code='ACTIVE'), (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='SHOP_TYPE' AND Code='CLINIC'));
                SET IDENTITY_INSERT Shops OFF;

                SET IDENTITY_INSERT ShopBranches ON;
                INSERT INTO ShopBranches (Id, Guid, ShopId, Name, AddressId, Phone) VALUES (1, NEWID(), 1, N'สาขาหลัก', 1, '020000000');
                SET IDENTITY_INSERT ShopBranches OFF;

                SET IDENTITY_INSERT ShopStaffs ON;
                INSERT INTO ShopStaffs (Id, ShopId, UserId, Role) VALUES (1, 1, 1, 'Owner'), (2, 1, 3, 'Staff');
                SET IDENTITY_INSERT ShopStaffs OFF;

                SET IDENTITY_INSERT Services ON;
                INSERT INTO Services (Id, Guid, ShopId, Name, Duration, Price, IsActive) VALUES (1, '{guids.Service}', 1, N'บริการทั่วไป', 30, 0.00, 1);
                SET IDENTITY_INSERT Services OFF;

                SET IDENTITY_INSERT QueueCategories ON;
                INSERT INTO QueueCategories (Id, ShopId, Prefix, Name) VALUES (1, 1, 'A', N'คิวทั่วไป');
                SET IDENTITY_INSERT QueueCategories OFF;

                SET IDENTITY_INSERT QueueSlots ON;
                INSERT INTO QueueSlots (Id, Guid, ShopId, BranchId, Date, StartTime, EndTime, MaxQueue, CurrentUsage) VALUES (1, NEWID(), 1, 1, CAST(GETDATE() AS DATE), '09:00', '18:00', 50, 0);
                SET IDENTITY_INSERT QueueSlots OFF;

                SET IDENTITY_INSERT Bookings ON;
                INSERT INTO Bookings (Id, Guid, UserId, ShopId, BranchId, QueueSlotId, QueueCategoryId, QueueNumber, StatusId, CreatedAt)
                VALUES (1, '{guids.Booking}', 2, 1, 1, 1, 1, 1, (SELECT TOP 1 Id FROM MasterStatuses WHERE Type='BOOKING_STATUS' AND Code='WAITING'), GETDATE());
                SET IDENTITY_INSERT Bookings OFF;

                SET IDENTITY_INSERT Customers ON;
                INSERT INTO Customers (Id, Guid, ShopId, UserId, Name, Phone) VALUES (1, NEWID(), 1, 2, N'Customer', '0822222222');
                SET IDENTITY_INSERT Customers OFF;

                -- 4. เปิด Constraint ทั้งหมดและตรวจสอบความถูกต้องตอนท้ายสุด
                EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
            ";

            migrationBuilder.Sql(sqlMock);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
                DELETE FROM ServiceStaffMaps; DELETE FROM Bookings; DELETE FROM QueueSlots; 
                DELETE FROM QueueCategories; DELETE FROM Customers; DELETE FROM Services; 
                DELETE FROM ShopStaffs; DELETE FROM ShopBranches; DELETE FROM Shops; 
                DELETE FROM UserRoleMaps; DELETE FROM EmailConfirmations; DELETE FROM UserAuthentications; 
                DELETE FROM Users; DELETE FROM Roles; DELETE FROM Addresses; 
                DELETE FROM Subdistricts; DELETE FROM Districts; DELETE FROM Provinces; 
                DELETE FROM MasterStatuses;
                EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
            ");
        }
    }
}