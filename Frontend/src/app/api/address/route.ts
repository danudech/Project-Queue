import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { ProfileUser } from "@/types/user";
import { AddressType } from "@/types/address/address-type";

export async function GET(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const zipcode = req.nextUrl.searchParams.get("zipcode");

    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { status: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const address = await api.get<AddressType[]>("addressbyzipcode", {
      params: {
        zipcode,
      },
    });

    return NextResponse.json({
      status: true,
      message: "ok",
      data: address,
    });

  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error", data: null },
      { status: e?.status ?? 500 }
    );
  }
}