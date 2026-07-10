const fs = require('fs');
const path = require('path');

const serviceListPath = path.join('d:', 'Code', 'Project-Queue', 'Frontend', 'src', 'app', '[locale]', '(user)', '(dashboard)', 'service', 'tb-sevice-list.tsx');

if (fs.existsSync(serviceListPath)) {
    let content = fs.readFileSync(serviceListPath, 'utf8');
    const lines = content.split('\n');
    lines.splice(59, 27, `const getFormSchema = (t: any) => z.object({
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
})`);
    
    fs.writeFileSync(serviceListPath, lines.join('\n'));
    console.log("Fixed tb-sevice-list.tsx Zod schema by line replacement");
}
