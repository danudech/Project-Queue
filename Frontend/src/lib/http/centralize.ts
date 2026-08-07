import { externalEndpoints, internalEndpoints } from "@/config/endpoints";
import { TokenType } from "@/types/auth/auth-response";
import { env } from "@/config/env";
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
  data?: unknown;
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
  let refreshPromise: Promise<boolean> | null = null;

  async function tryRefresh(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(
          `${env.appBaseUrl}${internalEndpoints.refreshToken}`,
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

        if (!res.ok || !json?.status) {
          return false;
        }

        // Tokens are kept in HttpOnly cookies by the Next.js route. Do not
        // return them to browser JavaScript or expose them in the response.
        return true;
      } catch {
        return false;
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
      const token = await tryRefresh();

      if (token) {
        return request<T>(
          method,
          url,
          body,
          { ...opts, skipRefresh: true },
          true,
          null,
        );
      } else {
        await fetch(
          `${env.appBaseUrl}${internalEndpoints.signout}`,
          {
            method: "GET",
            headers: {
              ...(getDefaultHeaders?.() ?? {}),
            },
            cache: "no-store",
          },
        );
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1500);
      }
    }

    return parseResponse<T>(res);
  }

  function resolve(key: K | string, opts?: RequestOptions) {
    const path = (endpoints as Record<string, string>)[key] ?? key;
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
