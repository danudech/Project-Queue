import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
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
      message: value.message ?? "Unable to update staff image",
      data: null,
    },
    { status: value.status ?? 500 },
  );
};

export async function POST(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();

  try {
    const formData = await req.formData();
    const staffId = Number(formData.get("StaffId"));
    const image = formData.get("ProfilePicture");
    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        { status: false, message: "staffId is required", data: null },
        { status: 400 },
      );
    }
    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { status: false, message: "ProfilePicture is required", data: null },
        { status: 400 },
      );
    }

    const upstream = new FormData();
    upstream.append("ProfilePicture", image);
    const data = await serverHttp(req, env.apiBaseUrl).post<StaffMember>(
      `/api/v1/operations/staff/${staffId}/photo` as "staff",
      upstream,
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}

export async function DELETE(req: NextRequest) {
  if (!req.cookies.get("access_token")?.value) return unauthorized();

  try {
    const staffId = Number(new URL(req.url).searchParams.get("staffId"));
    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json(
        { status: false, message: "staffId is required", data: null },
        { status: 400 },
      );
    }

    const data = await serverHttp(req, env.apiBaseUrl).delete<StaffMember>(
      `/api/v1/operations/staff/${staffId}/photo` as "staff",
    );
    return NextResponse.json({ status: true, message: "ok", data });
  } catch (error) {
    return failed(error);
  }
}
