import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    const data = await serverHttp(request, env.apiBaseUrl).patch<boolean>(
      `/api/v1/notifications/${encodeURIComponent(notificationId)}/read` as "profile",
      {},
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    const value = error as { message?: string; status?: number };
    return NextResponse.json(
      { status: false, message: value.message ?? "Unable to update notification", data: null },
      { status: value.status ?? 500 },
    );
  }
}
