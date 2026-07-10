const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

const layoutEn = {
    "profile": {
        "title": "Profile",
        "settings": "Settings",
        "billing": "Billing",
        "logout": "Log out"
    },
    "notifications": {
        "title": "Notifications",
        "markAllAsRead": "Mark all as read",
        "viewAll": "View all notifications",
        "empty": "No new notifications",
        "youHave": "You have",
        "unread": "unread messages."
    },
    "messages": {
        "title": "Messages",
        "viewAll": "View all messages",
        "empty": "No new messages"
    },
    "search": {
        "placeholder": "Search...",
        "noResults": "No results found"
    },
    "navigation": {
        "dashboard": "Dashboard",
        "queue": "Queue",
        "customers": "Customers",
        "services": "Services",
        "categories": "Categories",
        "settings": "Settings",
        "shops": "Shops",
        "branches": "Branches",
        "holidays": "Holidays",
        "switchShop": "Switch Shop"
    },
    "footer": {
        "copyright": "All rights reserved.",
        "terms": "Terms of Service",
        "privacy": "Privacy Policy"
    },
    "error": {
        "404": "Page Not Found",
        "404Message": "The page you are looking for does not exist or has been moved.",
        "500": "Server Error",
        "500Message": "Something went wrong on our end. Please try again later.",
        "backHome": "Back to Home",
        "tryAgain": "Try Again"
    }
};

const layoutTh = {
    "profile": {
        "title": "โปรไฟล์",
        "settings": "ตั้งค่า",
        "billing": "การเรียกเก็บเงิน",
        "logout": "ออกจากระบบ"
    },
    "notifications": {
        "title": "การแจ้งเตือน",
        "markAllAsRead": "ทำเครื่องหมายอ่านแล้วทั้งหมด",
        "viewAll": "ดูการแจ้งเตือนทั้งหมด",
        "empty": "ไม่มีการแจ้งเตือนใหม่",
        "youHave": "คุณมี",
        "unread": "ข้อความที่ยังไม่ได้อ่าน"
    },
    "messages": {
        "title": "ข้อความ",
        "viewAll": "ดูข้อความทั้งหมด",
        "empty": "ไม่มีข้อความใหม่"
    },
    "search": {
        "placeholder": "ค้นหา...",
        "noResults": "ไม่พบข้อมูล"
    },
    "navigation": {
        "dashboard": "หน้าหลัก",
        "queue": "จัดการคิว",
        "customers": "รายชื่อลูกค้า",
        "services": "รายการบริการ",
        "categories": "หมวดหมู่บริการ",
        "settings": "การตั้งค่า",
        "shops": "ข้อมูลร้าน",
        "branches": "ข้อมูลสาขา",
        "holidays": "วันหยุด",
        "switchShop": "สลับร้านค้า"
    },
    "footer": {
        "copyright": "สงวนลิขสิทธิ์",
        "terms": "ข้อกำหนดการให้บริการ",
        "privacy": "นโยบายความเป็นส่วนตัว"
    },
    "error": {
        "404": "ไม่พบหน้าเว็บ",
        "404Message": "หน้าที่คุณกำลังค้นหาไม่มีอยู่หรือถูกย้ายไปแล้ว",
        "500": "เกิดข้อผิดพลาด",
        "500Message": "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง",
        "backHome": "กลับสู่หน้าหลัก",
        "tryAgain": "ลองใหม่อีกครั้ง"
    }
};

enData.Layout = layoutEn;
thData.Layout = layoutTh;

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2));

console.log("Successfully updated en.json and th.json with Phase 3 Layout keys.");
