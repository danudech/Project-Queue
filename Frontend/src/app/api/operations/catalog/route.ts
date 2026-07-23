import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { SetService } from "@/types/shop/service";

export async function GET(req: NextRequest) {
  try {
    const branchId = new URL(req.url).searchParams.get("branchId");
    const data = await serverHttp(req, env.apiBaseUrl).get<SetService[]>("catalog", { params: { branchId } });
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) {
    const error = e as { message?: string; status?: number };
    return NextResponse.json({ status: false, message: error.message ?? "Unable to load services", data: null }, { status: error.status ?? 500 });
  }
}
