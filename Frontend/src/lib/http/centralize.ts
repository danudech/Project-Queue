import { externalEndpoints, internalEndpoints } from "@/config/endpoints";
import { TokenType } from "@/types/auth/auth-response";
import { env } from "@/config/env";
import toast from "react-hot-toast";
import { parseResponse } from "../parse-response";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  cache?: RequestCache;
  skipRefresh?: boolean;
};

function encodeQuery(params?: Record<string, unknown>) {
  if (!params) return "";

  const keys = Object.keys(params);
  if (!keys.length) return "";

  const qs = keys
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`,
    )
    .join("&");

  return qs ? `?${qs}` : "";
}

type RefreshResponse = {
  status?: boolean;
  message?: string;
  data?: TokenType | null;
};

function setAuthHeaders(
  headers: Record<string, string>,
  token?: TokenType | null,
): Record<string, string> {
  if (!token?.accessToken) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token.accessToken}`,
  };
}

export function createHttp<K extends string>(
  endpoints: Record<K, string>,
  getDefaultHeaders?: () => Record<string, string>,
  baseUrl?: string,
) {
  let refreshPromise: Promise<TokenType | null> | null = null;

  async function tryRefresh(): Promise<TokenType | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(
          `${env.appBaseUrl}${internalEndpoints.line_refresh_token}`,
          {
            method: "GET",
            headers: {
              ...(getDefaultHeaders?.() ?? {}),
            },
            cache: "no-store",
          },
        );

        const json =
          (await res.json().catch(() => null)) as RefreshResponse | null;

        if (!res.ok || !json?.status || !json.data) {
          return null;
        }

        return json.data;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async function request<T>(
    method: Method,
    url: string,
    body?: unknown,
    opts: RequestOptions = {},
    retried = false,
    refreshedToken?: TokenType | null,
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const baseHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(getDefaultHeaders?.() ?? {}),
      ...(opts.headers ?? {}),
    };

    const res = await fetch(url, {
      method,
      headers: setAuthHeaders(baseHeaders, refreshedToken),
      body:
        body === undefined || body === null
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      cache: opts.cache ?? "no-store",
    });

    if (res.status === 401 && !retried && !opts.skipRefresh) {
      console.warn(`⚠️ [API Warning] 401 Unauthorized ที่ ${url} -> กำลังพยายาม Refresh Token...`);
      const token = await tryRefresh();

      if (token) {
        console.log(`✅ [API Success] Refresh Token สำเร็จ! กำลัง Retry ยิง API เดิมซ้ำ...`);
        return request<T>(
          method,
          url,
          body,
          { ...opts, skipRefresh: true },
          true,
          token,
        );
      } else {
        console.error(`❌ [API Error] Refresh Token ล้มเหลว หรือ Token หมดอายุถาวร`);
        toast.error("กรุณาเข้าสู่ระบบใหม่");
      }
    }

    return parseResponse<T>(res);
  }

  function resolve(key: K, opts?: RequestOptions) {
    const path = endpoints[key];
    const qs = encodeQuery(opts?.params);
    return `${baseUrl ?? ""}${path}${qs}`;
  }

  return {
    get<T = unknown>(key: K, opts?: RequestOptions) {
      return request<T>("GET", resolve(key, opts), undefined, opts);
    },

    post<T = unknown>(key: K, body?: unknown, opts?: RequestOptions) {
      return request<T>("POST", resolve(key, opts), body, opts);
    },

    patch<T = unknown>(key: K, body?: unknown, opts?: RequestOptions) {
      return request<T>("PATCH", resolve(key, opts), body, opts);
    },

    put<T = unknown>(key: K, body?: unknown, opts?: RequestOptions) {
      return request<T>("PUT", resolve(key, opts), body, opts);
    },

    delete<T = unknown>(key: K, opts?: RequestOptions) {
      return request<T>("DELETE", resolve(key, opts), undefined, opts);
    },

    upload<T = unknown>(key: K, formData: FormData, opts?: RequestOptions) {
      return request<T>("POST", resolve(key, opts), formData, opts);
    },
  };
}