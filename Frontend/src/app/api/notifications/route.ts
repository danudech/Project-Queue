import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { NotificationDto } from "@/types/notification";

const failure = (error: unknown) => {
  const value = error as { message?: string; status?: number };
  return NextResponse.json(
    { status: false, message: value.message ?? "Unable to load notifications", data: null },
    { status: value.status ?? 500 },
  );
};

export async function GET(request: NextRequest) {
  try {
    const limit = new URL(request.url).searchParams.get("limit") ?? "20";
    const data = await serverHttp(request, env.apiBaseUrl).get<NotificationDto[]>(
      "/api/v1/notifications" as "profile",
      { params: { limit } },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await serverHttp(request, env.apiBaseUrl).patch<number>(
      "/api/v1/notifications/read-all" as "profile",
      {},
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failure(error);
  }
}
