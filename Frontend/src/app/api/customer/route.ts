import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { ServiceCategoryType, SetCategory } from "@/types/shop/catgory";
import { CustomerType } from "@/types/shop/customer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unauthorized() {
  return NextResponse.json(
    { status: false, message: "Unauthorized", data: null },
    { status: 401 }
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    { status: false, message, data: null },
    { status: 400 }
  );
}

// ─── GET — ดึงรายการ Category ทั้งหมด ────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const customers = await api.get<CustomerType[]>("customer");

    return NextResponse.json({ status: true, message: "ok", data: customers });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── POST — เพิ่ม Customer ใหม่ ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as CustomerType;

    if (!body.name) return badRequest("Missing customer name");

    const newCustomer = await api.post<CustomerType>("newcustomer", body);

    return NextResponse.json({
      status: !!newCustomer,
      message: "ok",
      data: newCustomer as CustomerType,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── PUT — แก้ไข Customer ────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as CustomerType;

    if (!body.name) return badRequest("Missing customer name");

    const updatedCustomer = await api.put<CustomerType>("updatecustomer", body);

    return NextResponse.json({
      status: !!updatedCustomer,
      message: "ok",
      data: updatedCustomer as CustomerType,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── DELETE — ลบ Customer ────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const customerId = new URL(req.url).searchParams.get("customerId");

    if (!customerId) return badRequest("customerId is required");

    await api.delete<boolean>("deletecustomer", { params: { customerId } });

    return NextResponse.json({ status: true, message: "ok", data: [] });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}