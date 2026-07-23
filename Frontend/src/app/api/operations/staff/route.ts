import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type { SaveStaffMember, StaffMember } from "@/types/shop/staff";

const unauthorized = () => NextResponse.json({ status: false, message: "Unauthorized", data: null }, { status: 401 });
const failed = (e: unknown) => {
  const error = e as { message?: string; status?: number };
  return NextResponse.json({ status: false, message: error.message ?? "Unable to process staff request", data: null }, { status: error.status ?? 500 });
};

export async function GET(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();
  try {
    const params = new URL(req.url).searchParams;
    const key = params.get("serviceId") && params.get("eligible") === "true" ? "eligiblestaff" : "staff";
    const data = await serverHttp(req, env.apiBaseUrl).get<StaffMember[]>(key, { params: { branchId: params.get("branchId"), serviceId: params.get("serviceId") } });
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) { return failed(e); }
}

export async function POST(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();
  try {
    const body = await req.json() as SaveStaffMember;
    const data = await serverHttp(req, env.apiBaseUrl).post<StaffMember>("staff", body);
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) { return failed(e); }
}

export async function PUT(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();
  try {
    const body = await req.json() as SaveStaffMember;
    const data = await serverHttp(req, env.apiBaseUrl).put<StaffMember>("staff", body);
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) { return failed(e); }
}

export async function DELETE(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();
  try {
    const id = new URL(req.url).searchParams.get("staffId");
    if (!id) return NextResponse.json({ status: false, message: "staffId is required", data: null }, { status: 400 });
    const data = await serverHttp(req, env.apiBaseUrl).delete<boolean>(`/api/v1/operations/staff/${id}` as "staff");
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (e) { return failed(e); }
}
