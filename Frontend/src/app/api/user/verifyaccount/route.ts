import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { VerifyAccount } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({}))) as VerifyAccount;

    if (!body.token) {
      return NextResponse.json(
        { status: false, message: "Missing token", data: null },
        { status: 400 },
      );
    }

    const verifyres = await api.post<boolean>("verifyaccount", {
      Token: body.token,
    });

    return NextResponse.json({
      status: true,
      message: "success",
      data: verifyres,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
