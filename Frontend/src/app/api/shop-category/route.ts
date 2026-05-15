import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { ServiceCategoryType, SetCategory } from "@/types/shop/catgory";

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

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const branchId = searchParams.get("branchId");

    const shopcategory = await api.get<ServiceCategoryType[]>("shopcategory", {
      params: {
        ...(shopId && { shopId }),
        ...(branchId && { branchId }),
      },
    });

    return NextResponse.json({ status: true, message: "ok", data: shopcategory });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── POST — เพิ่ม Category ใหม่ ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as SetCategory;

    if (!body.name) return badRequest("Missing category name");

    const newshopcategory = await api.post<ServiceCategoryType>("newshopcategory", body);

    return NextResponse.json({
      status: !!newshopcategory,
      message: "ok",
      data: newshopcategory as ServiceCategoryType,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── PUT — แก้ไข Category ────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as SetCategory;

    if (!body.name) return badRequest("Missing category name");

    const updatedShopCategory = await api.put<ServiceCategoryType>("shopupdatecategory", body);

    return NextResponse.json({
      status: !!updatedShopCategory,
      message: "ok",
      data: updatedShopCategory as ServiceCategoryType,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// ─── DELETE — ลบ Category ────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const categoryId = new URL(req.url).searchParams.get("categoryId");

    if (!categoryId) return badRequest("categoryId is required");

    await api.delete<boolean>("deleteshopcategory", { params: { categoryId } });

    return NextResponse.json({ status: true, message: "ok", data: [] });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}