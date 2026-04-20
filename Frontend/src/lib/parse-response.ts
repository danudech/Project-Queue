import { ApiResponse } from "@/types/auth/api-response";

export async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (err) {
    json = null;
  }

  if (!res.ok) {
    const message =
      json?.message || json?.Message || json?.error || json?.title || `HTTP ${res.status}`;

    const error = new Error(message) as Error & { status: number; response: any };
    error.status = res.status;
    error.response = { data: json };

    throw error;
  }

  if (!json) {
    return null as unknown as T;
  }

  const api = json as ApiResponse<T>;

  const isSuccess = api.status ?? json.Status;
  const apiMessage = api.message || json.Message || "API returned failure";

  if (isSuccess === false) {
    const error = new Error(apiMessage) as Error & { status: number; response: any };
    error.status = 400;
    error.response = { data: json };
    throw error;
  }

  return (api.data !== undefined ? api.data : json.Data) as T;
}