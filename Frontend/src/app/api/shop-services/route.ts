import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { SetService } from "@/types/shop/service";

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

// Note

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const branchId = searchParams.get("branchId");

    const shopservices = await api.get<SetService[]>("service", {
      params: {
        ...(shopId && { shopId }),
        ...(branchId && { branchId }),
      },
    });

    return NextResponse.json({ status: true, message: "ok", data: shopservices });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// Note

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as SetService;

    if (!body.name) return badRequest("Missing service name");

    const newservice = await api.post<SetService>("newservices", body);

    return NextResponse.json({
      status: !!newservice,
      message: "ok",
      data: newservice as SetService,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// Note

export async function PUT(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const body = (await req.json().catch(() => ({}))) as SetService;

    if (!body.name) return badRequest("Missing service name");

    const updatedService = await api.put<SetService>("updateservices", body);

    return NextResponse.json({
      status: !!updatedService,
      message: "ok",
      data: updatedService as SetService,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}

// Note

export async function DELETE(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);

    if (!req.cookies.get("access_token")?.value) return unauthorized();

    const serviceId = new URL(req.url).searchParams.get("serviceId");

    if (!serviceId) return badRequest("serviceId is required");

    await api.delete<boolean>("deleteservices", { params: { serviceId } });

    return NextResponse.json({ status: true, message: "ok", data: [] });
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}