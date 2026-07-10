const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

const settingsEn = {
    "shop": {
        "title": "Shop Settings",
        "description": "Manage your basic shop information and business hours.",
        "basicInfo": "Basic Information",
        "saveBasic": "Save Information",
        "hours": "Business Hours",
        "saveHours": "Save Hours",
        "deleteShop": "Delete Shop",
        "deleteWarning": "Once deleted, all data in this shop will be permanently lost.",
        "deleteButton": "Delete Shop",
        "toast": {
            "loadFailed": "Failed to load shop information",
            "saveSuccess": "Shop updated successfully",
            "saveFailed": "Failed to update shop",
            "hoursSuccess": "Business hours updated successfully",
            "hoursFailed": "Failed to update business hours",
            "deleteSuccess": "Shop deleted successfully",
            "deleteFailed": "Failed to delete shop"
        }
    },
    "branch": {
        "title": "Branch Settings",
        "description": "Manage branch information and addresses.",
        "toast": {
            "loadFailed": "Failed to load branch information",
            "saveSuccess": "Branch updated successfully",
            "saveFailed": "Failed to update branch",
            "deleteSuccess": "Branch deleted successfully",
            "deleteFailed": "Failed to delete branch"
        }
    },
    "holiday": {
        "title": "Holiday Settings",
        "description": "Manage special holidays for your shop.",
        "add": "Add Holiday"
    }
};

const settingsTh = {
    "shop": {
        "title": "ตั้งค่าร้านค้า",
        "description": "จัดการข้อมูลพื้นฐานและเวลาทำการของร้านค้า",
        "basicInfo": "ข้อมูลพื้นฐาน",
        "saveBasic": "บันทึกข้อมูล",
        "hours": "เวลาทำการ",
        "saveHours": "บันทึกเวลาทำการ",
        "deleteShop": "ลบร้านค้า",
        "deleteWarning": "หากลบแล้ว ข้อมูลทั้งหมดในร้านนี้จะหายไปอย่างถาวร",
        "deleteButton": "ลบร้านค้า",
        "toast": {
            "loadFailed": "โหลดข้อมูลร้านค้าไม่สำเร็จ",
            "saveSuccess": "บันทึกข้อมูลสำเร็จ",
            "saveFailed": "เกิดข้อผิดพลาดในการบันทึก",
            "hoursSuccess": "บันทึกเวลาทำการสำเร็จ",
            "hoursFailed": "เกิดข้อผิดพลาดในการบันทึกเวลาทำการ",
            "deleteSuccess": "ลบร้านค้าสำเร็จ",
            "deleteFailed": "ลบร้านค้าไม่สำเร็จ"
        }
    },
    "branch": {
        "title": "ตั้งค่าสาขา",
        "description": "จัดการข้อมูลสาขาและที่อยู่",
        "toast": {
            "loadFailed": "โหลดข้อมูลสาขาไม่สำเร็จ",
            "saveSuccess": "บันทึกข้อมูลสาขาสำเร็จ",
            "saveFailed": "เกิดข้อผิดพลาดในการบันทึก",
            "deleteSuccess": "ลบสาขาสำเร็จ",
            "deleteFailed": "ลบสาขาไม่สำเร็จ"
        }
    },
    "holiday": {
        "title": "ตั้งค่าวันหยุด",
        "description": "จัดการวันหยุดพิเศษของร้านค้า",
        "add": "เพิ่มวันหยุด"
    }
};

const authEn = {
    "login": {
        "title": "Welcome Back",
        "subtitle": "Enter your credentials to access your account",
        "email": "Email",
        "emailPlaceholder": "name@example.com",
        "password": "Password",
        "passwordPlaceholder": "Enter your password",
        "forgotPassword": "Forgot password?",
        "submit": "Sign In",
        "submitting": "Signing in...",
        "noAccount": "Don't have an account?",
        "register": "Sign up",
        "toast": {
            "success": "Signed in successfully",
            "failed": "Invalid email or password",
            "error": "Sign in failed"
        }
    },
    "register": {
        "title": "Create an account",
        "subtitle": "Enter your details to get started",
        "name": "Full Name",
        "namePlaceholder": "John Doe",
        "email": "Email",
        "emailPlaceholder": "name@example.com",
        "password": "Password",
        "passwordPlaceholder": "Create a password",
        "confirmPassword": "Confirm Password",
        "confirmPlaceholder": "Confirm your password",
        "submit": "Sign Up",
        "submitting": "Creating account...",
        "hasAccount": "Already have an account?",
        "login": "Sign in",
        "toast": {
            "success": "Account created successfully",
            "failed": "Failed to create account"
        },
        "validation": {
            "nameRequired": "Name is required",
            "emailRequired": "Email is required",
            "emailInvalid": "Invalid email format",
            "passwordLength": "Password must be at least 6 characters",
            "passwordMismatch": "Passwords do not match"
        }
    }
};

const authTh = {
    "login": {
        "title": "ยินดีต้อนรับกลับมา",
        "subtitle": "เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ",
        "email": "อีเมล",
        "emailPlaceholder": "name@example.com",
        "password": "รหัสผ่าน",
        "passwordPlaceholder": "กรอกรหัสผ่านของคุณ",
        "forgotPassword": "ลืมรหัสผ่าน?",
        "submit": "เข้าสู่ระบบ",
        "submitting": "กำลังเข้าสู่ระบบ...",
        "noAccount": "ยังไม่มีบัญชีใช่หรือไม่?",
        "register": "สมัครสมาชิก",
        "toast": {
            "success": "เข้าสู่ระบบสำเร็จ",
            "failed": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            "error": "เข้าสู่ระบบไม่สำเร็จ"
        }
    },
    "register": {
        "title": "สร้างบัญชีใหม่",
        "subtitle": "กรอกข้อมูลเพื่อเริ่มต้นใช้งาน",
        "name": "ชื่อ-นามสกุล",
        "namePlaceholder": "สมชาย ใจดี",
        "email": "อีเมล",
        "emailPlaceholder": "name@example.com",
        "password": "รหัสผ่าน",
        "passwordPlaceholder": "ตั้งรหัสผ่าน",
        "confirmPassword": "ยืนยันรหัสผ่าน",
        "confirmPlaceholder": "ยืนยันรหัสผ่านอีกครั้ง",
        "submit": "สมัครสมาชิก",
        "submitting": "กำลังสมัครสมาชิก...",
        "hasAccount": "มีบัญชีอยู่แล้ว?",
        "login": "เข้าสู่ระบบ",
        "toast": {
            "success": "สมัครสมาชิกสำเร็จ",
            "failed": "สมัครสมาชิกไม่สำเร็จ"
        },
        "validation": {
            "nameRequired": "กรุณากรอกชื่อ",
            "emailRequired": "กรุณากรอกอีเมล",
            "emailInvalid": "รูปแบบอีเมลไม่ถูกต้อง",
            "passwordLength": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
            "passwordMismatch": "รหัสผ่านไม่ตรงกัน"
        }
    }
};

const bookEn = {
    "title": "Book Service",
    "selectShop": "Select Shop",
    "selectService": "Select Service",
    "selectDate": "Select Date",
    "selectTime": "Select Time",
    "yourInfo": "Your Information",
    "confirm": "Confirm Booking",
    "success": "Booking Successful!",
    "noShops": "No shops available",
    "noServices": "No services available",
    "noSlots": "No time slots available for this date",
    "form": {
        "name": "Your Name",
        "phone": "Phone Number",
        "note": "Additional Note (Optional)"
    }
};

const bookTh = {
    "title": "จองคิวบริการ",
    "selectShop": "เลือกร้านค้า",
    "selectService": "เลือกบริการ",
    "selectDate": "เลือกวันที่",
    "selectTime": "เลือกเวลา",
    "yourInfo": "ข้อมูลของคุณ",
    "confirm": "ยืนยันการจอง",
    "success": "จองคิวสำเร็จ!",
    "noShops": "ไม่มีร้านค้าที่เปิดรับจอง",
    "noServices": "ไม่มีบริการ",
    "noSlots": "ไม่มีเวลาว่างในวันนี้",
    "form": {
        "name": "ชื่อของคุณ",
        "phone": "เบอร์โทรศัพท์",
        "note": "หมายเหตุ (ถ้ามี)"
    }
};

enData.Settings = settingsEn;
thData.Settings = settingsTh;
enData.Auth = authEn;
thData.Auth = authTh;
enData.Book = bookEn;
thData.Book = bookTh;

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2));

console.log("Successfully updated en.json and th.json with Phase 2 keys.");
