import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './config';

function isExpired(expUtc?: string) {
  if (!expUtc) return true;
  const expMs = Date.parse(expUtc);
  if (!Number.isFinite(expMs)) return true;
  return Date.now() >= expMs;
}

// 🌐 สร้างตัวจัดการ i18n ไว้ข้างนอก middleware function
const handleI18nRouting = createMiddleware({
  locales: ['en', 'th'],
  defaultLocale: 'en',
  localePrefix: 'always' // แนะนำให้ใช้ตัวนี้เพื่อให้ path มี /en หรือ /th เสมอ
});

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. จัดการเรื่อง i18n ก่อน เพื่อให้ได้ Response ที่มีข้อมูล Locale
  const response = handleI18nRouting(request);

  // 2. หา Locale ปัจจุบันจาก Path
  const segments = pathname.split('/');
  const maybeLocale = locales.includes(segments[1] as any) ? segments[1] : 'en';
  
  // ลบ locale ออกเพื่อเช็ค path จริงๆ
  const pathWithoutLocale = locales.includes(segments[1] as any)
    ? '/' + segments.slice(2).join('/')
    : pathname;

  // 3. AUTH CHECK
  const token = request.cookies.get('access_token')?.value;
  const expUtc = request.cookies.get('access_expires_at_utc')?.value;
  const fullPath = pathname + search;

  // 👉 ถ้า login แล้ว แต่พยายามเข้าหน้า login ให้เด้งไปหน้าแรก
  if (pathWithoutLocale === '/auth/login' && token && !isExpired(expUtc)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${maybeLocale}/`;
    return NextResponse.redirect(url);
  }

  // 👉 ตรวจสอบ Protected Paths
  const protectedPaths = ['/dashboard', '/info'];
  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/')
  );

  if (isProtected) {
    if (!token || isExpired(expUtc)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${maybeLocale}/auth/login`; // แก้ path ให้ตรงกับโฟลเดอร์จริง
      url.searchParams.set('reason', 'expired');
      url.searchParams.set('returnUrl', fullPath);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/', 
    '/(th|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};