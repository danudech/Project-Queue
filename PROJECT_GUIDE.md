# คู่มือภาพรวมโปรเจกต์ EZQueue

เอกสารนี้เป็นแผนที่โค้ดจาก repository ณ วันที่ 26 ตุลาคม 2026 จัดทำโดยสำรวจ source และอ่าน entry point, controller, interface, repository, entity/schema, migration, route handler, หน้า route, config และ tests ตามขอบเขตที่อธิบายด้านล่าง ใช้ช่วยเริ่มงานและตามเส้นทางข้อมูล ไม่ได้แทน API contract หรือการตรวจระบบที่กำลังรันจริง

## ภาพรวม

EZQueue เป็นระบบจัดการร้านบริการที่รองรับหลายร้าน/สาขา การตั้งค่าบริการและพนักงาน การจอง การจัดคิว และ dashboard สำหรับผู้ดูแลร้าน มีส่วนติดต่อผู้ใช้สำหรับลูกค้าเพื่อดูร้าน/จอง/ติดตามรายการ และมีแชตระหว่างลูกค้ากับร้าน

| ส่วน | เทคโนโลยี | หน้าที่ |
|---|---|---|
| API | ASP.NET Core, .NET 10 | HTTP API, authentication/authorization, business endpoints |
| Application | C#, FluentValidation | DTO, interface ของ use case/service และ validation |
| Domain | C# | Entity ของระบบ |
| Infrastructure | EF Core 10, SQL Server | DbContext, migrations, repository, email, JWT, permission และ persistence |
| Frontend | Next.js 15 App Router, React 19, TypeScript | หน้าเว็บ, localized routing, BFF routes และ client API |
| Tests | xUnit v3, EF Core InMemory | ตรวจ business rules บางส่วนของ booking และ tenant boundary |

โซลูชันหลักอยู่ที่ `Queue.slnx` ประกอบด้วยโปรเจกต์ `Api`, `Application`, `Domain`, `Infrastructure` และ `Tests` ส่วน Frontend เป็น workspace แยกในโฟลเดอร์ `Frontend`

## โครงสร้าง repository

```text
Api/                 ASP.NET Core startup, controllers, middleware, seed JSON
Application/         DTO, interfaces, validators
Domain/              entity classes
Infrastructure/      EF Core, migrations, repositories, identity, services
Tests/               automated tests
Frontend/            Next.js app, API routes, components, config, messages, assets
README.md             quick start และแนวทาง deploy ระดับต้น
ANTIGRAVITY_HANDOFF.md  บันทึกงาน frontend/RBAC ต่อเนื่องและงานค้าง
PROJECT_GUIDE.md      เอกสารภาพรวมฉบับนี้
```

### Backend projects

- `Api/Program.cs` เป็น composition root: โหลด environment ด้วย DotNetEnv, ลงทะเบียน controllers, CORS, rate limiter, JWT bearer, Swagger, Serilog, SQL Server `QueueDbContext` และ dependency injection
- `Application/Interfaces/` กำหนดสัญญาของ Users, Authentication, Shop, Customer, Operations, PublicBooking, Chat, Notifications, Address, RoleManagement และ ActionLog
- `Application/DTO/Request` และ `Application/DTO/Response` เป็นรูปแบบข้อมูลขาเข้า/ขาออกของ API การเปลี่ยน DTO ที่เปิดใช้งานแล้วอาจกระทบ Frontend
- `Domain/Entities/` มี entity สำหรับบัญชี ร้าน/สาขา พนักงาน บริการ การจอง คิว สิทธิ์ ลูกค้า แชต การชำระเงิน/ใบแจ้งหนี้ และข้อมูลระบบ
- `Infrastructure/Persistence/Repositories/` มี implementation ของ interface เช่น `Operations`, `PublicBooking`, `ManageShop`, `Authentication`, `Users`, `ChatService` และ `RoleManagement`
- `Infrastructure/Persistence/DbContext/QueueDbContext.cs` กำหนด DbSet, ความสัมพันธ์, index, default values และข้อจำกัดฐานข้อมูล
- `Infrastructure/Identity/` สร้าง/ตรวจ JWT แบบ signed และ encrypted, เข้ารหัส/แฮชที่เกี่ยวข้องกับ authentication
- `Infrastructure/Services/` จัดการ claims, token/session, สิทธิ์ตามขอบเขต, account-to-shop invariant, เวลา, CRUD และ logging

### แผนที่ use case ใน backend

| Use case | Controller/API | Interface → implementation | จุดที่ควรอ่านประกอบ |
|---|---|---|---|
| เข้าสู่ระบบ/refresh/profile | `AuthorizeController`, `UserController`, `RegisterController` | `IAuthentication` → `Authentication`; `IUsers` → `Users` | `AccessToken`, `RefreshToken`, `RoleClaimsService`, `ApiResponse<T>` |
| ร้านและสาขา | `ShopController`, `ManageShopController` | `IManageShop` → `ManageShop` | `AccountShopGuard`, `PermissionScopeService`, shop/branch entities |
| business hours/holidays/queue rules | `ManageShopController` | `IManageShop` → `ManageShop` | `DateTimeService`, `ShopSetting`, `ShopBusinessHour`, `ShopHoliday` |
| หมวดและบริการ | `ShopCategoryController`, `ShopServiceController` | `IManageShop` → `ManageShop` | `ServiceCategoryMap`, `ServiceStaffMap`, รูปบริการ |
| booking, slot, queue และ staff | `OperationsController` | `IOperations` → `Operations` | `BookingService`, `QueueSlot`, `QueueLog`, `MasterStatus`, transaction/slot rules |
| public booking | `PublicBookingController` | `IPublicBooking` → `PublicBooking` | `Operations` สำหรับ slot/create; management token และ serializable transaction |
| ลูกค้า | `CustomerController` | `IManageCustomer` → `ManageCustomer` | `CustomerNote`, `CustomerTag`, `CustomerTagMap` |
| role และ permission | `RoleController` | `IRoleManagement` → `RoleManagement` | `RequirePermissionAttribute`, `RoleClaimsService`, `PermissionScopeService` |
| แชต | `ChatController`, `PublicChatController` | `IChatService` → `ChatService` | token ของ public conversation, `ChatConversation`, `ChatMessage` |
| notifications | `NotificationController` | `INotificationService` → `NotificationService` | notification status/log |
| address lookup | `AddressController` | `IAddress` → `AddressRepository` | seed JSON จังหวัด/อำเภอ/ตำบล |

`Operations` และ `ManageShop` เป็น repository ขนาดใหญ่ที่รวม use case หลายรายการไว้ใน class เดียว จึงควรค้นชื่อ method ก่อนอ่าน section ที่เกี่ยวข้อง ไม่ควรสมมติว่า interface หนึ่งตัวเท่ากับ repository หนึ่งไฟล์ในทุกกรณี

### API controllers

API หลักใช้ prefix `/api/v1` ยกเว้น Health ที่ route จาก `[controller]` เป็น `/api/health`

| Controller | ขอบเขต |
|---|---|
| `Authorize.Controller.cs` | login, session/token, profile/authentication endpoints |
| `User/Register.Controlers.cs`, `User/User.Controllers.cs` | ลงทะเบียน, ยืนยันอีเมล, รหัสผ่าน, profile, บัญชีผู้ใช้ |
| `Shop/Shop.Controllers.cs`, `ManageShop.Controllers.cs` | ร้าน/สาขา, business hours, holidays, queue rules |
| `Shop/Shop.Category.Controllers.cs`, `Shop.Service.Controllers.cs` | หมวดบริการ, บริการ, รูปบริการ |
| `Operations.Controllers.cs` | พนักงาน/คำเชิญ/รูป, catalog, slots, bookings, queues |
| `PublicBooking.Controllers.cs` | public catalog/slots/booking และจัดการ/ยกเลิกการจองด้วย token |
| `Customer/Customer.Controllers.cs` | ข้อมูลลูกค้าและกลุ่มข้อมูลลูกค้าที่มี API รองรับ |
| `Role.Controllers.cs` | catalog สิทธิ์, role ร้าน และการ assign role |
| `Chat.Controllers.cs` | แชตของร้านที่ล็อกอินและ public chat |
| `Notification.Controllers.cs` | อ่าน/ทำเครื่องหมายอ่าน notifications |
| `Address.Controllers.cs` | ค้นข้อมูลที่อยู่ตามรหัสไปรษณีย์ |
| `Health.Controller.cs` | ตรวจสถานะการเชื่อมต่อฐานข้อมูล (ต้องยืนยันตัวตนตาม source ปัจจุบัน) |

Controller ส่วนใหญ่คืนรูปแบบ `ApiResponse<T>` และแปลง exception ที่คาดหมายเป็น HTTP status 400/403/404 ส่วน exception ที่ไม่คาดหมายในบาง controller คืน 500 พร้อมข้อความทั่วไป บาง controller มีการจัดการ error เฉพาะของตน

## Frontend

Frontend ใช้ Next.js App Router ใต้ `Frontend/src/app`:

- `src/app/[locale]/(user)/(user)/(dashboard)` ในทางปฏิบัติคือกลุ่ม route ที่อยู่ภายใต้ `[locale]/(user)/(dashboard)` สำหรับ dashboard ที่ต้องล็อกอิน
- `src/app/[locale]/(customer)` เป็นหน้าลูกค้า เช่น ร้าน, จองบริการ, รายการจองของฉัน, สถานะคิว และหน้าจัดการการจอง
- `src/app/[locale]/(user)/auth` มี login/register/forgot/reset password และหน้าตรวจสอบอีเมล
- `src/app/(homepage)` เป็น landing page
- `src/app/api/**/route.ts` เป็น Next.js Route Handlers ทำหน้าที่ BFF/proxy ไปยัง API; ตัวอย่างเช่นจัดการ auth cookie, forward cookie/Authorization และซ่อน token จาก browser JavaScript
- `src/components/` ประกอบด้วย layout, UI primitives, dashboard, auth, chat และ permission gate
- `src/hooks/`, `src/services/`, `src/store/`, `src/lib/` เก็บ data access, React hooks, state และ utility
- `src/config/endpoints.ts` จับคู่ชื่อ endpoint ภายในกับ URL `/api/v1/...`; `src/lib/http/centralize.ts` รวม request, parse response และ refresh token
- `src/messages/en.json` และ `src/messages/th.json` เป็นข้อความสองภาษา; `next-intl` ตั้ง default locale เป็นอังกฤษและรองรับไทย
- Tailwind CSS ใช้ธีมใน `tailwind.config.ts`/`theme.config.tsx`; icon, component และ form library อยู่ใน dependency ของ package

ณ source ที่ตรวจพบมี 37 dashboard pages, 6 customer pages, 6 auth pages และ 1 homepage page รวม 50 `page.tsx` ใน App Router; มี Next API route handlers 41 ไฟล์ และ source/config/message/style/definition ภายใต้ `src` ราว 350 ไฟล์ (จำนวนอาจเปลี่ยนเมื่อเพิ่มไฟล์)

### หน้าหลักตามกลุ่ม

- **Marketing:** `src/app/(homepage)` — landing, feature, service, workflow และ content sections
- **Authentication:** `src/app/[locale]/(user)/auth` — login, register, forgot/reset password, mail confirmation/verification
- **Customer:** `src/app/[locale]/(customer)` — public shop, public booking, booking management, recent/my booking และ queue status
- **Dashboard จริง:** dashboard summary, booking list/slots, live queue/history, service/category, customer list, staff, role, shop/branch, business hours, holiday, notification, chat, profile/security
- **Dashboard mock:** analytics, invoice, payment, subscription, system/audit/master status, queue category, customer tags, setting index และ account index ใช้ `MockDashboardPage` บาง route ที่ยังไม่พร้อมถูก access gate กันไว้

### โครง frontend ที่แบ่งตามหน้าที่

- `components/ui` เป็นชุด primitive ที่สร้างบน Radix และใช้ Tailwind; `components/layout`, `components/partials` ประกอบ dashboard shell, navigation, header/sidebar/footer และ auth UI
- `components/providers` และ `providers` ตั้ง React Query, store synchronization, theme, direction, layout และ route loading
- `hooks` มี data hooks สำหรับ profile/shop, booking, chat, queue, permission และ UI hooks
- `services` มี service wrappers เช่น shop/queue; `store` เก็บ atom/store สำหรับ user, shop, queue
- `types` จัด request/response type ตาม auth, shop, booking, queue, customer และ address; `config` รวม env, endpoints, menu, route และ permission mapping
- `messages` ใช้ภาษาอังกฤษ/ไทย แยก namespace ของหน้าและ widget; `scripts/i18n-audit.mjs` เป็นตัวตรวจ message catalogs
- `public` เก็บภาพ brand, homepage, avatar, icon และภาพตัวอย่าง UI; ไม่ใช่ code path ของ business logic

Middleware ตรวจ locale และ cookie สำหรับ route dashboard ที่ป้องกันไว้ ส่วน access token, refresh token, session key และเวลาหมดอายุถูกจัดเก็บเป็น HttpOnly cookies โดย Next.js auth handlers

## โดเมนและข้อมูลหลัก

Entity ที่มีใน Domain และ `QueueDbContext` แบ่งได้เป็นกลุ่มดังนี้:

- **บัญชีและความปลอดภัย:** `User`, `UserAuthentication`, `UserSession`, `UserRoleMap`, `EmailConfirmation`, `UserImage`, `Role`
- **ร้าน/สาขาและการเข้าถึง:** `Shop`, `ShopBranch`, `ShopSetting`, `ShopBusinessHour`, `ShopHoliday`, `ShopStaff`, `ShopRole`, `ShopRolePermission`, `ShopUserRoleMap`, `BranchUserRoleMap`
- **บริการและคิว:** `Service`, `ServiceCategory`, `ServiceCategoryMap`, `ServiceStaffMap`, `Queue`, `QueueCategory`, `QueueSlot`, `QueueLog`, `Booking`, `BookingService`
- **ลูกค้า:** `Customer`, `CustomerNote`, `CustomerTag`, `CustomerTagMap`, `Address`
- **สื่อสารและแจ้งเตือน:** `ChatConversation`, `ChatMessage`, `Notification`, `NotificationLog`
- **การเงิน/สถานะ/ตรวจสอบ:** `Payment`, `PaymentTransaction`, `Invoice`, `Subscription`, `MasterStatus`, `AuditLog`, `SystemConfig`
- **ที่อยู่ไทย:** `Province`, `District`, `Subdistrict`

การจองเชื่อมกับสาขา, slot, สถานะ, ผู้จอง และบริการผ่าน `BookingService`; staff-to-service ใช้ `ServiceStaffMap` การสร้าง slot พิจารณาเวลาทำการ ช่วงเวลาต่อ slot ความจุ buffer ระหว่างบริการ และพนักงานที่ผ่าน eligibility ตาม implementation ใน `Operations`

## การยืนยันตัวตนและสิทธิ์

1. Login ผ่าน Next route handler ซึ่งเรียก API ด้วย `serverHttp` แล้วบันทึก access/refresh/session เป็น HttpOnly cookies
2. Access JWT มี claim `uid`, username, role, name และ permissions; token ถูกเซ็นและเข้ารหัสตาม `AccessToken`
3. Frontend HTTP client เมื่อพบ 401 จะเรียก Next refresh route แล้วลองคำขอเดิมซ้ำหนึ่งครั้ง หาก refresh ไม่สำเร็จจะ sign out
4. API ใช้ `[Authorize]` และ `RequirePermissionAttribute` สำหรับการอนุญาตระดับ endpoint
5. `RoleClaimsService` รวม permission จาก role map ระดับ shop/branch และ permission override ของ shop; `PermissionScopeService` ตรวจซ้ำว่า resource อยู่ใน `Users.HomeShopId` และสิทธิ์ครอบคลุม shop หรือ branch นั้น
6. `AccountShopGuard` บังคับ invariant ว่าบัญชีหนึ่งผูกกับร้านเดียว แม้ทำงานได้หลายสาขาภายในร้านเดียวกัน
7. Owner ของร้านได้รับสิทธิ์ตามการตรวจ owner; การสร้างร้านครั้งแรกและการผูกบัญชีมี logic เฉพาะใน `ManageShop`

ฝั่ง frontend `useProfile` อ่าน permission จาก API, `usePermissions` ใช้ helper ใน `src/lib/permissions.ts`, `DashboardAccessGate` คุม route ระดับหน้า และ component บางหน้าปิดปุ่ม mutation ตามสิทธิ์ด้วย การคุมหน้าเป็นเพียง UX gate; backend ยังคงต้องตรวจ resource scope

การซ่อนเมนูหรือปุ่มใน frontend ไม่ใช่ขอบเขตความปลอดภัยหลัก ต้องคง permission และ tenant checks ฝั่ง API/repository ด้วย

## การจองสาธารณะและคิว

หน้า public booking ระบุร้านด้วย `shopSlug` และสาขาด้วย `branchPublicId` (GUID) รองรับอ่าน catalog/slots และสร้างการจองโดยไม่ต้องล็อกอิน Controller จำกัดอัตราตาม IP ที่ 90 read ต่อนาที และ 8 write ต่อนาที การดู/ยกเลิกการจองใช้ booking GUID พร้อม management token

Operations ที่ล็อกอินจัดการ staff, invitation, catalog, slots, bookings และ queues โดยมี permission เช่น `staff.view`, `staff.edit`, `staff.invite`, `staff.remove`, `booking.manage`, `queue.view`, `queue.manage` และยังตรวจสิทธิ์ตามสาขาที่ repository

ใน source `PublicBooking.CreateAsync` ครอบการจองด้วย transaction ระดับ `Serializable`; การสร้าง/อัปเดต booking และ queue ใน `Operations` ก็มี transaction ในบาง flow เพื่อกันชน slot/capacity พร้อมตรวจ interval, duration, buffer ของบริการและ eligibility ของ staff รายละเอียดกติกาเปลี่ยนได้ จึงควรดู method และ tests ปัจจุบันก่อนแก้

## ฐานข้อมูลและ migrations

EF Core ใช้ SQL Server connection string ชื่อ `Default` ใน config `QueueDbContext` มี snapshot และ migrations:

- `20260803033902_InitialFullSchema.cs` — baseline schema เต็มและ seed ข้อมูลที่เกี่ยวข้องกับฐานข้อมูล
- `20260807120000_AddServiceImages.cs` — เพิ่ม `Services.ImageUrl` และจัดหมวดบริการเริ่มต้นให้ข้อมูลเดิมที่เข้าเงื่อนไข
- `20260807170000_AddChatTables.cs` — เพิ่ม `ChatConversations` และ `ChatMessages`

API มีไฟล์ seed จังหวัด/อำเภอ/ตำบลใน `Api/SeedData/` และ csproj ตั้งให้คัดลอกไป output/publish การ apply migration ต้องเก็บ seed files ไว้ตามที่ README ระบุ README มีคำสั่ง EF Core สำหรับอัปเดตฐานข้อมูล

**ควรตรวจสอบก่อน deploy:** `ANTIGRAVITY_HANDOFF.md` บันทึก migration เพิ่มเติมที่เคยสร้าง/ใช้ในฐานข้อมูลพัฒนา แต่ migration เหล่านั้นไม่อยู่ในรายการไฟล์ปัจจุบันที่ตรวจพบใน `Infrastructure/Migrations` จึงควรยืนยันประวัติ migration และ schema ของ environment เป้าหมายก่อน deploy

## การตั้งค่าและรันในเครื่อง

### API

ตั้งค่าจาก `Api/.env.example` ผ่าน environment variables หรือ user secrets (ห้าม commit secret):

- `ConnectionStrings__Default` — SQL Server
- `Jwt__SignKey`, `Jwt__EncKey`, `Jwt__Issuer`, `Jwt__Audience` — JWT signing/encryption และ metadata
- `AllowAnyOrigin__Origins__0` — origin ของ frontend ที่อนุญาต
- `EmailSettings__Username`, `EmailSettings__Password` — SMTP credentials

จาก root:

```powershell
dotnet restore Queue.slnx
dotnet run --project Api/Queue.Api.csproj
```

ใน development Swagger ถูกเปิดโดย `Program.cs` เมื่อ `ASPNETCORE_ENVIRONMENT=Development` API ต้องมี config ที่จำเป็นตั้งแต่เริ่มต้น; `Program.cs` จะ throw หาก JWT หรือ CORS origins ขาด

### Database

ตัวอย่างคำสั่งจาก README:

```powershell
dotnet ef database update --project Infrastructure/Queue.Infrastructure.csproj --startup-project Api/Queue.Api.csproj
```

### Frontend

ตั้งค่า `Frontend/.env.local` จาก `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` — URL API ที่ server-side route handlers เรียก
- `NEXT_PUBLIC_APP_BASE_URL` — URL เว็บที่ client ใช้เรียก Next API routes
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SITE_URL` — metadata/site base

ใช้ pnpm ตาม `Frontend/package.json` และ README:

```powershell
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install
pnpm dev
```

รันคำสั่งจาก `Frontend` สำหรับ production:

```powershell
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

### Build และ test

```powershell
dotnet build Queue.slnx
dotnet test Tests/Queue.Tests.csproj --configuration Release
```

คำสั่ง frontend ที่บันทึกใน handoff:

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src
pnpm run build
```

หมายเหตุ: `Frontend/next.config.mjs` ตั้ง `ignoreDuringBuilds` และ `ignoreBuildErrors` เป็น `true` ดังนั้น build สำเร็จเพียงอย่างเดียวไม่ได้ยืนยันว่า ESLint/TypeScript ผ่าน ต้องสั่งตรวจแยกเมื่อจำเป็น

การตรวจ source ในรอบจัดทำคู่มือนี้พบ tests สองไฟล์ (`AccountShopGuardTests`, `OperationsBookingRuleTests`) ครอบคลุม account/shop boundary และกฎการสร้าง slot/booking เป็นหลัก ไม่พบ test suite frontend ใน repository ณ ตอนสำรวจ

## สถานะหน้าจอและขอบเขตที่ยังไม่สมบูรณ์

จาก source ปัจจุบันพบหน้าที่ใช้ `MockDashboardPage` และข้อมูลตัวอย่าง ได้แก่ analytics, invoice, payment, subscription, system overview/master-status/audit-log, queue category, customer tags, setting index และ account overview ส่วนบาง route ที่เกี่ยวข้องกับ notification/account index มีการระบุใน handoff ว่าถูก dashboard access gate ปิดจนกว่าจะมี API จริง

Frontend มี API สำหรับ notification, customer, role, shop, business hours, holiday, queues/slots และ chat แต่การมี API route หรือ entity ไม่ได้แปลว่าหน้าทุกหน้าทำงานครบ ให้ตรวจหน้า, controller, service และ permission สำหรับ use case ที่จะเปลี่ยนทุกครั้ง

จุด mismatch ที่ควรระวัง: `Frontend/src/app/[locale]/(user)/(dashboard)/setting/shop/page.tsx` ยังมี TODO ระบุให้เชื่อม actual update API; ดังนั้นอย่าสรุปจากการมี `update-shop` API ว่าฟอร์มหน้า shop ต่อ API แล้วโดยอัตโนมัติ

ข้อควรระวังจาก config ปัจจุบัน:

- `Frontend/package.json` มี script `lint` เป็น `next lint`; เวอร์ชัน Next 15 อาจต้องตรวจคำสั่ง lint ที่รองรับใน environment ก่อนใช้งาน คำสั่งใน handoff ใช้ `pnpm exec eslint src`
- `Frontend/next.config.mjs` ข้าม type/lint ระหว่าง build ตามที่กล่าวข้างต้น
- `Api/Controllers/Health.Controller.cs` กำหนด `[Authorize]`; health endpoint จึงไม่ใช่ public probe ในสภาพปัจจุบัน
- `Frontend/src/config/endpoints.ts` มีทั้ง internal Next routes และ external API paths; ใช้ `serverHttp` สำหรับ external API จาก server และ `http` สำหรับ internal route จาก client
- หลีกเลี่ยงเชื่อถือค่าที่มาจาก client เช่น branch/shop ID โดยไม่ตรวจ permission/resource ownership ซ้ำฝั่ง backend

## Package status และแผนอัปเกรด

วันที่ตรวจสอบ latest stable จาก package registry/documentation ภายนอกคือ 26 ตุลาคม 2026 รุ่น “latest” เป็นข้อมูลเปลี่ยนเร็ว ตัวเลขด้านล่างสะท้อนผลที่ค้นได้ในวันดังกล่าว ไม่ใช่การรับประกันสำหรับวันถัดไป

### สถานะที่ติดตั้ง เทียบกับ manifest และ latest ที่ตรวจพบ

| Package | `package.json` | ติดตั้งใน `node_modules` | latest stable ที่ตรวจพบ | แนวทาง |
|---|---:|---:|---:|---|
| Next.js | `^15.0.0` | 15.5.28 | 16.4.3 | major upgrade ต้อง migrate `middleware` → `proxy`, async request APIs/params/searchParams ให้ครบ และตรวจ plugins |
| React / React DOM | `^19.0.0` | 19.3.1 | 19.3.1 | manifest range กว้างถึง 19.x แต่ pnpm lockfile ยัง pin 19.2.4 |
| `eslint-config-next` | `^15.0.0` | 15.5.28 | 16.4.x | อัปเดตพร้อม Next; config/rules เปลี่ยนตาม major |
| `next-intl` | `^4.9.0` | 4.14.9 | 4.14.9 | manifest ตรึง range เก่ากว่า installed/latest |
| `@tanstack/react-query` | `^5.99.2` | 5.104.5 | 5.104.5 | lockfile ยัง pin 5.99.2; package directory มีรุ่นใหม่แล้ว |
| `lucide-react` | `^1.7.0` | 1.61.0 | 1.61.0 | manifest/lockfile pin เก่า แม้ node_modules มีรุ่นใหม่ |
| `react-hook-form` | `^7.72.1` | 7.91.0 | 7.91.0 | lockfile pin 7.72.1; latest อยู่สาย 7.x |
| `@hookform/resolvers` | `^5.2.2` | 5.9.2 | 5.9.2 | lockfile pin 5.2.2 |
| `zod` | `^4.3.6` | 4.6.7 | 4.6.7 | lockfile pin 4.3.6 |
| `date-fns` | `^4.1.0` | 4.4.0 | 4.4.0 | lockfile pin 4.1.0 |
| TypeScript | `^5.5.4` | 5.9.3 | 7.0.2 | major 7 ต้องตรวจ ecosystem/plugin compatibility; คงสาย 5.x ระหว่าง app migration |
| Tailwind CSS | `^3.4.10` | 3.4.19 | 4.3.3 | major 4 เปลี่ยน PostCSS/config/theme; ต้องย้าย config/CSS และทดสอบ UI |
| ESLint | `^9.0.0` | 9.39.5 | 10.13.0 | major 10 ต้องยืนยัน compatibility ของ Next config และ plugins |
| EF Core family | `10.0.2` | assets เดิมไม่ครบทุก project | 10.0.13 stable | patch update ภายในสาย .NET 10; อัปเดต family พร้อมกัน |
| ASP.NET Core OpenAPI/JWT bearer | `10.0.0` / `10.0.2` | — | 10.0.13 | patch update ภายในสาย .NET 10 |
| `Microsoft.Extensions.Configuration.*` | `10.0.0` / `10.0.2` | — | 10.0.13 | patch update ให้เป็นชุดเดียวกัน |
| FluentValidation | `11.5.1` | — | 12.2.0 | major 12 มี upgrade guide; compile และ behavior ต้องตรวจ |
| MimeKit / MailKit | `4.16.0` | — | 4.18.2 | อัปเดตเป็นคู่; MailKit 4.18.2 ใช้ MimeKit 4.18.2 |
| BCrypt.Net-Next | `4.0.3` | — | 4.2.0 | 4.1 เพิ่ม target net10; ควรอัปเดตและตรวจผล hash/verify ด้วย tests |
| Microsoft.OpenApi | `2.11.0` | — | 2.13.0 (สาย 2.x) | source ใช้ API แบบ 2.x; ไม่ขยับเป็น 3.x โดยไม่แก้ Swagger integration |
| Microsoft.NET.Test.Sdk | `18.0.1` | — | 18.11.0 | อัปเดต tooling ของ tests |
| xunit.v3 / runner | `3.2.2` / `3.1.5` | — | 4.0.2 / 4.0.1 | major 4; ตรวจ migration guide และ test discovery ก่อนเปลี่ยน |
| `Serilog.AspNetCore`, `Serilog.Sinks.File` | `10.0.0`, `7.0.0` | — | stable ล่าสุดที่ค้นพบยังเป็น 10.0.0, 7.0.0 | ไม่พบ stable ใหม่กว่า; มีเฉพาะ prerelease/dev ของ sink |
| `DotNetEnv` | `3.2.0` | — | 3.2.0 | ล่าสุดตาม NuGet ที่ตรวจ |

แหล่ง latest ที่ตรวจ: [Next.js npm](https://www.npmjs.com/package/next), [React npm](https://www.npmjs.com/package/react), [React Hook Form npm](https://www.npmjs.com/package/react-hook-form), [TanStack Query npm](https://www.npmjs.com/package/@tanstack/react-query), [Lucide React npm](https://www.npmjs.com/package/lucide-react), [Zod npm](https://www.npmjs.com/package/zod), [TypeScript npm](https://www.npmjs.com/package/typescript), [Tailwind CSS npm](https://www.npmjs.com/package/tailwindcss), [ESLint npm](https://www.npmjs.com/package/eslint), [Microsoft EF Core NuGet](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore), [Microsoft .NET Test SDK NuGet](https://www.nuget.org/packages/Microsoft.NET.Test.Sdk), [xUnit v3 NuGet](https://www.nuget.org/packages/xunit.v3), [FluentValidation NuGet](https://www.nuget.org/packages/FluentValidation), [MimeKit NuGet](https://www.nuget.org/packages/MimeKit), [BCrypt.Net-Next NuGet](https://www.nuget.org/packages/BCrypt.Net-Next)

### ผลการลองอัปเดต package

ยังไม่ได้แก้ `package.json`, `pnpm-lock.yaml` หรือ `.csproj` เนื่องจาก sandbox ไม่สามารถเชื่อม `registry.npmjs.org` และ `api.nuget.org` ได้ การลอง `pnpm outdated` ล้มด้วย `unable to open database file`; Corepack แจ้ง `ENOTFOUND registry.npmjs.org`; `dotnet add package` แจ้ง `NU1301` ว่าโหลด NuGet service index ไม่ได้ การเปลี่ยนเลข version ด้วยมือโดยไม่ได้ regenerate lock/restore จะทำให้ manifests และ dependency graph ไม่ตรงกัน

ควรจัดลำดับอัปเดตเป็น (1) .NET servicing/security fixes โดยเฉพาะ `System.Security.Cryptography.Pkcs` 10.0.0 ที่ assets เดิม flag ไว้—Microsoft ระบุ patched version เป็น 10.0.13—(2) npm dependencies ที่ manifest/lockfile ตามหลังรุ่นซึ่งมีอยู่แล้วใน `node_modules`, (3) minor/patch updates อื่นทั้งหมด และ (4) major migrations Next 16, TypeScript 7, ESLint 10, Tailwind 4, FluentValidation 12 และ xUnit 4 แยกพร้อมแก้/ตรวจ source

นอกจากนี้มี `Frontend/package-lock.json` ที่ untracked อยู่ใน worktree ทั้งที่ repository ใช้ `pnpm-lock.yaml` และเป็นไฟล์ที่มีอยู่ก่อนเริ่มงานนี้ จึงไม่ได้เขียนทับหรือลบทิ้ง

ขั้นตอน refresh เมื่อ runner มี registry access:

1. ใช้ `pnpm update -r --latest` เพื่ออัปเดต pnpm lockfile แล้วตรวจ `pnpm outdated -r`; แยก major migrations ออกจาก patch/minor updates
2. สำหรับ Next major ใช้ codemod/คู่มือ Next 16 ทางการ ตั้ง `next`, `react`, `react-dom`, `eslint-config-next` รุ่นที่เข้ากัน และไล่ตรวจ async `cookies/headers/params/searchParams`, `middleware.ts` และ image config
3. คง Tailwind 3 จนกว่าจะทำ migration v4 สำหรับ PostCSS, `tailwind.config.ts`, CSS/theme plugins และ visual checks ครบ
4. อัปเดต NuGet แล้ว `dotnet restore`, `dotnet build`, `dotnet test`; ให้ EF Core packages อยู่ patch เดียวกันและตรวจ migration output
5. ตรวจ advisories/transitive graph และรัน typecheck/ESLint แยก เพราะ Next config ปัจจุบันข้ามสองอย่างนี้ระหว่าง build

ผล `dotnet build --no-restore` ที่ลองระหว่างสำรวจไม่สำเร็จเพราะ assets บางโปรเจกต์ไม่มี (`NETSDK1004` สำหรับ Tests); assets ของ API ยังแสดง advisories ต่อ `System.Security.Cryptography.Pkcs 10.0.0` แต่ restore ออนไลน์เพื่อแก้ dependency graph ทำไม่ได้ใน environment นี้

## Seed, logs และไฟล์ที่ไม่ควร commit

- Log API เขียนด้วย Serilog ไป `Logs/system/api-*.log` และ `Logs/action/actionlogs-*.log`
- `.gitignore` ยกเว้นไฟล์ environment ตัวอย่าง แต่ละเว้น secret env, .NET `bin/obj`, `node_modules`, `.next`, build output, logs, test output และไฟล์ชั่วคราว
- `README.md` ระบุ production seed ไม่ควรสร้างข้อมูล demo โดย default และให้ตั้ง `EZQUEUE_SEED_DEMO_DATA=true` เฉพาะฐานข้อมูลพัฒนาว่างที่ต้องการ sample; ตรวจ implementation/config ที่ตรงกับ revision ก่อนใช้ flag นี้ เพราะค่า default และ wiring อาจเปลี่ยนไปตาม branch

## จุดเริ่มอ่านโค้ดตามงาน

| ต้องการแก้ | เริ่มจาก |
|---|---|
| เพิ่ม/แก้ API endpoint | controller → Application interface/DTO → Infrastructure repository → `QueueDbContext`/entity → Next route/client/types |
| แก้ booking/slot/queue rules | `Operations.Controllers.cs` → `IOperations` → `Infrastructure/.../Operations.cs` → entities/status/settings → tests |
| แก้ public booking | `PublicBooking.Controllers.cs` → `IPublicBooking` → `PublicBooking.cs` → `Operations.cs` สำหรับ slot/create logic → Frontend customer page และ public API routes |
| แก้ role/permission | `RequirePermissionAttribute` → `RoleClaimsService`/`PermissionScopeService` → `RoleManagement` → `Role.Controllers.cs` → `Frontend/src/lib/permissions.ts` |
| แก้ login/session | auth controller → `Authentication`/`RefreshToken`/`AccessToken` → Frontend `app/api/auth/**` และ `lib/http/**` |
| แก้ร้าน/บริการ/สาขา | shop controllers → `IManageShop` → `ManageShop.cs` → entity/config/migration → corresponding dashboard settings pages |
| แก้ localization/layout | `src/messages/{en,th}.json`, `src/i18n`, `[locale]` layouts และ `src/components/layout` |

## เอกสารอ้างอิงใน repository

- `README.md` — ภาพรวม, production deployment, migration และ secret handling
- `ANTIGRAVITY_HANDOFF.md` — กติกา UI ที่ใช้ต่อเนื่อง, รายการงานที่ทำ/ค้าง และบันทึก migration/RBAC จาก handoff ก่อนหน้า ข้อความในไฟล์นี้เป็นประวัติการทำงาน ไม่รับประกันว่า source หรือ migrations ปัจจุบันตรงกันทั้งหมด
- `Api/.env.example`, `Frontend/.env.example` — ชื่อตัวแปร environment ที่ต้องตั้งค่า
- project files และ `Frontend/package.json` — target framework, package และคำสั่ง

## สถานะหลังเปลี่ยน Mock เป็นข้อมูลจริง (26 ตุลาคม 2026)

หัวข้อนี้แทนสถานะ Mock และจำนวน tests ที่อธิบายไว้ก่อนหน้า:

| ส่วน | สถานะปัจจุบัน |
|---|---|
| Account / Settings | ลิงก์ไปหน้าจริงตามสิทธิ์ ไม่มีสถิติตัวอย่าง |
| Analytics | จำนวนการจอง/คิวและสถานะจาก SQL Server กรองสาขา/วันที่ เจ้าของร้านเท่านั้น |
| Customer Tags | เพิ่ม/แก้ไข/ปิดใช้งานและผูกลูกค้า แยกข้อมูลแต่ละร้าน |
| Queue Categories | เพิ่ม/แก้ไข/ปิดใช้งานและจัดหมวดการจอง แยกสาขา; ไม่เปลี่ยนเลขคิวหรือลำดับบริการ |
| System Config | เวลาทำการและกติกาจองจริง เลือกสาขาได้ เจ้าของร้านเข้าหน้า System |
| Master Status | อ่านรหัสสถานะกลางจริง ไม่แก้ข้อมูลกลางที่กระทบร้านอื่น |
| Audit Log | ประวัติการเปลี่ยนแปลงใหม่ของร้าน เก็บชื่อฟิลด์/รหัสรายการ ไม่คัดลอกข้อมูลติดต่อลูกค้าหรือ secret |
| Payment / Invoice / Subscription | ซ่อนตามคำสั่งผู้ใช้ ทั้งเมนูและ HTTP 404 เมื่อเข้าผ่าน URL |

API ใหม่คือ `GET/POST /api/v1/workspace` ผ่าน Next BFF `/api/workspace` ใช้ `IShopWorkspace` และ `ShopWorkspace` ตรวจสิทธิ์ร้าน/สาขาฝั่ง server ทุกครั้ง ส่วน frontend ปัจจุบันใช้ Next 16 และเก็บบาง dependency ใน major ที่รองรับ source เดิม ดู package.json เป็นข้อมูลอ้างอิงเวอร์ชันปัจจุบัน

ลง migration `20261026100000_ScopeWorkspaceData` บนฐานพัฒนาที่ผู้ใช้อนุญาตแล้ว เก็บข้อมูลเดิมทั้งหมดและสร้างสำเนาแท็กแยกร้านจากความเป็นเจ้าของลูกค้าจริง ประวัติ migration เดิมเดือน ก.ค. ถูกตรวจเทียบคอลัมน์กับ baseline เดือน ส.ค. และปรับ history โดยไม่ลบประวัติเดิม รายละเอียดอยู่ใน ANTIGRAVITY_HANDOFF.md และ scripts/Sync-DevelopmentBaseline.ps1 สำหรับฐานพัฒนาใหม่ที่มีประวัติเก่าต้องตรวจเทียบ schema ก่อน reconcile ส่วนฐานว่างใช้ EF migrations ปกติ

ตรวจแล้ว: Release build ผ่าน, tests 18/18 ผ่านรวม SQL Server จริง (ข้อมูลทดสอบ rollback), EF ไม่มี pending model changes, Next production build/TypeScript ผ่าน, i18n keys ตรงกัน 1,355 keys, ESLint ไม่มี error แต่ยังมี warning จากโค้ดเดิม/กฎ effect ของ React และ HTTP smoke checks ผ่าน ยังไม่ได้ตรวจหน้าจอด้วยบัญชีล็อกอินใน browser หรือทดสอบภาพ desktop/mobile ในรอบนี้
# Platform Admin mock (2026-10-26)

A separate cross-tenant Platform Admin frontend prototype now exists under `/[locale]/admin`. It includes Overview, Shops, Users, Operations, Platform Audit Log, and Global Settings. It is deliberately isolated from the shop-owner dashboard and uses static mock records only.

This is **not production authorization**: the prototype uses an isolated four-hour `PlatformAdminMock` cookie from `/[locale]/admin-access`; `system.admin` is not enforced and no real admin account/API was added. See `PLATFORM_ADMIN_MOCK.md` for mock credentials, route ownership, security boundaries, and the production implementation checklist. Payment, invoice, and subscription administration remain out of scope.

