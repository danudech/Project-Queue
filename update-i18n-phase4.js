const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

const dashboardEn = {
    "title": "Dashboard Overview",
    "totalCustomers": "Total Customers",
    "totalBookings": "Total Bookings",
    "revenue": "Revenue",
    "recentActivity": "Recent Activity",
    "noActivity": "No recent activity"
};

const dashboardTh = {
    "title": "ภาพรวม",
    "totalCustomers": "ลูกค้าทั้งหมด",
    "totalBookings": "การจองทั้งหมด",
    "revenue": "รายได้",
    "recentActivity": "ความเคลื่อนไหวล่าสุด",
    "noActivity": "ไม่มีความเคลื่อนไหวล่าสุด"
};

enData.Dashboard = dashboardEn;
thData.Dashboard = dashboardTh;

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2));

console.log("Successfully updated en.json and th.json with Phase 4 keys.");
