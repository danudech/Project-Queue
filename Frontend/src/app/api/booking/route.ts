import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { BookingDto, CreateBookingDto } from "@/types/booking";

const fail = (e: unknown) => { const x = e as { message?: string; status?: number }; return NextResponse.json({ status: false, message: x.message ?? "Booking request failed", data: null }, { status: x.status ?? 500 }); };
export async function GET(req: NextRequest) {
  try { const p = new URL(req.url).searchParams; const data = await serverHttp(req, env.apiBaseUrl).get<BookingDto[]>("bookings", { params: { branchId: p.get("branchId") } }); return NextResponse.json({ status: true, message: "ok", data }); } catch (e) { return fail(e); }
}
export async function POST(req: NextRequest) {
  try { const data = await serverHttp(req, env.apiBaseUrl).post<BookingDto>("bookings", await req.json() as CreateBookingDto); return NextResponse.json({ status: true, message: "ok", data }); } catch (e) { return fail(e); }
}
export async function PATCH(req: NextRequest) {
  try { const body = await req.json() as { id: number; status: string; staffId?: number }; const data = await serverHttp(req, env.apiBaseUrl).patch<BookingDto>("bookings", body, { params: { bookingId: body.id } }); return NextResponse.json({ status: true, message: "ok", data }); } catch (e) { return fail(e); }
}
