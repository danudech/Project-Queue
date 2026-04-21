import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const res = NextResponse.json({
      status: true,
      message: "signed out",
      data: null,
    });

    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    res.cookies.delete("access_expires_at_utc");
    res.cookies.delete("session_key");

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
