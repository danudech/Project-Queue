import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

type StaffInviteBody = {
  staffId: number;
  locale: string;
};

export async function POST(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) {
    return NextResponse.json(
      { status: false, message: "Unauthorized", data: null },
      { status: 401 },
    );
  }

  try {
    const body = (await req.json()) as StaffInviteBody;
    if (!body.staffId) {
      return NextResponse.json(
        { status: false, message: "staffId is required", data: null },
        { status: 400 },
      );
    }

    const data = await serverHttp(req, env.apiBaseUrl).post<string>(
      "staffinvite",
      body,
      {
        headers: {
          Origin: req.headers.get("origin") ?? new URL(req.url).origin,
        },
      },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    const requestError = error as { message?: string; status?: number };
    return NextResponse.json(
      {
        status: false,
        message: requestError.message ?? "Unable to send staff invitation",
        data: null,
      },
      { status: requestError.status ?? 500 },
    );
  }
}
