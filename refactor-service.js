const fs = require('fs');
const path = require('path');

const basePath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service');

// Refactor tb-sevice-list.tsx
const tbPath = path.join(basePath, 'tb-sevice-list.tsx');
let tbContent = fs.readFileSync(tbPath, 'utf8');

// Imports
tbContent = tbContent.replace(
    /import { useLocale } from "next-intl"/,
    'import { useLocale, useTranslations } from "next-intl"'
);
tbContent = tbContent.replace(
    /export default function TbServiceList\(\) \{/,
    'export default function TbServiceList() {\n    const t = useTranslations("service");\n    const tc = useTranslations("Common");'
);

// Form schema
tbContent = tbContent.replace(
    /const formSchema = z\.object\(\{([\s\S]*?)\}\)/,
    `const getFormSchema = (t: any) => z.object({\n    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),\n    shopId: z.number().min(1, t("validation.shopRequired")),\n    duration: z.coerce.number({\n        required_error: t("validation.durationRequired"),\n        invalid_type_error: t("validation.durationInt"),\n    }).min(1, t("validation.durationMin")),\n    price: z.coerce.number({\n        required_error: t("validation.priceRequired"),\n        invalid_type_error: t("validation.durationInt"),\n    }).min(0, t("validation.priceMin")),\n    categoryId: z.number().min(1, t("validation.categoryRequired")),\n    is_active: z.boolean().default(true),\n})`
);
tbContent = tbContent.replace(
    /type FormValues = z\.infer<typeof formSchema>/,
    'type FormValues = z.infer<ReturnType<typeof getFormSchema>>'
);
tbContent = tbContent.replace(
    /resolver: zodResolver\(formSchema\)/,
    'resolver: zodResolver(getFormSchema(t))'
);

// Toasts
tbContent = tbContent.replace(/toast\.error\("โหลดข้อมูลไม่สำเร็จ"\)/g, 'toast.error(tc("error.loadFailed"))');
tbContent = tbContent.replace(/toast\.error\("ลบไม่สำเร็จ"\)/g, 'toast.error(tc("error.deleteFailed"))');
tbContent = tbContent.replace(/toast\.error\("ไม่สามารถเปลี่ยนสถานะได้"\)/g, 'toast.error(tc("error.statusChangeFailed"))');
tbContent = tbContent.replace(/toast\.error\("เกิดข้อผิดพลาดในการบันทึกข้อมูล"\)/g, 'toast.error(tc("error.saveFailed"))');

tbContent = tbContent.replace(/toast\.success\("ลบข้อมูลสำเร็จ"\)/g, 'toast.success(t("toast.deleteSuccess"))');
tbContent = tbContent.replace(/toast\.success\("แก้ไขข้อมูลสำเร็จ"\)/g, 'toast.success(t("toast.editSuccess"))');
tbContent = tbContent.replace(/toast\.success\("เพิ่มข้อมูลสำเร็จ"\)/g, 'toast.success(t("toast.addSuccess"))');

tbContent = tbContent.replace(/toast\.success\(`\$\{isActive \? "เปิด" : "ปิด"\}การใช้งาน \$\{c\.name\} เรียบร้อยแล้ว`\)/, 'toast.success(tc("status.toggleSuccess"))');

// Toolbar
tbContent = tbContent.replace(/"บริการทั้งหมด"/g, 't("toolbar.all")');
tbContent = tbContent.replace(/"ค้นหาชื่อบริการ..."/g, 't("toolbar.search")');
tbContent = tbContent.replace(/>เพิ่มบริการ</g, '>{t("toolbar.add")}<');

// Loading state
tbContent = tbContent.replace(/"กำลังโหลดข้อมูล..."/g, 'tc("loading")');
tbContent = tbContent.replace(/"กำลังโหลด..."/g, 'tc("loading")');

// Dialog & Form
tbContent = tbContent.replace(/\{editingService \? "แก้ไขบริการ" : "เพิ่มบริการใหม่"\}/, '{editingService ? t("dialog.edit") : t("dialog.add")}');
tbContent = tbContent.replace(/>ชื่อบริการ</g, '>{t("form.name")}<');
tbContent = tbContent.replace(/>ระยะเวลา \(นาที\)</g, '>{t("form.duration")}<');
tbContent = tbContent.replace(/>ราคา</g, '>{t("form.price")}<');
tbContent = tbContent.replace(/>หมวดหมู่</g, '>{t("form.category")}<');
tbContent = tbContent.replace(/>ร้านค้า</g, '>{t("form.shop")}<');
tbContent = tbContent.replace(/>สถานะการใช้งาน</g, '>{tc("form.statusLabel")}<');

tbContent = tbContent.replace(/>ยกเลิก</g, '>{tc("cancel")}<');
tbContent = tbContent.replace(/>บันทึก</g, '>{tc("save")}<');
tbContent = tbContent.replace(/"กำลังบันทึก..."/g, 'tc("saving")');

fs.writeFileSync(tbPath, tbContent);

// Refactor columns.tsx
const colPath = path.join(basePath, 'columns.tsx');
let colContent = fs.readFileSync(colPath, 'utf8');
colContent = colContent.replace(
    /export const columns: ColumnDef<ServiceType>\[\] = \[/,
    'export const getColumns = (t: any, tc: any): ColumnDef<ServiceType>[] => ['
);
colContent = colContent.replace(/header: "ชื่อบริการ"/g, 'header: t("columns.name")');
colContent = colContent.replace(/header: "ระยะเวลา"/g, 'header: t("columns.duration")');
colContent = colContent.replace(/header: "ราคา"/g, 'header: t("columns.price")');
colContent = colContent.replace(/header: "Status"/g, 'header: tc("columns.status")');
colContent = colContent.replace(/header: "วันที่สร้าง"/g, 'header: t("columns.createdAt")');
colContent = colContent.replace(/header: "Action"/g, 'header: tc("columns.action")');
colContent = colContent.replace(/"Active"/g, 'tc("status.active")');
colContent = colContent.replace(/"Inactive"/g, 'tc("status.inactive")');
colContent = colContent.replace(/>แก้ไข</g, '>{tc("tooltip.edit")}<');
colContent = colContent.replace(/>ปิดการใช้งาน</g, '>{tc("tooltip.deactivate")}<');
colContent = colContent.replace(/>เปิดการใช้งาน</g, '>{tc("tooltip.activate")}<');
colContent = colContent.replace(/>ลบข้อมูล</g, '>{tc("tooltip.delete")}<');
colContent = colContent.replace(/confirm\("คุณต้องการลบข้อมูลนี้ใช่หรือไม่\?"\)/, 'confirm(t("confirm.delete"))');
colContent = colContent.replace(/"นาที"/, 'tc("units.minutes")');

fs.writeFileSync(colPath, colContent);

// Modify tb-sevice-list.tsx to use getColumns
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

console.log("Refactored service files");
