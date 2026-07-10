const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

function replaceFile(filePath, replacements, useTranslationNamespace = 'Dashboard') {
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

const dashboardPath = path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'dashboard', 'page.tsx');
replaceFile(dashboardPath, [
    { search: />ภาพรวม</g, replace: '>{t("title")}<' },
    { search: />ลูกค้าทั้งหมด</g, replace: '>{t("totalCustomers")}<' },
    { search: />การจองทั้งหมด</g, replace: '>{t("totalBookings")}<' },
    { search: />รายได้</g, replace: '>{t("revenue")}<' },
    { search: />ความเคลื่อนไหวล่าสุด</g, replace: '>{t("recentActivity")}<' },
    { search: />ไม่มีความเคลื่อนไหวล่าสุด</g, replace: '>{t("noActivity")}<' },
], 'Dashboard');

const holidayPath = path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'setting', 'holiday', 'page.tsx');
replaceFile(holidayPath, [
    { search: />ตั้งค่าวันหยุด</g, replace: '>{t("title")}<' },
    { search: />จัดการวันหยุดพิเศษของร้านค้า</g, replace: '>{t("description")}<' },
    { search: />เพิ่มวันหยุด</g, replace: '>{t("add")}<' },
], 'Settings.holiday');

console.log("Phase 4 refactoring complete!");
