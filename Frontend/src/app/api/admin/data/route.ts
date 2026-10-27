import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import {
  ADMIN_MOCK_COOKIE,
  ADMIN_MOCK_COOKIE_VALUE,
} from "@/config/admin-mock";

const ADMIN_SECRET_KEY = "ezqueue-admin-secret-2026";

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(ADMIN_MOCK_COOKIE)?.value;
  if (cookie === ADMIN_MOCK_COOKIE_VALUE) return true;
  if (request.cookies.get("access_token")?.value) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ status: false, message: "Unauthorized admin access", data: null }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleName = searchParams.get("module") || "overview";

  try {
    const apiRes = await fetch(`${env.apiBaseUrl}/api/v1/admin/${moduleName}`, {
      headers: {
        "X-Admin-Key": ADMIN_SECRET_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      return NextResponse.json({ status: false, message: err || "Backend API error", data: null }, { status: apiRes.status });
    }

    const json = await apiRes.json();
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { status: false, message: error instanceof Error ? error.message : "Unable to reach backend database service", data: null },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ status: false, message: "Unauthorized admin access", data: null }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleName = searchParams.get("module") || "shops";
  const body = await request.json().catch(() => ({}));

  try {
    const apiRes = await fetch(`${env.apiBaseUrl}/api/v1/admin/${moduleName}`, {
      method: "POST",
      headers: {
        "X-Admin-Key": ADMIN_SECRET_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await apiRes.json().catch(() => null);
    if (!apiRes.ok) {
      return NextResponse.json({ status: false, message: json?.message || "Failed to create", data: null }, { status: apiRes.status });
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: false, message: error instanceof Error ? error.message : "Unable to reach backend database service", data: null },
      { status: 502 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ status: false, message: "Unauthorized admin access", data: null }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleName = searchParams.get("module") || "shops";
  const id = searchParams.get("id");
  const body = await request.json().catch(() => ({}));

  if (!id) {
    return NextResponse.json({ status: false, message: "Missing record ID", data: null }, { status: 400 });
  }

  try {
    const apiRes = await fetch(`${env.apiBaseUrl}/api/v1/admin/${moduleName}/${id}/status`, {
      method: "PUT",
      headers: {
        "X-Admin-Key": ADMIN_SECRET_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await apiRes.json().catch(() => null);
    if (!apiRes.ok) {
      return NextResponse.json({ status: false, message: json?.message || "Failed to update status", data: null }, { status: apiRes.status });
    }

    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: false, message: error instanceof Error ? error.message : "Unable to reach backend database service", data: null },
      { status: 502 }
    );
  }
}
