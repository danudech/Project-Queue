import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    
    // Parse the incoming FormData
    const formData = await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        { status: false, message: "Invalid form data", data: null },
        { status: 400 },
      );
    }

    const resApi = await api.put<any>("updateshop", formData);

    return NextResponse.json({
      status: true,
      message: "Shop updated successfully",
      data: resApi,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
