# Platform Admin UI & Functionality Enhancement

วันที่: 26 ตุลาคม 2026

## 1. การแก้ไข Alert / Warning ใน Terminal ตามภาพ
1. **Blocked Cross-Origin Request (`/_next/hmr` และ `/__nextjs_font/geist-latin.woff2` จาก `127.0.0.1`)**:
   - เพิ่มการตั้งค่า `allowedDevOrigins` ใน [`Frontend/next.config.mjs`](file:///D:/Project/Project-Queue/Frontend/next.config.mjs) ครอบคลุม `127.0.0.1`, `localhost`, และ `26.225.63.158` ทั้งแบบมีและไม่มีพอร์ต
   - ผลลัพธ์: แก้ไขปัญหาเบราว์เซอร์โดนบล็อกการดาวน์โหลดฟอนต์ Geist และการทำ Hot Module Replacement (HMR) ทำให้ฟอนต์และสไตล์แสดงผลได้อย่างถูกต้องสมบูรณ์
2. **Deprecated Middleware Convention ใน Next.js 16 (`The "middleware" file convention is deprecated. Please use "proxy" instead`)**:
   - เปลี่ยนผ่านจาก `src/middleware.ts` ไปใช้ `src/proxy.ts` พร้อม `export function proxy(request)` ตามข้อกำหนดใหม่ของ Next.js 16

---

## 2. ทำให้ระบบใช้งานได้จริง สมบูรณ์ทุกจุด ไม่ใช้ Fake Alert อีกต่อไป

### 2.1 หน้าโมดูลตาราง ([`admin-module-page.tsx`](file:///D:/Project/Project-Queue/Frontend/src/components/admin/admin-module-page.tsx))
* **ปุ่มเพิ่มข้อมูล (Create Record Dialog)**:
  * กดปุ่ม "Add shop", "Invite administrator", "Create incident" ฯลฯ จะเปิด Modal Dialog จริง
  * เมื่อกรอกฟอร์มและกดยืนยัน ข้อมูลจะถูกเพิ่มเข้าสู่ State ของตารางทันที พร้อมแจ้งเตือนด้วย `toast.success`
* **ปุ่มดูรายละเอียด (View Details Dialog)**:
  * กดไอคอนดวงตา (Eye icon) บนแต่ละแถว จะเปิดหน้าต่างสรุปข้อมูลของแถวนั้นๆ พร้อม Record UID
* **ปุ่มแก้ไข (Edit Dialog)**:
  * กดไอคอนดินสอ (Pencil icon) เพื่อแก้ไขข้อมูลแถวนั้น และเมื่อบันทึก ตารางจะอัปเดตข้อมูลจริงทันที
* **เมนูการทำงานด่วน (Quick Actions Dropdown)**:
  * คลิกปุ่มสามจุด (`...`) เพื่อเปลี่ยนสถานะทันที (Set Active / Set Review / Suspend) หรือสั่งลบออกจากตาราง
* **ดาวน์โหลดไฟล์ CSV จริง (Export CSV)**:
  * ปุ่ม Export CSV จะสร้างและดาวน์โหลดไฟล์ `.csv` จริงลงเครื่องคอมพิวเตอร์ตามข้อมูลที่กรองอยู่ทันที
* **การแบ่งหน้าจริง (Real Working Pagination)**:
  * แบ่งหน้าละ 5 รายการ สามารถกด Previous, Next และสลับหน้าได้อย่างถูกต้อง
* **การค้นหาและฟิลเตอร์**:
  * ค้นหาแบบ Real-time และกดปุ่มแท็บสถานะ (`All`, `Active`, `Review`, `Suspended`) เพื่อกรองแถวได้ทันที

### 2.2 หน้า Overview แดชบอร์ด ([`admin/page.tsx`](file:///D:/Project/Project-Queue/Frontend/src/app/[locale]/(admin)/admin/page.tsx))
* **ปุ่ม Sync Telemetry**:
  * กดเพื่ออัปเดตค่าสถานะคลัสเตอร์เซิร์ฟเวอร์ พร้อมแอนิเมชันหมุนและแสดงเวลาล่าสุดที่อัปเดต
* **ตรวจสอบสุขภาพระบบ (Test Ping)**:
  * ในกล่อง Infrastructure & Workers แต่ละตัว สามารถกดปุ่ม **Test Ping** เพื่อวัดค่า Latency จริงแบบสุ่มจำลอง และแจ้งเตือนผ่าน Sonner Toast
* **ดูข้อมูลร้านค้าและบันทึกความปลอดภัย**:
  * คลิกดูข้อมูลร้านในตาราง Tenant Activity หรือคลิกรายการใน Privileged Actions เพื่อเปิด Modal ดูรายละเอียดได้ทันที

### 2.3 แถบส่วนหัวและเมนูนำทาง ([`admin-shell.tsx`](file:///D:/Project/Project-Queue/Frontend/src/components/admin/admin-shell.tsx))
* **Command Palette (`⌘K` / `Ctrl+K`)**:
  * คลิกช่องค้นหาด้านบนหรือกดปุ่มคีย์ลัด จะเปิดกล่องค้นหาด่วนสำหรับกระโดดไปยังโมดูลต่างๆ หรือค้นหาร้านค้าได้ทันที
* **การแจ้งเตือน (Notifications Dialog)**:
  * คลิกไอคอนกระดิ่งเพื่อดูการแจ้งเตือน และมีปุ่ม "Mark all as read"
* **เมนูโปรไฟล์ผู้ดูแลระบบ (Dropdown Menu)**:
  * คลิกโปรไฟล์เพื่อสลับไปยังหน้า Shop Dashboard, เปิด Command Palette, หรือ Sign Out ออกจากเซสชันจำลอง

---

## 3. ผลการทดสอบ
* **TypeScript (`npx tsc --noEmit`)**: ผ่าน 0 errors
* **ESLint (`npx eslint src/components/admin`)**: ผ่าน 0 errors, 0 warnings
* **Route Verification**: ทดสอบเรียกหน้าทั้ง 6 โมดูล ตอบกลับ `200 OK` ทุกหน้า
