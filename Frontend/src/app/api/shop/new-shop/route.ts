import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { serverHttp } from "@/lib/http/server";
import { StatusRegister, UserRegister, UserRegisterResponse } from "@/types/user";
import { AddShop } from "@/types/shop/shoptype";
import { ShopResponse } from "@/types/shop/shop-responsd";

export async function POST(req: NextRequest) {
  try {
    const api = serverHttp(req, env.apiBaseUrl);
    const body = (await req.json().catch(() => ({}))) as AddShop;

    if (!body.shopname || !body.shoptype) {
      return NextResponse.json(
        { status: false, message: "Missing shop name or shop type", data: null },
        { status: 400 },
      );
    }

    const loginres = await api.post<ShopResponse>("newshop", body);

    const res = NextResponse.json({
      status: loginres ? true : false,
      message: "ok",
      data: loginres as ShopResponse,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { status: false, message: e?.message ?? "error" },
      { status: e?.status ?? 500 },
    );
  }
}
