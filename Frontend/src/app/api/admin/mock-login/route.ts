import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_MOCK_COOKIE,
  ADMIN_MOCK_COOKIE_VALUE,
  ADMIN_MOCK_EMAIL,
  ADMIN_MOCK_PASSWORD,
  ADMIN_MOCK_PERMISSIONS,
} from "@/config/admin-mock";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;

  if (body?.email?.trim().toLowerCase() !== ADMIN_MOCK_EMAIL || body?.password !== ADMIN_MOCK_PASSWORD) {
    return NextResponse.json({ status: false, message: "Invalid mock administrator credentials" }, { status: 401 });
  }

  const response = NextResponse.json({
    status: true,
    user: { email: ADMIN_MOCK_EMAIL, role: "PlatformAdminMock", permissions: ADMIN_MOCK_PERMISSIONS },
  });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_MOCK_COOKIE, ADMIN_MOCK_COOKIE_VALUE, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return response;
}

