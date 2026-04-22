import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { TokenType } from "@/types/auth/auth-response";

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const resrefresh = await api.get<TokenType>("refreshToken");
    if (resrefresh.accessToken == null || resrefresh.refreshToken == null || resrefresh.session == null) {
      return NextResponse.json(
        { status: false, message: "Invalid token response", data: null },
        { status: 500 },
      );
    }
    
    const res = NextResponse.json({
      status: true,
      message: "ok",
      data: resrefresh,
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("access_token", resrefresh.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("refresh_token", resrefresh.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    res.cookies.set("access_expires_at_utc", resrefresh.expiresAtUtc, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    res.cookies.set("session_key", resrefresh.session, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 },
    );
  }
}