import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = await req.formData();
    
    const resp: any = await api.put("updatebranch", body);
    
    return NextResponse.json(resp);
  } catch (error: any) {
    console.error("Update Branch Error:", error);
    return NextResponse.json(
      { message: error?.response?.data?.message || "An error occurred" },
      { status: error?.response?.status || 500 }
    );
  }
}
