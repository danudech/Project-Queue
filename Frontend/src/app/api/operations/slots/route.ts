import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { AvailableSlotDto } from "@/types/booking";

export async function GET(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return NextResponse.json({ status: false, message: "Unauthorized", data: null }, { status: 401 });
  try {
    const params = new URL(req.url).searchParams;
    const data = await serverHttp(req, env.apiBaseUrl).get<AvailableSlotDto[]>("slots", {
      params: {
        branchId: params.get("branchId"),
        date: params.get("date"),
        serviceId: params.get("serviceId"),
      },
    });
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) {
    const error = e as { message?: string; status?: number };
    return NextResponse.json({ status: false, message: error.message ?? "Unable to load slots", data: null }, { status: error.status ?? 500 });
  }
}
