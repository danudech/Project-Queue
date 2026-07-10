const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

const commonEn = {
    "save": "Save", "saving": "Saving...", "saved": "Saved", "cancel": "Cancel", "back": "Back", "next": "Next", "reset": "Reset",
    "loading": "Loading...", "search": "Search", "addData": "Add Data", "optional": "(Optional)", "saveData": "Save data",
    "viewAll": "View all", "today": "Today", "menu": "Menu", "noResults": "No results found.",
    "error": { "loadFailed": "Load failed", "saveFailed": "Save failed", "deleteFailed": "Delete failed", "statusChangeFailed": "Status change failed", "tryAgain": "Please try again" },
    "status": { "active": "Active", "inactive": "Inactive", "toggleSuccess": "Status changed successfully" },
    "tooltip": { "edit": "Edit", "delete": "Delete", "activate": "Activate", "deactivate": "Deactivate" },
    "columns": { "status": "Status", "action": "Action" },
    "form": { "statusLabel": "Usage status" },
    "units": { "minutes": "minutes", "timeSuffix": "AM/PM" },
    "calendar": { "daysShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }
};

const commonTh = {
    "save": "บันทึก", "saving": "กำลังบันทึก...", "saved": "บันทึกแล้ว", "cancel": "ยกเลิก", "back": "ย้อนกลับ", "next": "ถัดไป", "reset": "รีเซ็ต",
    "loading": "กำลังโหลด...", "search": "ค้นหา", "addData": "เพิ่มข้อมูล", "optional": "(ไม่บังคับ)", "saveData": "บันทึกข้อมูล",
    "viewAll": "ดูทั้งหมด", "today": "วันนี้", "menu": "เมนู", "noResults": "ไม่พบข้อมูล",
    "error": { "loadFailed": "โหลดข้อมูลไม่สำเร็จ", "saveFailed": "เกิดข้อผิดพลาดในการบันทึก", "deleteFailed": "ลบไม่สำเร็จ", "statusChangeFailed": "ไม่สามารถเปลี่ยนสถานะได้", "tryAgain": "กรุณาลองใหม่" },
    "status": { "active": "เปิดใช้งาน", "inactive": "ปิดใช้งาน", "toggleSuccess": "เปลี่ยนสถานะเรียบร้อยแล้ว" },
    "tooltip": { "edit": "แก้ไข", "delete": "ลบข้อมูล", "activate": "เปิดการใช้งาน", "deactivate": "ปิดการใช้งาน" },
    "columns": { "status": "Status", "action": "Action" },
    "form": { "statusLabel": "สถานะการใช้งาน" },
    "units": { "minutes": "นาที", "timeSuffix": "น." },
    "calendar": { "daysShort": ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] }
};

if (!enData.Common) enData.Common = {};
if (!thData.Common) thData.Common = {};
Object.assign(enData.Common, commonEn);
Object.assign(thData.Common, commonTh);

const shopEnAdditions = {
    "day_monday": "Monday", "day_tuesday": "Tuesday", "day_wednesday": "Wednesday", "day_thursday": "Thursday", "day_friday": "Friday", "day_saturday": "Saturday", "day_sunday": "Sunday",
    "validation_shopNameMin": "Shop name must be at least 2 characters", "validation_selectBusinessType": "Please select a business type", "validation_branchNameMin": "Branch name must be at least 2 characters",
    "validation_phoneFormat": "Phone must be 10 digits starting with 0", "validation_zipcodeLength": "Zipcode must be 5 digits", "validation_selectSubdistrict": "Please select a subdistrict",
    "step_shopInfo": "Shop Info", "step_branchInfo": "Branch Info", "step_businessHours": "Business Hours", "creating": "Creating...", "defaultBranchName": "Main Branch",
    "branchName": "Branch Name", "branchNamePlaceholder": "e.g., Main Branch, Sukhumvit Branch", "branchPhone": "Branch Phone", "branchAddress": "Branch Address",
    "houseNo": "House No.", "street": "Street", "zipcode": "Zipcode", "subdistrict": "Subdistrict", "selectSubdistrict": "Select Subdistrict", "district": "District", "province": "Province",
    "businessHoursLabel": "Business Hours", "openAllDays": "Open Every Day", "copyFirstDayHours": "Copy hours from first day", "dayOff": "Day Off",
    "editHoursNote": "* Business hours can be edited later in shop settings", "createShopSuccess": "Shop created successfully!", "createShopFailed": "Failed to create shop",
    "addBranchSuccess": "Branch added successfully!", "addBranchFailed": "Failed to add branch", "addBranch": "Add Branch"
};

const shopThAdditions = {
    "day_monday": "จันทร์", "day_tuesday": "อังคาร", "day_wednesday": "พุธ", "day_thursday": "พฤหัส", "day_friday": "ศุกร์", "day_saturday": "เสาร์", "day_sunday": "อาทิตย์",
    "validation_shopNameMin": "ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร", "validation_selectBusinessType": "กรุณาเลือกประเภทธุรกิจ", "validation_branchNameMin": "ชื่อสาขาต้องมีอย่างน้อย 2 ตัวอักษร",
    "validation_phoneFormat": "เบอร์โทรต้องมี 10 หลักและขึ้นต้นด้วย 0", "validation_zipcodeLength": "รหัสไปรษณีย์ต้องมี 5 หลัก", "validation_selectSubdistrict": "กรุณาเลือกตำบล",
    "step_shopInfo": "ข้อมูลร้าน", "step_branchInfo": "ข้อมูลสาขา", "step_businessHours": "เวลาทำการ", "creating": "กำลังสร้าง...", "defaultBranchName": "สาขาหลัก",
    "branchName": "ชื่อสาขา", "branchNamePlaceholder": "เช่น สาขาหลัก, สาขาสุขุมวิท", "branchPhone": "เบอร์โทรสาขา", "branchAddress": "ที่อยู่สาขา",
    "houseNo": "บ้านเลขที่", "street": "ถนน", "zipcode": "รหัสไปรษณีย์", "subdistrict": "ตำบล / แขวง", "selectSubdistrict": "เลือกตำบล", "district": "เขต / อำเภอ", "province": "จังหวัด",
    "businessHoursLabel": "วันและเวลาทำการ", "openAllDays": "เปิดทุกวัน", "copyFirstDayHours": "copy เวลาจากวันแรก", "dayOff": "วันหยุด",
    "editHoursNote": "* แก้ไขเวลาทำการได้ในหน้าตั้งค่าร้าน", "createShopSuccess": "สร้างร้านค้าสำเร็จ!", "createShopFailed": "สร้างร้านค้าไม่สำเร็จ",
    "addBranchSuccess": "เพิ่มสาขาสำเร็จ!", "addBranchFailed": "เพิ่มสาขาไม่สำเร็จ", "addBranch": "เพิ่มสาขา"
};

Object.assign(enData.Shop, shopEnAdditions);
Object.assign(thData.Shop, shopThAdditions);

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2));

console.log("Successfully updated en.json and th.json with Common and Shop keys.");
