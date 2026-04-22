import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { StatusRegister, UserRegister, UserRegisterResponse } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({})));

    if (!body.email || !body.locale) {
      return NextResponse.json(
        { status: false, message: "Missing email or locale", data: null },
        { status: 400 },
      );
    }

    const frombody = {
      Email: body.email,
      Locale: body.locale,
    };

    await api.post<boolean>("forgotpassword", frombody);

    const res = NextResponse.json({
      status: true,
      message: "forgot password request sent",
      data: true,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
