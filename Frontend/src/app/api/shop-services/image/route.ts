import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { SetService } from "@/types/shop/service";

export async function POST(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return NextResponse.json({ status: false, message: "Unauthorized", data: null }, { status: 401 });
  try {
    const serviceId = Number(new URL(req.url).searchParams.get("serviceId"));
    const input = await req.formData();
    const image = input.get("Image");
    if (!Number.isInteger(serviceId) || serviceId <= 0 || !(image instanceof File)) return NextResponse.json({ status: false, message: "serviceId and Image are required", data: null }, { status: 400 });
    const upstream = new FormData();
    upstream.append("Image", image);
    const data = await serverHttp(req, env.apiBaseUrl).post<SetService>(`/api/v1/shop/services/${serviceId}/image` as "updateservices", upstream);
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    const value = error as { message?: string; status?: number };
    return NextResponse.json({ status: false, message: value.message ?? "Unable to upload service image", data: null }, { status: value.status ?? 500 });
  }
}
