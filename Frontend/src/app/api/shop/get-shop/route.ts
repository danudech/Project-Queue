import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { ProfileUser } from "@/types/user";

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    
    const shop = await api.get("shopdata");

    return NextResponse.json({
      status: true,
      message: "ok",
      data: shop,
    });

  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}