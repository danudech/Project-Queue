import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import NotFound from '@/app/[locale]/not-found';

export default getRequestConfig(async ({ requestLocale }) => {
  // ✅ 1. ต้องรอ (await) ค่าจาก requestLocale
  const locale = await requestLocale;

  // 🔍 2. ลอง Log ดูอีกรอบ อันนี้ต้องไม่ undefined แล้ว
  console.log('Current Locale:', locale);

  // 3. Validate ว่า locale มีในระบบไหม
  if (!locale || !routing.locales.includes(locale as any)) {
    NotFound();
  }

  return {
    locale: locale as string,
    // 4. Import ไฟล์ข้อความ
    messages: (await import(`../messages/${locale}.json`)).default
  };
});