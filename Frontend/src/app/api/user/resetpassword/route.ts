import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { VerifyAccount } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({})));

    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    if (!body.NewPassword) {
      return NextResponse.json(
        { status: false, message: "Missing new password", data: null },
        { status: 400 },
      );
    }

    const resetpassword = await api.post<boolean>("resetpassword", {
      NewPassword: body.NewPassword,
    });

    return NextResponse.json({
      status: true,
      message: "success",
      data: resetpassword,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
