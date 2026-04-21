import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import NotFound from '@/app/[locale]/not-found';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    NotFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});