import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "./config";

import { isExpired } from "./utils/token";

const handleI18nRouting = createMiddleware({
  locales: ["en", "th"],
  defaultLocale: "en",
});

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const response = handleI18nRouting(request);

  const segments = pathname.split("/");
  const cookieLocale = request.cookies.get("locale")?.value;

  const maybeLocale =
    cookieLocale && locales.includes(cookieLocale as any)
      ? cookieLocale
      : locales.includes(segments[1] as any)
        ? segments[1]
        : "en";

  const pathWithoutLocale = locales.includes(segments[1] as any)
    ? "/" + segments.slice(2).join("/")
    : pathname;

  const token = request.cookies.get("access_token")?.value;
  const expUtc = request.cookies.get("access_expires_at_utc")?.value;
  const fullPath = pathname + search;

  // Note
  if (pathWithoutLocale === "/auth/login" && token && !isExpired(expUtc)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${maybeLocale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // 👉 protected routes
  const protectedPaths = [
    "/auth/resetpassword",
    "/dashboard",
    "/info",
    "/service",
    "/queue",
    "/booking",
    "/customer",
    "/setting",
    "/notification",
    "/account",
  ];
  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/"),
  );

  if (isProtected) {
    if (!token || isExpired(expUtc)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${maybeLocale}/auth/login`;
      url.searchParams.set("reason", "expired");
      url.searchParams.set("returnUrl", fullPath);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(th|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
