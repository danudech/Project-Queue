import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || "0";
    
    const resp: any = await api.get("holidays", { params: { branchId } });
    return NextResponse.json({ status: true, data: resp });
  } catch (error: any) {
    console.error("Get Holidays Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = await req.json();
    
    const resp: any = await api.post("holidays", body);
    return NextResponse.json({ status: true, data: resp });
  } catch (error: any) {
    console.error("Add Holiday Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const { searchParams } = new URL(req.url);
    const holidayId = searchParams.get("holidayId") || "0";
    
    const resp: any = await api.delete("holidays", { params: { holidayId } });
    return NextResponse.json({ status: true, data: resp });
  } catch (error: any) {
    console.error("Delete Holiday Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}
