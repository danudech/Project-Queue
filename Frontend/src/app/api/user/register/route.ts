import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { StatusRegister, UserRegister } from "@/types/profile-user";

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
    };

    const loginres = await api.post<StatusRegister>("register", frombody);

    const res = NextResponse.json({
      status: true,
      message: "ok",
      data: loginres,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
