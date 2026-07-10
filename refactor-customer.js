const fs = require('fs');
const path = require('path');

const basePath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'customer');

// Refactor tb-customer-list.tsx
const tbPath = path.join(basePath, 'tb-customer-list.tsx');
let tbContent = fs.readFileSync(tbPath, 'utf8');

// Imports
tbContent = tbContent.replace(
    /import { useLocale } from "next-intl"/,
    'import { useLocale, useTranslations } from "next-intl"'
);
tbContent = tbContent.replace(
    /export default function TbCustomerList\(\) \{/,
    'export default function TbCustomerList() {\n    const t = useTranslations("customer");\n    const tc = useTranslations("Common");'
);

// Form schema
tbContent = tbContent.replace(
    /const formSchema = z\.object\(\{([\s\S]*?)\}\)/,
    `const getFormSchema = (t: any) => z.object({\n    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),\n    phone: z.string().min(1, t("validation.phoneRequired")).max(20, t("validation.phoneTooLong")),\n    is_active: z.boolean().default(true),\n    isBooking: z.boolean().default(false),\n})`
);
tbContent = tbContent.replace(
    /type FormValues = z\.infer<typeof formSchema>/,
    'type FormValues = z.infer<ReturnType<typeof getFormSchema>>'
);
tbContent = tbContent.replace(
    /resolver: zodResolver\(formSchema\)/,
    'resolver: zodResolver(getFormSchema(t))'
);

// Steps
tbContent = tbContent.replace(
    /const STEPS = \["ข้อมูลลูกค้า", "จองคิว"\]/,
    '// STEPS replaced inline'
);

tbContent = tbContent.replace(
    /\{STEPS\.map\(\(s, i\) => \(/,
    '{[t("steps.info"), t("steps.booking")].map((s, i) => ('
);

// Toasts
tbContent = tbContent.replace(/toast\.error\("โหลดข้อมูลไม่สำเร็จ"\)/g, 'toast.error(tc("error.loadFailed"))');
tbContent = tbContent.replace(/toast\.error\("ลบไม่สำเร็จ"\)/g, 'toast.error(tc("error.deleteFailed"))');
tbContent = tbContent.replace(/toast\.error\("ไม่สามารถเปลี่ยนสถานะได้"\)/g, 'toast.error(tc("error.statusChangeFailed"))');
tbContent = tbContent.replace(/toast\.error\("เกิดข้อผิดพลาดในการบันทึกข้อมูล"\)/g, 'toast.error(tc("error.saveFailed"))');

tbContent = tbContent.replace(/toast\.success\("ลบลูกค้าสำเร็จ"\)/g, 'toast.success(t("toast.deleteSuccess"))');
tbContent = tbContent.replace(/toast\.success\("แก้ไขข้อมูลลูกค้าสำเร็จ"\)/g, 'toast.success(t("toast.editSuccess"))');
tbContent = tbContent.replace(/toast\.success\("เพิ่มลูกค้าและบันทึกคิวสำเร็จ!"\)/g, 'toast.success(t("toast.addSuccess"))');
tbContent = tbContent.replace(/toast\.success\("เพิ่มลูกค้าสำเร็จ!"\)/g, 'toast.success(t("toast.addSuccess"))');

tbContent = tbContent.replace(/toast\.success\(`\$\{isActive \? "เปิด" : "ปิด"\}การใช้งาน \$\{c.name\} เรียบร้อยแล้ว`\)/, 'toast.success(tc("status.toggleSuccess"))');

// Toolbar
tbContent = tbContent.replace(/"ลูกค้าทั้งหมด"/g, 't("toolbar.all")');
tbContent = tbContent.replace(/"ค้นหาชื่อลูกค้า..."/g, 't("toolbar.search")');
tbContent = tbContent.replace(/>เพิ่มลูกค้า</g, '>{t("toolbar.add")}<');

// Dialog
tbContent = tbContent.replace(/\{editingCustomer \? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"\}/, '{editingCustomer ? t("dialog.edit") : t("dialog.add")}');
tbContent = tbContent.replace(/>ชื่อลูกค้า</g, '>{t("form.name")}<');
tbContent = tbContent.replace(/>เบอร์โทรศัพท์</g, '>{t("form.phone")}<');
tbContent = tbContent.replace(/>จองคิวพร้อมกัน</g, '>{t("form.bookTogether")}<');
tbContent = tbContent.replace(/>สถานะการใช้งาน</g, '>{tc("form.statusLabel")}<');

tbContent = tbContent.replace(/>ยกเลิก</g, '>{tc("cancel")}<');
tbContent = tbContent.replace(/>ถัดไป</g, '>{tc("next")}<');
tbContent = tbContent.replace(/>ย้อนกลับ</g, '>{tc("back")}<');
tbContent = tbContent.replace(/>บันทึก</g, '>{tc("save")}<');
tbContent = tbContent.replace(/"กำลังบันทึก..."/g, 'tc("saving")');

// Replace string literal placeholders if any
tbContent = tbContent.replace(/placeholder="สมชาย ใจดี"/, 'placeholder="e.g. Somchai"');
tbContent = tbContent.replace(/placeholder="0812345678"/, 'placeholder="e.g. 0812345678"');

fs.writeFileSync(tbPath, tbContent);

// Refactor columns.tsx
const colPath = path.join(basePath, 'columns.tsx');
let colContent = fs.readFileSync(colPath, 'utf8');
colContent = colContent.replace(
    /export const columns: ColumnDef<Customer>\[\] = \[/,
    'export const getColumns = (t: any, tc: any): ColumnDef<Customer>[] => ['
);
colContent = colContent.replace(/header: "ชื่อลูกค้า"/g, 'header: t("columns.name")');
colContent = colContent.replace(/header: "เบอร์โทรศัพท์"/g, 'header: t("columns.phone")');
colContent = colContent.replace(/header: "Status"/g, 'header: tc("columns.status")');
colContent = colContent.replace(/header: "วันที่สร้าง"/g, 'header: t("columns.createdAt")');
colContent = colContent.replace(/header: "Action"/g, 'header: tc("columns.action")');
colContent = colContent.replace(/"Active"/g, 'tc("status.active")');
colContent = colContent.replace(/"Inactive"/g, 'tc("status.inactive")');
colContent = colContent.replace(/>แก้ไข</g, '>{tc("tooltip.edit")}<');
colContent = colContent.replace(/>ปิดการใช้งาน</g, '>{tc("tooltip.deactivate")}<');
colContent = colContent.replace(/>เปิดการใช้งาน</g, '>{tc("tooltip.activate")}<');
colContent = colContent.replace(/>ลบข้อมูล</g, '>{tc("tooltip.delete")}<');
colContent = colContent.replace(/confirm\("คุณต้องการลบลูกค้านี้ใช่หรือไม่\?"\)/, 'confirm(t("confirm.delete"))');

fs.writeFileSync(colPath, colContent);

// Modify tb-customer-list.tsx to use getColumns
tbContent = fs.readFileSync(tbPath, 'utf8');
tbContent = tbContent.replace(
    /columns=\{columns\}/,
    'columns={getColumns(t, tc)}'
);
tbContent = tbContent.replace(
    /import \{ columns \} from "\.\/columns"/,
    'import { getColumns } from "./columns"'
);
fs.writeFileSync(tbPath, tbContent);

// Refactor bookingdatefield.tsx
const datePath = path.join(basePath, 'bookingdatefield.tsx');
let dateContent = fs.readFileSync(datePath, 'utf8');
dateContent = dateContent.replace(
    /import \* as React from "react"/,
    'import * as React from "react"\nimport { useTranslations } from "next-intl"'
);
dateContent = dateContent.replace(
    /const DAYS_SHORT_TH = \["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"\]/,
    '// DAYS_SHORT_TH removed'
);
dateContent = dateContent.replace(
    /export function BookingDateField\(\{/,
    'export function BookingDateField({\n    t,\n    tc,\n'
);
dateContent = dateContent.replace(
    /DAYS_SHORT_TH\.map/,
    'tc.raw("calendar.daysShort").map'
);
dateContent = dateContent.replace(
    /วันที่นัดหมาย/,
    '{t("booking.dateLabel")}'
);
fs.writeFileSync(datePath, dateContent);

// Also pass t and tc to BookingDateField in tb-customer-list.tsx
tbContent = fs.readFileSync(tbPath, 'utf8');
tbContent = tbContent.replace(
    /<BookingDateField/g,
    '<BookingDateField t={t} tc={tc}'
);
fs.writeFileSync(tbPath, tbContent);

console.log("Refactored customer files");
