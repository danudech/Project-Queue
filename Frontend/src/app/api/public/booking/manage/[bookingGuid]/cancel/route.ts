import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { PublicBookingManagement } from "@/types/public-booking";

type RouteContext = {
  params: Promise<{ bookingGuid: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { bookingGuid } = await context.params;
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const path = `/api/v1/public/booking/manage/${encodeURIComponent(bookingGuid)}/cancel`;
    const data = await serverHttp(request, env.apiBaseUrl).post<PublicBookingManagement>(
      path as "publicBooking",
      {},
      { params: { token } },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    const value = error as { message?: string; status?: number };
    return NextResponse.json(
      { status: false, message: value.message ?? "Unable to cancel booking", data: null },
      { status: value.status ?? 500 },
    );
  }
}
