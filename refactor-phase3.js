const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');
const componentsPath = path.join(baseFrontend, 'src', 'components', 'partials');
const headerPath = path.join(componentsPath, 'header');
const sidebarPath = path.join(componentsPath, 'sidebar', 'common');
const footerPath = path.join(componentsPath, 'footer', 'index.tsx');
const tableToolbarPath = path.join(baseFrontend, 'src', 'components', 'react-table', 'table-toolbar.tsx');
const notFoundPath = path.join(baseFrontend, 'src', 'app', 'not-found.tsx');
const errorPath = path.join(baseFrontend, 'src', 'app', 'error.tsx');

function replaceFile(filePath, replacements, useTranslationNamespace = 'Layout') {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useTranslations import if missing
    if (!content.includes('useTranslations')) {
        if (content.includes('next-intl')) {
            content = content.replace(/import \{.*?\} from "next-intl"/, (match) => {
                if (!match.includes('useTranslations')) {
                    return match.replace('{', '{ useTranslations,');
                }
                return match;
            });
        } else {
            content = `import { useTranslations } from "next-intl";\n` + content;
        }
    }

    // Add useTranslations hook to the component
    const componentRegex = /(export (?:default )?function \w+\([^)]*\)(?:\s*:\s*\w+)?\s*\{)/;
    if (componentRegex.test(content) && !content.includes(`useTranslations("${useTranslationNamespace}")`)) {
        content = content.replace(componentRegex, `$1\n    const t = useTranslations("${useTranslationNamespace}");`);
    } else {
        // Handle arrow functions
        const arrowRegex = /(const \w+ = \([^)]*\)(?:\s*:\s*\w+)?\s*=>\s*\{)/;
        if (arrowRegex.test(content) && !content.includes(`useTranslations("${useTranslationNamespace}")`)) {
            content = content.replace(arrowRegex, `$1\n    const t = useTranslations("${useTranslationNamespace}");`);
        }
    }

    replacements.forEach(({ search, replace }) => {
        content = content.replace(search, replace);
    });

    fs.writeFileSync(filePath, content);
}

// 1. Header Components
replaceFile(path.join(headerPath, 'profile-info.tsx'), [
    { search: />โปรไฟล์</g, replace: '>{t("profile.title")}<' },
    { search: />ตั้งค่า</g, replace: '>{t("profile.settings")}<' },
    { search: />การเรียกเก็บเงิน</g, replace: '>{t("profile.billing")}<' },
    { search: />ออกจากระบบ</g, replace: '>{t("profile.logout")}<' },
]);

replaceFile(path.join(headerPath, 'notifications.tsx'), [
    { search: />การแจ้งเตือน</g, replace: '>{t("notifications.title")}<' },
    { search: />คุณมี</g, replace: '>{t("notifications.youHave")}<' },
    { search: />ข้อความที่ยังไม่ได้อ่าน</g, replace: '>{t("notifications.unread")}<' },
    { search: />ทำเครื่องหมายอ่านแล้วทั้งหมด</g, replace: '>{t("notifications.markAllAsRead")}<' },
    { search: />ดูการแจ้งเตือนทั้งหมด</g, replace: '>{t("notifications.viewAll")}<' },
    { search: />ไม่มีการแจ้งเตือนใหม่</g, replace: '>{t("notifications.empty")}<' },
]);

replaceFile(path.join(headerPath, 'messages.tsx'), [
    { search: />ข้อความ</g, replace: '>{t("messages.title")}<' },
    { search: />คุณมี</g, replace: '>{t("notifications.youHave")}<' },
    { search: />ข้อความที่ยังไม่ได้อ่าน</g, replace: '>{t("notifications.unread")}<' },
    { search: />ทำเครื่องหมายอ่านแล้วทั้งหมด</g, replace: '>{t("notifications.markAllAsRead")}<' },
    { search: />ดูข้อความทั้งหมด</g, replace: '>{t("messages.viewAll")}<' },
    { search: />ไม่มีข้อความใหม่</g, replace: '>{t("messages.empty")}<' },
]);

replaceFile(path.join(headerPath, 'header-search.tsx'), [
    { search: /placeholder="ค้นหา..."/g, replace: 'placeholder={t("search.placeholder")}' },
    { search: />ไม่พบข้อมูล</g, replace: '>{t("search.noResults")}<' },
]);

// 2. Sidebar & Nav Components
replaceFile(path.join(sidebarPath, 'search-bar.tsx'), [
    { search: /placeholder="ค้นหา..."/g, replace: 'placeholder={t("search.placeholder")}' },
]);

replaceFile(path.join(sidebarPath, 'navigation-drawer.tsx'), [
    { search: />หน้าหลัก</g, replace: '>{t("navigation.dashboard")}<' },
    { search: />จัดการคิว</g, replace: '>{t("navigation.queue")}<' },
    { search: />รายชื่อลูกค้า</g, replace: '>{t("navigation.customers")}<' },
    { search: />รายการบริการ</g, replace: '>{t("navigation.services")}<' },
    { search: />หมวดหมู่บริการ</g, replace: '>{t("navigation.categories")}<' },
    { search: />การตั้งค่า</g, replace: '>{t("navigation.settings")}<' },
    { search: />ข้อมูลร้าน</g, replace: '>{t("navigation.shops")}<' },
    { search: />ข้อมูลสาขา</g, replace: '>{t("navigation.branches")}<' },
    { search: />วันหยุด</g, replace: '>{t("navigation.holidays")}<' },
]);

// 3. Footer & Table Toolbar
replaceFile(footerPath, [
    { search: />สงวนลิขสิทธิ์</g, replace: '>{t("footer.copyright")}<' },
    { search: />ข้อกำหนดการให้บริการ</g, replace: '>{t("footer.terms")}<' },
    { search: />นโยบายความเป็นส่วนตัว</g, replace: '>{t("footer.privacy")}<' },
]);

replaceFile(tableToolbarPath, [
    { search: /placeholder="ค้นหา..."/g, replace: 'placeholder={t("search")}' },
], 'Common');

// 4. Not Found & Error
replaceFile(notFoundPath, [
    { search: />ไม่พบหน้าเว็บ</g, replace: '>{t("error.404")}<' },
    { search: />หน้าที่คุณกำลังค้นหาไม่มีอยู่หรือถูกย้ายไปแล้ว</g, replace: '>{t("error.404Message")}<' },
    { search: />กลับสู่หน้าหลัก</g, replace: '>{t("error.backHome")}<' },
]);

replaceFile(errorPath, [
    { search: />เกิดข้อผิดพลาด</g, replace: '>{t("error.500")}<' },
    { search: />เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง</g, replace: '>{t("error.500Message")}<' },
    { search: />ลองใหม่อีกครั้ง</g, replace: '>{t("error.tryAgain")}<' },
]);

console.log("Phase 3 refactoring complete!");
