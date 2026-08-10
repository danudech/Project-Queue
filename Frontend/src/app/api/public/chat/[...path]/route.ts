import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

type Params = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, { params }: Params) {
  try {
    const { path } = await params;
    const suffix = path.join("/");
    const query = new URL(request.url).search;
    const client = serverHttp(request, env.apiBaseUrl) as any;
    const endpoint = `/api/v1/public/chat/${suffix}${query}`;
    const contentType = request.headers.get("content-type") ?? "";
    const body = request.method === "GET" || request.method === "DELETE"
      ? undefined
      : contentType.includes("multipart/form-data")
        ? await request.formData()
        : await request.json().catch(() => undefined);
    const data = await client[request.method.toLowerCase()](endpoint, body);
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    const value = error as { message?: string; status?: number };
    return NextResponse.json({ status: false, message: value.message ?? "Chat request failed", data: null }, { status: value.status ?? 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
