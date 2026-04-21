import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { UserRegister } from "@/types/user";

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

    const resentconfirm = await api.post<string>("resendconfirmation", frombody);

    const res = NextResponse.json({
      status: true,
      message: "Confirmation email resent if the email is registered",
      data: resentconfirm,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
