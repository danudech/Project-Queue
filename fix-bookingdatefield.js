const fs = require('fs');
const path = require('path');

const bookingPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'customer', 'bookingdatefield.tsx');

if (fs.existsSync(bookingPath)) {
    let content = fs.readFileSync(bookingPath, 'utf8');
    
    // Add import for useTranslations if it doesn't exist
    if (!content.includes('import { useTranslations }')) {
        content = content.replace(/import \* as React from "react"/, 'import * as React from "react"\nimport { useTranslations } from "next-intl"');
    }
    
    // Add hook
    if (!content.includes('const t = useTranslations("Customer");')) {
        content = content.replace(/export function BookingDateField\(\{ form \}: \{ form: any \}\) \{/, 'export function BookingDateField({ form }: { form: any }) {\n    const t = useTranslations("Customer");');
    }

    // Replace strings
    content = content.replace(/"เลือกวันที่"/g, 't("booking.selectDate")');
    content = content.replace(/>วันที่</g, '>{t("booking.dateLabel")}<');
    
    fs.writeFileSync(bookingPath, content);
    console.log("Successfully fixed and translated bookingdatefield.tsx");
}
