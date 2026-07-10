const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');
const basePath = path.join(baseFrontend, 'src', 'app', '[locale]');

// --- 1. setting/shop/page.tsx ---
const shopPagePath = path.join(basePath, '(user)', '(dashboard)', 'setting', 'shop', 'page.tsx');
if (fs.existsSync(shopPagePath)) {
    let content = fs.readFileSync(shopPagePath, 'utf8');
    
    // Add useTranslations import
    content = content.replace(
        /import \{ useLocale \} from "next-intl"/,
        'import { useLocale, useTranslations } from "next-intl"'
    );
    // Inside ShopSettings component
    content = content.replace(
        /export default function ShopSettings\(\) \{/,
        'export default function ShopSettings() {\n    const t = useTranslations("Settings.shop");\n    const tc = useTranslations("Common");'
    );
    // Texts
    content = content.replace(/>ตั้งค่าร้านค้า</g, '>{t("title")}<');
    content = content.replace(/>จัดการข้อมูลพื้นฐานและเวลาทำการของร้านค้า</g, '>{t("description")}<');
    content = content.replace(/>ข้อมูลพื้นฐาน</g, '>{t("basicInfo")}<');
    content = content.replace(/>บันทึกข้อมูล</g, '>{t("saveBasic")}<');
    content = content.replace(/>เวลาทำการ</g, '>{t("hours")}<');
    content = content.replace(/>บันทึกเวลาทำการ</g, '>{t("saveHours")}<');
    content = content.replace(/>ลบร้านค้า</g, '>{t("deleteShop")}<');
    content = content.replace(/>หากลบแล้ว ข้อมูลทั้งหมดในร้านนี้จะหายไปอย่างถาวร</g, '>{t("deleteWarning")}<');
    content = content.replace(/>ลบร้านค้า</g, '>{t("deleteButton")}<');
    
    // Toasts
    content = content.replace(/toast\.error\("โหลดข้อมูลร้านค้าไม่สำเร็จ"\)/g, 'toast.error(t("toast.loadFailed"))');
    content = content.replace(/toast\.success\("บันทึกข้อมูลสำเร็จ"\)/g, 'toast.success(t("toast.saveSuccess"))');
    content = content.replace(/toast\.error\("เกิดข้อผิดพลาดในการบันทึก"\)/g, 'toast.error(t("toast.saveFailed"))');
    content = content.replace(/toast\.success\("บันทึกเวลาทำการสำเร็จ"\)/g, 'toast.success(t("toast.hoursSuccess"))');
    content = content.replace(/toast\.error\("เกิดข้อผิดพลาดในการบันทึกเวลาทำการ"\)/g, 'toast.error(t("toast.hoursFailed"))');
    content = content.replace(/toast\.success\("ลบร้านค้าสำเร็จ"\)/g, 'toast.success(t("toast.deleteSuccess"))');
    content = content.replace(/toast\.error\("ลบร้านค้าไม่สำเร็จ"\)/g, 'toast.error(t("toast.deleteFailed"))');
    
    fs.writeFileSync(shopPagePath, content);
}

// --- 2. setting/branch/page.tsx ---
const branchPagePath = path.join(basePath, '(user)', '(dashboard)', 'setting', 'branch', 'page.tsx');
if (fs.existsSync(branchPagePath)) {
    let content = fs.readFileSync(branchPagePath, 'utf8');
    
    content = content.replace(
        /import \{ useLocale \} from "next-intl"/,
        'import { useLocale, useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export default function BranchSettings\(\) \{/,
        'export default function BranchSettings() {\n    const t = useTranslations("Settings.branch");\n    const tc = useTranslations("Common");'
    );
    
    content = content.replace(/>ตั้งค่าสาขา</g, '>{t("title")}<');
    content = content.replace(/>จัดการข้อมูลสาขาและที่อยู่</g, '>{t("description")}<');
    
    content = content.replace(/toast\.error\("โหลดข้อมูลสาขาไม่สำเร็จ"\)/g, 'toast.error(t("toast.loadFailed"))');
    content = content.replace(/toast\.success\("บันทึกข้อมูลสาขาสำเร็จ"\)/g, 'toast.success(t("toast.saveSuccess"))');
    content = content.replace(/toast\.error\("เกิดข้อผิดพลาดในการบันทึก"\)/g, 'toast.error(t("toast.saveFailed"))');
    content = content.replace(/toast\.success\("ลบสาขาสำเร็จ"\)/g, 'toast.success(t("toast.deleteSuccess"))');
    content = content.replace(/toast\.error\("ลบสาขาไม่สำเร็จ"\)/g, 'toast.error(t("toast.deleteFailed"))');
    
    fs.writeFileSync(branchPagePath, content);
}

// --- 3. login-form.tsx & reg-form.tsx ---
const authComponentPath = path.join(baseFrontend, 'src', 'components', 'partials', 'auth');
const loginPath = path.join(authComponentPath, 'login-form.tsx');
if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    content = content.replace(
        /import \{ useState \} from "react"/,
        'import { useState } from "react"\nimport { useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export function LoginForm\(\) \{/,
        'export function LoginForm() {\n    const t = useTranslations("Auth.login");'
    );
    
    content = content.replace(/>ยินดีต้อนรับกลับมา</g, '>{t("title")}<');
    content = content.replace(/>เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ</g, '>{t("subtitle")}<');
    content = content.replace(/>อีเมล</g, '>{t("email")}<');
    content = content.replace(/placeholder="name@example.com"/g, 'placeholder={t("emailPlaceholder")}');
    content = content.replace(/>รหัสผ่าน</g, '>{t("password")}<');
    content = content.replace(/>ลืมรหัสผ่าน\?</g, '>{t("forgotPassword")}<');
    content = content.replace(/>เข้าสู่ระบบ</g, '>{t("submit")}<');
    content = content.replace(/>กำลังเข้าสู่ระบบ...</g, '>{t("submitting")}<');
    content = content.replace(/>ยังไม่มีบัญชีใช่หรือไม่\?</g, '>{t("noAccount")}<');
    content = content.replace(/>สมัครสมาชิก</g, '>{t("register")}<');
    
    content = content.replace(/toast\.success\("เข้าสู่ระบบสำเร็จ"\)/g, 'toast.success(t("toast.success"))');
    content = content.replace(/toast\.error\("อีเมลหรือรหัสผ่านไม่ถูกต้อง"\)/g, 'toast.error(t("toast.failed"))');
    content = content.replace(/toast\.error\("เข้าสู่ระบบไม่สำเร็จ"\)/g, 'toast.error(t("toast.error"))');
    
    fs.writeFileSync(loginPath, content);
}

const regPath = path.join(authComponentPath, 'reg-form.tsx');
if (fs.existsSync(regPath)) {
    let content = fs.readFileSync(regPath, 'utf8');
    content = content.replace(
        /import \{ useState \} from "react"/,
        'import { useState } from "react"\nimport { useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export function RegForm\(\) \{/,
        'export function RegForm() {\n    const t = useTranslations("Auth.register");'
    );
    
    // Zod schema in reg-form.tsx is tricky since it's outside. We will move it inside or use a getter.
    content = content.replace(
        /const formSchema = z\.object\(\{([\s\S]*?)\}\)/,
        `const getFormSchema = (t: any) => z.object({\n    name: z.string().min(1, t("validation.nameRequired")),\n    email: z.string().email(t("validation.emailInvalid")),\n    password: z.string().min(6, t("validation.passwordLength")),\n    confirmPassword: z.string()\n}).refine((data) => data.password === data.confirmPassword, {\n    message: t("validation.passwordMismatch"),\n    path: ["confirmPassword"],\n})`
    );
    content = content.replace(
        /resolver: zodResolver\(formSchema\)/,
        'resolver: zodResolver(getFormSchema(t))'
    );
    content = content.replace(
        /type FormValues = z\.infer<typeof formSchema>/,
        'type FormValues = z.infer<ReturnType<typeof getFormSchema>>'
    );
    
    content = content.replace(/>สร้างบัญชีใหม่</g, '>{t("title")}<');
    content = content.replace(/>กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</g, '>{t("subtitle")}<');
    content = content.replace(/>ชื่อ-นามสกุล</g, '>{t("name")}<');
    content = content.replace(/placeholder="สมชาย ใจดี"/g, 'placeholder={t("namePlaceholder")}');
    content = content.replace(/>อีเมล</g, '>{t("email")}<');
    content = content.replace(/placeholder="name@example.com"/g, 'placeholder={t("emailPlaceholder")}');
    content = content.replace(/>รหัสผ่าน</g, '>{t("password")}<');
    content = content.replace(/placeholder="ตั้งรหัสผ่าน"/g, 'placeholder={t("passwordPlaceholder")}');
    content = content.replace(/>ยืนยันรหัสผ่านอีกครั้ง</g, '>{t("confirmPassword")}<');
    content = content.replace(/>ยืนยันรหัสผ่าน</g, '>{t("confirmPassword")}<');
    content = content.replace(/>สมัครสมาชิก</g, '>{t("submit")}<');
    content = content.replace(/>กำลังสมัครสมาชิก...</g, '>{t("submitting")}<');
    content = content.replace(/>มีบัญชีอยู่แล้ว\?</g, '>{t("hasAccount")}<');
    content = content.replace(/>เข้าสู่ระบบ</g, '>{t("login")}<');
    
    content = content.replace(/toast\.success\("สมัครสมาชิกสำเร็จ"\)/g, 'toast.success(t("toast.success"))');
    content = content.replace(/toast\.error\("สมัครสมาชิกไม่สำเร็จ"\)/g, 'toast.error(t("toast.failed"))');
    
    fs.writeFileSync(regPath, content);
}

// --- 4. book-service/page.tsx & layout.tsx ---
const bookPagePath = path.join(basePath, 'book-service', '[shopUrl]', 'page.tsx');
if (fs.existsSync(bookPagePath)) {
    let content = fs.readFileSync(bookPagePath, 'utf8');
    content = content.replace(
        /import \{ useLocale \} from "next-intl"/,
        'import { useLocale, useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export default function BookServicePage\(\{ params \}: \{ params: \{ shopUrl: string \} \}\) \{/,
        'export default function BookServicePage({ params }: { params: { shopUrl: string } }) {\n    const t = useTranslations("Book");'
    );
    
    content = content.replace(/>เลือกร้านค้า</g, '>{t("selectShop")}<');
    content = content.replace(/>เลือกบริการ</g, '>{t("selectService")}<');
    content = content.replace(/>เลือกวันที่</g, '>{t("selectDate")}<');
    content = content.replace(/>เลือกเวลา</g, '>{t("selectTime")}<');
    content = content.replace(/>ข้อมูลของคุณ</g, '>{t("yourInfo")}<');
    content = content.replace(/>ยืนยันการจอง</g, '>{t("confirm")}<');
    
    content = content.replace(/>ไม่มีบริการ</g, '>{t("noServices")}<');
    content = content.replace(/>ไม่มีเวลาว่างในวันนี้</g, '>{t("noSlots")}<');
    content = content.replace(/>ไม่มีร้านค้าที่เปิดรับจอง</g, '>{t("noShops")}<');
    
    content = content.replace(/>ชื่อของคุณ</g, '>{t("form.name")}<');
    content = content.replace(/>เบอร์โทรศัพท์</g, '>{t("form.phone")}<');
    content = content.replace(/>หมายเหตุ \(ถ้ามี\)</g, '>{t("form.note")}<');
    
    content = content.replace(/toast\.success\("จองคิวสำเร็จ!"\)/g, 'toast.success(t("success"))');
    
    fs.writeFileSync(bookPagePath, content);
}

const bookLayoutPath = path.join(basePath, 'book-service', 'layout.tsx');
if (fs.existsSync(bookLayoutPath)) {
    let content = fs.readFileSync(bookLayoutPath, 'utf8');
    content = content.replace(
        /import React from "react"/,
        'import React from "react"\nimport { useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export default function BookServiceLayout\(\{ children \}: \{ children: React\.ReactNode \}\) \{/,
        'export default function BookServiceLayout({ children }: { children: React.ReactNode }) {\n    const t = useTranslations("Book");'
    );
    content = content.replace(/>จองคิวบริการ</g, '>{t("title")}<');
    fs.writeFileSync(bookLayoutPath, content);
}

// --- 5. create-store-form.tsx ---
const createStorePath = path.join(baseFrontend, 'src', 'components', 'partials', 'create-store-form.tsx');
if (fs.existsSync(createStorePath)) {
    let content = fs.readFileSync(createStorePath, 'utf8');
    
    content = content.replace(
        /import React from "react"/,
        'import React from "react"\nimport { useTranslations } from "next-intl"'
    );
    content = content.replace(
        /export function CreateStoreForm\(\) \{/,
        'export function CreateStoreForm() {\n    const t = useTranslations("Shop");'
    );
    
    // It probably uses the same strings as team-switcher step 1
    content = content.replace(/>สร้างร้านค้าใหม่</g, '>{t("createNewShop") || "Create New Shop"}<');
    content = content.replace(/>สร้างร้านค้า</g, '>{t("creating") || "Creating..."}<');
    content = content.replace(/>ชื่อร้าน</g, '>{t("shopName") || "Shop Name"}<');
    
    fs.writeFileSync(createStorePath, content);
}

console.log("Phase 2 refactoring complete!");
