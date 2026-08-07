import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { TokenType, UserResponse } from "@/types/auth/auth-response";
import { UserLogin } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = await req.json().catch(() => ({})) as UserLogin;

    if (!body.email || !body.password) {
      return NextResponse.json(
        { status: false, message: "Missing email or password", data: null },
        { status: 400 },
      );
    }
    const frombody = {
      EmailOrPhone: body.email,
      password: body.password,
    }

    const loginres = await api.post<UserResponse>("userlogin", frombody);

    if (
      !loginres.tokenData.accessToken ||
      !loginres.tokenData.refreshToken ||
      !loginres.tokenData.session
    ) {
      return NextResponse.json(
        { status: false, message: loginres.message || "Invalid token response", data: null },
        { status: 500 },
      );
    }

    const res = NextResponse.json({
      status: true,
      message: "ok",
      data: loginres.userData,
    });
    res.headers.set("Cache-Control", "no-store");

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("access_token", loginres.tokenData.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("refresh_token", loginres.tokenData.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    res.cookies.set("access_expires_at_utc", loginres.tokenData.expiresAtUtc, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    res.cookies.set("session_key", loginres.tokenData.session, {
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
