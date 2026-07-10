const fs = require('fs');
const path = require('path');

const serviceListPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service', 'tb-sevice-list.tsx');

if (fs.existsSync(serviceListPath)) {
    let content = fs.readFileSync(serviceListPath, 'utf8');
    
    const startMarker = `const getFormSchema = (t: any) => z.object({`;
    const endMarker = `isActive: z.boolean(),\n})`;
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker) + endMarker.length;
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const replacement = `const getFormSchema = (t: any) => z.object({
    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),
    shopId: z.number().min(1, t("validation.shopRequired")),
    duration: z.coerce.number({
        required_error: t("validation.durationRequired"),
        invalid_type_error: t("validation.durationInt"),
    }).min(1, t("validation.durationMin")),
    price: z.coerce.number({
        required_error: t("validation.priceRequired"),
        invalid_type_error: t("validation.durationInt"),
    }).min(0, t("validation.priceMin")),
    categoryId: z.number().min(1, t("validation.categoryRequired")),
    isActive: z.boolean().default(true),
})`;
        content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
        
        // Also check if `is_active: z.boolean().default(true)` was inside `tb-category-list.tsx` and fix it to `isActive`
        // Wait, did I mess up category list too? Let's fix service list first.
        fs.writeFileSync(serviceListPath, content);
        console.log("Fixed tb-sevice-list.tsx Zod schema");
    } else {
        console.log("Could not find markers in tb-sevice-list.tsx");
    }
}
