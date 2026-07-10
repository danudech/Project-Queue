const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

const customerEn = {
    "validation": { "nameRequired": "Please enter customer name", "nameTooLong": "Name is too long (max 150)", "phoneRequired": "Please enter phone number", "phoneTooLong": "Phone is too long (max 20)" },
    "steps": { "info": "Customer Info", "booking": "Book Queue" },
    "toast": { "deleteSuccess": "Customer deleted successfully", "editSuccess": "Customer updated successfully", "addSuccess": "Customer added successfully" },
    "toolbar": { "all": "All Customers", "search": "Search customer name...", "add": "Add Customer" },
    "dialog": { "edit": "Edit Customer", "add": "Add New Customer" },
    "form": { "name": "Customer Name", "phone": "Phone Number", "bookTogether": "Book Queue Also" },
    "columns": { "name": "Customer Name", "phone": "Phone Number", "createdAt": "Created At" },
    "confirm": { "delete": "Are you sure you want to delete this customer?" },
    "booking": { "dateLabel": "Appointment Date", "summary": "Summary" }
};

const customerTh = {
    "validation": { "nameRequired": "กรุณากรอกชื่อลูกค้า", "nameTooLong": "ชื่อยาวเกิน 150 ตัวอักษร", "phoneRequired": "กรุณากรอกเบอร์โทรศัพท์", "phoneTooLong": "เบอร์โทรยาวเกิน 20 ตัวอักษร" },
    "steps": { "info": "ข้อมูลลูกค้า", "booking": "จองคิว" },
    "toast": { "deleteSuccess": "ลบลูกค้าสำเร็จ", "editSuccess": "แก้ไขข้อมูลลูกค้าสำเร็จ", "addSuccess": "เพิ่มลูกค้าสำเร็จ" },
    "toolbar": { "all": "ลูกค้าทั้งหมด", "search": "ค้นหาชื่อลูกค้า...", "add": "เพิ่มลูกค้า" },
    "dialog": { "edit": "แก้ไขข้อมูลลูกค้า", "add": "เพิ่มลูกค้าใหม่" },
    "form": { "name": "ชื่อลูกค้า", "phone": "เบอร์โทรศัพท์", "bookTogether": "จองคิวพร้อมกัน" },
    "columns": { "name": "ชื่อลูกค้า", "phone": "เบอร์โทรศัพท์", "createdAt": "วันที่สร้าง" },
    "confirm": { "delete": "คุณต้องการลบลูกค้านี้ใช่หรือไม่?" },
    "booking": { "dateLabel": "วันที่นัดหมาย", "summary": "สรุปรายการ" }
};

const serviceEn = {
    "validation": { "nameRequired": "Please enter service name", "nameTooLong": "Name is too long (max 150)", "shopRequired": "Please select a shop", "durationRequired": "Please enter duration", "durationInt": "Must be an integer", "durationMin": "Duration must be greater than 0", "priceRequired": "Please enter price", "priceMin": "Price cannot be negative", "categoryRequired": "Please select a category" },
    "toast": { "deleteSuccess": "Service deleted successfully", "editSuccess": "Service updated successfully", "addSuccess": "Service added successfully" },
    "toolbar": { "all": "All Services", "search": "Search service name...", "add": "Add Service" },
    "dialog": { "edit": "Edit Service", "add": "Add New Service" },
    "form": { "name": "Service Name", "duration": "Duration (minutes)", "price": "Price", "category": "Category", "shop": "Shop" },
    "columns": { "name": "Service Name", "duration": "Duration", "price": "Price", "createdAt": "Created At" },
    "confirm": { "delete": "Are you sure you want to delete this service?" }
};

const serviceTh = {
    "validation": { "nameRequired": "กรุณากรอกชื่อบริการ", "nameTooLong": "ชื่อยาวเกิน 150 ตัวอักษร", "shopRequired": "กรุณาเลือกร้านค้า", "durationRequired": "กรุณากรอกระยะเวลา", "durationInt": "ต้องเป็นจำนวนเต็ม", "durationMin": "ระยะเวลาต้องมากกว่า 0", "priceRequired": "กรุณากรอกราคา", "priceMin": "ราคาต้องไม่ติดลบ", "categoryRequired": "กรุณาเลือกหมวดหมู่" },
    "toast": { "deleteSuccess": "ลบข้อมูลสำเร็จ", "editSuccess": "แก้ไขข้อมูลสำเร็จ", "addSuccess": "เพิ่มข้อมูลสำเร็จ" },
    "toolbar": { "all": "บริการทั้งหมด", "search": "ค้นหาชื่อบริการ...", "add": "เพิ่มบริการ" },
    "dialog": { "edit": "แก้ไขบริการ", "add": "เพิ่มบริการใหม่" },
    "form": { "name": "ชื่อบริการ", "duration": "ระยะเวลา (นาที)", "price": "ราคา", "category": "หมวดหมู่", "shop": "ร้านค้า" },
    "columns": { "name": "ชื่อบริการ", "duration": "ระยะเวลา", "price": "ราคา", "createdAt": "วันที่สร้าง" },
    "confirm": { "delete": "คุณต้องการลบข้อมูลนี้ใช่หรือไม่?" }
};

const categoryEn = {
    "validation": { "nameRequired": "Please enter category name", "nameTooLong": "Name is too long (max 150)", "shopRequired": "Please select a shop" },
    "toast": { "deleteSuccess": "Category deleted successfully", "editSuccess": "Category updated successfully", "addSuccess": "Category added successfully" },
    "toolbar": { "all": "All Categories", "search": "Search category name...", "add": "Add Category" },
    "dialog": { "edit": "Edit Category", "add": "Add New Category" },
    "form": { "name": "Category Name", "shop": "Shop" },
    "columns": { "name": "Category Name", "shop": "Shop", "createdAt": "Created At" },
    "confirm": { "delete": "Are you sure you want to delete this category?" }
};

const categoryTh = {
    "validation": { "nameRequired": "กรุณากรอกชื่อหมวดหมู่", "nameTooLong": "ชื่อยาวเกิน 150 ตัวอักษร", "shopRequired": "กรุณาเลือกร้านค้า" },
    "toast": { "deleteSuccess": "ลบหมวดหมู่สำเร็จ", "editSuccess": "แก้ไขหมวดหมู่สำเร็จ", "addSuccess": "เพิ่มหมวดหมู่สำเร็จ" },
    "toolbar": { "all": "หมวดหมู่ทั้งหมด", "search": "ค้นหาชื่อหมวดหมู่...", "add": "เพิ่มหมวดหมู่" },
    "dialog": { "edit": "แก้ไขหมวดหมู่", "add": "เพิ่มหมวดหมู่ใหม่" },
    "form": { "name": "ชื่อหมวดหมู่", "shop": "ร้านค้า" },
    "columns": { "name": "ชื่อหมวดหมู่", "shop": "ร้านค้า", "createdAt": "วันที่สร้าง" },
    "confirm": { "delete": "คุณต้องการลบข้อมูลนี้ใช่หรือไม่?" }
};

enData.customer = customerEn;
thData.customer = customerTh;
enData.service = serviceEn;
thData.service = serviceTh;
enData.category = categoryEn;
thData.category = categoryTh;

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2));

console.log("Successfully updated en.json and th.json with customer, service, and category keys.");
