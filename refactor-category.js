const fs = require('fs');
const path = require('path');

const basePath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service', 'category');

// Refactor tb-category-list.tsx
const tbPath = path.join(basePath, 'tb-category-list.tsx');
let tbContent = fs.readFileSync(tbPath, 'utf8');

// Imports
tbContent = tbContent.replace(
    /import { useLocale } from "next-intl"/,
    'import { useLocale, useTranslations } from "next-intl"'
);
tbContent = tbContent.replace(
    /export default function TbCategoryList\(\) \{/,
    'export default function TbCategoryList() {\n    const t = useTranslations("category");\n    const tc = useTranslations("Common");'
);

// Form schema
tbContent = tbContent.replace(
    /const formSchema = z\.object\(\{([\s\S]*?)\}\)/,
    `const getFormSchema = (t: any) => z.object({\n    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),\n    shopId: z.number().min(1, t("validation.shopRequired")),\n    is_active: z.boolean().default(true),\n})`
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

tbContent = tbContent.replace(/toast\.success\("ลบหมวดหมู่สำเร็จ"\)/g, 'toast.success(t("toast.deleteSuccess"))');
tbContent = tbContent.replace(/toast\.success\("แก้ไขหมวดหมู่สำเร็จ"\)/g, 'toast.success(t("toast.editSuccess"))');
tbContent = tbContent.replace(/toast\.success\("เพิ่มหมวดหมู่สำเร็จ"\)/g, 'toast.success(t("toast.addSuccess"))');

tbContent = tbContent.replace(/toast\.success\(`\$\{isActive \? "เปิด" : "ปิด"\}การใช้งาน \$\{c\.name\} เรียบร้อยแล้ว`\)/, 'toast.success(tc("status.toggleSuccess"))');

// Toolbar
tbContent = tbContent.replace(/"หมวดหมู่ทั้งหมด"/g, 't("toolbar.all")');
tbContent = tbContent.replace(/"ค้นหาชื่อหมวดหมู่..."/g, 't("toolbar.search")');
tbContent = tbContent.replace(/>เพิ่มหมวดหมู่</g, '>{t("toolbar.add")}<');

// Loading state
tbContent = tbContent.replace(/"กำลังโหลดข้อมูล..."/g, 'tc("loading")');
tbContent = tbContent.replace(/"กำลังโหลด..."/g, 'tc("loading")');

// Dialog & Form
tbContent = tbContent.replace(/\{editingCategory \? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"\}/, '{editingCategory ? t("dialog.edit") : t("dialog.add")}');
tbContent = tbContent.replace(/>ชื่อหมวดหมู่</g, '>{t("form.name")}<');
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
    /export const columns: ColumnDef<CategoryType>\[\] = \[/,
    'export const getColumns = (t: any, tc: any): ColumnDef<CategoryType>[] => ['
);
colContent = colContent.replace(/header: "ชื่อ Category"/g, 'header: t("columns.name")');
colContent = colContent.replace(/header: "Shop"/g, 'header: t("columns.shop")');
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

fs.writeFileSync(colPath, colContent);

// Modify tb-category-list.tsx to use getColumns
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

console.log("Refactored category files");
