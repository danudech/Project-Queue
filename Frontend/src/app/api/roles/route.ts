import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import type {
  PermissionCatalogItem,
  SaveShopRole,
  ShopRole,
} from "@/types/shop/role";
import type { StaffMember } from "@/types/shop/staff";

const unauthorized = () =>
  NextResponse.json(
    { status: false, message: "Unauthorized", data: null },
    { status: 401 },
  );

const failed = (error: unknown) => {
  const value = error as { message?: string; status?: number };
  return NextResponse.json(
    {
      status: false,
      message: value.message ?? "Unable to process role request",
      data: null,
    },
    { status: value.status ?? 500 },
  );
};

export async function GET(request: NextRequest) {
  if (!request.cookies.get("access_token")?.value) return unauthorized();
  try {
    const params = new URL(request.url).searchParams;
    if (params.get("catalog") === "true") {
      const data = await serverHttp(request, env.apiBaseUrl).get<
        PermissionCatalogItem[]
      >("/api/v1/roles/permissions" as "profile");
      return NextResponse.json({ status: true, message: "ok", data });
    }
    const data = await serverHttp(request, env.apiBaseUrl).get<ShopRole[]>(
      "/api/v1/roles" as "profile",
      { params: { shopId: params.get("shopId") } },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}

export async function POST(request: NextRequest) {
  if (!request.cookies.get("access_token")?.value) return unauthorized();
  try {
    const body = (await request.json()) as SaveShopRole;
    const data = await serverHttp(request, env.apiBaseUrl).post<ShopRole>(
      "/api/v1/roles" as "profile",
      body,
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}

export async function PUT(request: NextRequest) {
  if (!request.cookies.get("access_token")?.value) return unauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const body = await request.json();
    const staffId = params.get("staffId");
    if (staffId) {
      const data = await serverHttp(request, env.apiBaseUrl).put<StaffMember>(
        `/api/v1/roles/staff/${staffId}` as "profile",
        body,
      );
      return NextResponse.json({ status: true, message: "ok", data });
    }
    const code = params.get("code");
    if (!code) {
      return NextResponse.json(
        { status: false, message: "Role code is required", data: null },
        { status: 400 },
      );
    }
    const data = await serverHttp(request, env.apiBaseUrl).put<ShopRole>(
      `/api/v1/roles/${encodeURIComponent(code)}` as "profile",
      body,
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!request.cookies.get("access_token")?.value) return unauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const code = params.get("code");
    const shopId = params.get("shopId");
    if (!code || !shopId) {
      return NextResponse.json(
        { status: false, message: "Role code and shop are required", data: null },
        { status: 400 },
      );
    }
    const data = await serverHttp(request, env.apiBaseUrl).delete<boolean>(
      `/api/v1/roles/${encodeURIComponent(code)}` as "profile",
      { params: { shopId } },
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}
