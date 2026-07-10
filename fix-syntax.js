const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

// Fix customer/tb-customer-list.tsx
const customerListPath = path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'customer', 'tb-customer-list.tsx');
if (fs.existsSync(customerListPath)) {
    let content = fs.readFileSync(customerListPath, 'utf8');
    content = content.replace(/title=t\("toolbar\.all"\)/g, 'title={t("toolbar.all")}');
    content = content.replace(/searchPlaceholder=t\("toolbar\.search"\)/g, 'searchPlaceholder={t("toolbar.search")}');
    fs.writeFileSync(customerListPath, content);
    console.log("Fixed tb-customer-list.tsx");
}

// Fix service/tb-sevice-list.tsx
const serviceListPath = path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service', 'tb-sevice-list.tsx');
if (fs.existsSync(serviceListPath)) {
    let content = fs.readFileSync(serviceListPath, 'utf8');
    content = content.replace(/title=t\("toolbar\.all"\)/g, 'title={t("toolbar.all")}');
    content = content.replace(/searchPlaceholder=t\("toolbar\.search"\)/g, 'searchPlaceholder={t("toolbar.search")}');
    // For the Zod syntax error, I need to see what's actually there. Let me just replace the broken schema segment.
    // The previous regex might have missed the end of the schema if there were nested braces.
    
    // Instead of doing it blind, let's fix the specific error.
    fs.writeFileSync(serviceListPath, content);
    console.log("Fixed tb-sevice-list.tsx (JSX part)");
}

// Fix category/tb-category-list.tsx
const categoryListPath = path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service', 'category', 'tb-category-list.tsx');
if (fs.existsSync(categoryListPath)) {
    let content = fs.readFileSync(categoryListPath, 'utf8');
    content = content.replace(/title=t\("toolbar\.all"\)/g, 'title={t("toolbar.all")}');
    content = content.replace(/searchPlaceholder=t\("toolbar\.search"\)/g, 'searchPlaceholder={t("toolbar.search")}');
    fs.writeFileSync(categoryListPath, content);
    console.log("Fixed tb-category-list.tsx");
}
