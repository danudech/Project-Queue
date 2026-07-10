const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'en.json');
const thPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'messages', 'th.json');
const fileToFix = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'components', 'partials', 'sidebar', 'common', 'team-switcher.tsx');

// Add translation keys
[ {p: enPath, isEn: true}, {p: thPath, isEn: false} ].forEach(({p, isEn}) => {
    if (fs.existsSync(p)) {
        let json = JSON.parse(fs.readFileSync(p, 'utf8'));
        
        if (!json.Shop) json.Shop = {};
        json.Shop.addNewShop = isEn ? "Add New Shop" : "เพิ่มร้านค้าใหม่";
        json.Shop.addNewBranch = isEn ? "Add New Branch" : "เพิ่มสาขาใหม่";
        json.Shop.myShop = isEn ? "My Shop" : "ร้านของฉัน";
        json.Shop.selectBranch = isEn ? "Select Branch" : "เลือกสาขา";
        
        fs.writeFileSync(p, JSON.stringify(json, null, 2));
    }
});

// Update the TSX file
if (fs.existsSync(fileToFix)) {
    let content = fs.readFileSync(fileToFix, 'utf8');
    
    // Line 577 and 615
    content = content.replace(/toast\.error\("เกิดข้อผิดพลาด กรุณาลองใหม่"\)/g, 'toast.error(t("createShopFailed"))');
    
    // Line 721
    content = content.replace(/ร้านของฉัน/g, '{t("myShop")}');
    
    // Line 733
    content = content.replace(/เลือกสาขา/g, '{t("selectBranch")}');
    
    // Line 780
    content = content.replace(/เพิ่มสาขาใหม่/g, '{t("addNewBranch")}');
    
    // Line 790
    content = content.replace(/เพิ่มร้านค้าใหม่/g, '{t("addNewShop")}');
    
    fs.writeFileSync(fileToFix, content);
    console.log("Fixed team-switcher.tsx and translation files");
}
