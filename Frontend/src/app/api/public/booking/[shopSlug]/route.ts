import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { PublicBookingPage } from "@/types/public-booking";

type RouteContext = {
  params: Promise<{ shopSlug: string }>;
};

const failure = (error: unknown) => {
  const value = error as { message?: string; status?: number };
  return NextResponse.json(
    { status: false, message: value.message ?? "Unable to load booking page", data: null },
    { status: value.status ?? 500 },
  );
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { shopSlug } = await context.params;
    const search = new URL(request.url).searchParams;
    const branch = search.get("branch");
    const path = branch
      ? `/api/v1/public/booking/${encodeURIComponent(shopSlug)}/${encodeURIComponent(branch)}`
      : `/api/v1/public/booking/${encodeURIComponent(shopSlug)}`;
    const data = await serverHttp(request, env.apiBaseUrl).get<PublicBookingPage>(
      path as "publicBooking",
      {
        params: {
          serviceId: search.get("serviceId"),
          date: search.get("date"),
        },
      },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failure(error);
  }
}
