import { NextRequest } from "next/server";
import { createHttp } from "./centralize";
import { ExternalEndpointKey, externalEndpoints } from "@/config/endpoints";

export function serverHttp(req: NextRequest, baseUrl?: string) {
  if (!baseUrl) {
    const err = new Error("API baseUrl is missing") as Error & {
      status?: number;
    };
    err.status = 500;
    throw err;
  }

  return createHttp<ExternalEndpointKey>(
    externalEndpoints,
    () => {
      const access = req.cookies.get("access_token")?.value;
      const refresh = req.cookies.get("refresh_token")?.value;
      const session = req.cookies.get("session_key")?.value;

      const cookie = [
        `refresh_token=${encodeURIComponent(refresh ?? "")}`,
        `session_key=${encodeURIComponent(session ?? "")}`,
        `access_token=${encodeURIComponent(access ?? "")}`,
      ].join(";");

      const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
      const userAgent = req.headers.get("user-agent") ?? "";

      const headers: Record<string, string> = {
        Authorization: `Bearer ${access}`,
        Cookie: cookie,
      };

      if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;
      if (userAgent) headers["user-agent"] = userAgent;

      return headers;
    },
    baseUrl,
  );
}
