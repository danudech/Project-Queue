const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

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

const navDrawerPath = path.join(baseFrontend, 'src', 'components', 'partials', 'navigation-drawer.tsx');
replaceFile(navDrawerPath, [
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

const tableToolbarPath = path.join(baseFrontend, 'src', 'components', 'partials', 'react-table', 'table-toolbar.tsx');
replaceFile(tableToolbarPath, [
    { search: /placeholder="ค้นหา..."/g, replace: 'placeholder={t("search")}' },
], 'Common');

const notFoundPath = path.join(baseFrontend, 'src', 'app', '[locale]', 'not-found.tsx');
replaceFile(notFoundPath, [
    { search: />ไม่พบหน้าเว็บ</g, replace: '>{t("error.404")}<' },
    { search: />หน้าที่คุณกำลังค้นหาไม่มีอยู่หรือถูกย้ายไปแล้ว</g, replace: '>{t("error.404Message")}<' },
    { search: />กลับสู่หน้าหลัก</g, replace: '>{t("error.backHome")}<' },
]);

const errorPath = path.join(baseFrontend, 'src', 'app', '[locale]', 'error.tsx');
replaceFile(errorPath, [
    { search: />เกิดข้อผิดพลาด</g, replace: '>{t("error.500")}<' },
    { search: />เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง</g, replace: '>{t("error.500Message")}<' },
    { search: />ลองใหม่อีกครั้ง</g, replace: '>{t("error.tryAgain")}<' },
]);

console.log("Phase 3 refactoring part 2 complete!");
