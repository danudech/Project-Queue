import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type {
  PublicBookingConfirmation,
  PublicBookingPage,
} from "@/types/public-booking";

type RouteContext = {
  params: Promise<{ shopSlug: string; branchPublicId: string }>;
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
    const { shopSlug, branchPublicId } = await context.params;
    const search = new URL(request.url).searchParams;
    const path = `/api/v1/public/booking/${encodeURIComponent(shopSlug)}/${encodeURIComponent(branchPublicId)}`;
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { shopSlug, branchPublicId } = await context.params;
    const path = `/api/v1/public/booking/${encodeURIComponent(shopSlug)}/${encodeURIComponent(branchPublicId)}`;
    const data = await serverHttp(request, env.apiBaseUrl).post<PublicBookingConfirmation>(
      path as "publicBooking",
      await request.json(),
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failure(error);
  }
}
