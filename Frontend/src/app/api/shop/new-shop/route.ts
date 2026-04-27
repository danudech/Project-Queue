import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { StatusRegister, UserRegister, UserRegisterResponse } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({}))) as UserRegister;

    if (!body.name || !body.email) {
      return NextResponse.json(
        { status: false, message: "Missing name or email", data: null },
        { status: 400 },
      );
    }
    const frombody = {
      Name: body.name,
      Email: body.email,
      Phone: body.phone,
      AcceptTerms: body.acceptTerms,
      Locale: body.locale,
    };

    const loginres = await api.post<UserRegisterResponse>("register", frombody);

    const res = NextResponse.json({
      status: loginres?.success ?? false,
      message: loginres?.message ?? "ok",
      data: {
        success: loginres?.success ?? false,
        code: loginres?.code ?? "error",
        message: loginres?.message ?? "",
      } as UserRegisterResponse,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
