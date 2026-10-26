import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

async function forward(request: NextRequest) {
  if (!request.cookies.get("access_token")?.value) {
    return NextResponse.json({ status: false, message: "Unauthorized", data: null }, { status: 401 });
  }
  try {
    const api = serverHttp(request, env.apiBaseUrl);
    const data = request.method === "GET"
      ? await api.get("/api/v1/workspace" as "profile", { params: Object.fromEntries(request.nextUrl.searchParams), cache: "no-store" })
      : await api.post("/api/v1/workspace" as "profile", await request.json());
    return NextResponse.json({ status: true, message: "ok", data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const failure = error as { status?: number; message?: string };
    return NextResponse.json({ status: false, message: failure.message ?? "Unable to process request", data: null }, { status: failure.status ?? 500 });
  }
}
export const GET = forward;
export const POST = forward;
