import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || "0";
    
    const resp: any = await api.get("businesshours", { params: { branchId } });
    return NextResponse.json({ status: true, data: resp });
  } catch (error: any) {
    console.error("Get Business Hours Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = await req.json();
    
    const resp: any = await api.put("businesshours", body);
    return NextResponse.json({ status: true, data: resp });
  } catch (error: any) {
    console.error("Update Business Hours Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}
