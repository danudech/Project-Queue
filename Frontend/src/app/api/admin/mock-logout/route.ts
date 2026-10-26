import { NextRequest, NextResponse } from "next/server";
import { ADMIN_MOCK_COOKIE } from "@/config/admin-mock";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ status: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_MOCK_COOKIE, "", {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

