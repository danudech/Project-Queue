# Platform Admin DB & Backend Integration

วันที่: 26 ตุลาคม 2026

## วัตถุประสงค์
เชื่อมโยงส่วน Platform Admin เข้ากับฐานข้อมูลจริง (SQL Server / EF Core) ผ่าน ASP.NET Core Web API Backend ตามคำสั่งของผู้ใช้ "ดึงข้อมูลจาก DB ได้เลย ผ่าน backend"

## โครงสร้างที่สร้างและปรับปรุง

### 1. Application Layer
- [`Application/DTO/Response/AdminResponse.cs`](file:///D:/Project/Project-Queue/Application/DTO/Response/AdminResponse.cs): DTOs สำหรับ Overview, Shops, Users, Operations, Audit Logs, Settings และ Service Health
- [`Application/DTO/Request/AdminRequest.cs`](file:///D:/Project/Project-Queue/Application/DTO/Request/AdminRequest.cs): DTOs ขาเข้าสำหรับสร้างร้านค้า, สร้างผู้ใช้, อัปเดตสถานะ, และบันทึกค่าระบบ
- [`Application/Interfaces/IPlatformAdminService.cs`](file:///D:/Project/Project-Queue/Application/Interfaces/IPlatformAdminService.cs): กำหนด Contract สำหรับดึงข้อมูลและจัดการ Entity ระดับแพลตฟอร์ม

### 2. Infrastructure Layer
- [`Infrastructure/Services/PlatformAdminService.cs`](file:///D:/Project/Project-Queue/Infrastructure/Services/PlatformAdminService.cs):
  - ดึงยอดสรุปจาก SQL Server: Active Shops, Platform Users, Queues Today, Bookings Today
  - วัด Latency ของฐานข้อมูลจริงผ่าน `db.Database.CanConnectAsync()`
  - CRUD ข้อมูลร้านค้า (`Shops`), สาขา (`ShopBranches`), และผู้ใช้ (`Users`)
  - บันทึกการเปลี่ยนแปลงทุกขั้นตอนลงตาราง `AuditLogs`
  - จัดการข้อมูลการตั้งค่าระบบผ่านตาราง `SystemConfigs`

### 3. API Layer
- [`Api/Controllers/Admin.Controllers.cs`](file:///D:/Project/Project-Queue/Api/Controllers/Admin.Controllers.cs):
  - Endpoints ใต้ `/api/v1/admin/...` สำหรับ `overview`, `shops`, `users`, `operations`, `audit-log`, `settings`
  - ตรวจสอบสิทธิ์ผ่าน `X-Admin-Key` และ JWT token
- ลงทะเบียน Service ใน [`Api/Program.cs`](file:///D:/Project/Project-Queue/Api/Program.cs): `builder.Services.AddScoped<IPlatformAdminService, PlatformAdminService>();`

### 4. Frontend BFF & Client Integration
- [`Frontend/src/app/api/admin/data/route.ts`](file:///D:/Project/Project-Queue/Frontend/src/app/api/admin/data/route.ts): Route handler สำหรับ Proxy ข้อมูลระหว่าง Next.js Client และ .NET Backend
- [`Frontend/src/app/[locale]/(admin)/admin/page.tsx`](file:///D:/Project/Project-Queue/Frontend/src/app/[locale]/(admin)/admin/page.tsx): ดึงข้อมูล Overview, ยอดคิว, รายชื่อร้านค้า, ไทม์ไลน์ Audit, และสถานะการเชื่อมต่อฐานข้อมูลจริง
- [`Frontend/src/components/admin/admin-module-page.tsx`](file:///D:/Project/Project-Queue/Frontend/src/components/admin/admin-module-page.tsx): ดึงข้อมูลตาราง, สร้างร้านค้า, สร้างผู้ใช้, แก้ไขสถานะ, และ Export ข้อมูลจากฐานข้อมูลจริง

## ผลการทดสอบ
- Backend Build (`dotnet build Queue.slnx`): ผ่าน 0 warnings, 0 errors
- Backend Tests (`dotnet test Tests/Queue.Tests.csproj`): ผ่าน 17/17 tests
- Frontend TypeScript (`npx tsc --noEmit`): ผ่าน 0 errors
- Frontend ESLint (`npx eslint src/components/admin`): ผ่าน 0 errors, 0 warnings
