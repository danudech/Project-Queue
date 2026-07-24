import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({})));

    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    if (!body.OldPassword || !body.NewPassword) {
      return NextResponse.json(
        { status: false, message: "Missing passwords", data: null },
        { status: 400 },
      );
    }

    const changepassword = await api.post<boolean>("changepassword", {
      OldPassword: body.OldPassword,
      NewPassword: body.NewPassword,
    });

    return NextResponse.json({
      status: true,
      message: "Password changed successfully",
      data: changepassword,
    });
  } catch (error: any) {
    console.error("ChangePassword API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        status: false,
        message: error.response?.data?.message || error.response?.data?.Message || "Failed to change password",
        data: null,
      },
      { status: error.response?.status || 500 }
    );
  }
}
