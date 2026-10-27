import { env } from "@/config/env";

export function resolveApiMediaUrl(value: string | null | undefined): string | null {
  const path = value?.trim();
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;

  const apiOrigin = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/i, "").replace(/\/$/, "");
  return `${apiOrigin}/${path.replace(/^\//, "")}`;
}

