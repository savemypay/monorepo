type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: boolean;
  headers?: HeadersInit;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function buildUrl(
  endpoint: string,
  query?: Record<string, string | number | boolean | undefined | null>
) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function getAccessTokenFromStorage() {
  if (typeof window === "undefined") return null;
  const storageData = localStorage.getItem("vendor-storage");
  if (!storageData) return null;

  try {
    const parsed = JSON.parse(storageData);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", query, body, auth = true, headers } = options;

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set("ngrok-skip-browser-warning", "true");

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessTokenFromStorage();
    if (!token) {
      throw new Error("Unauthorized. Please login again.");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
    requestHeaders.set("access_token", token);
  }

  const response = await fetch(buildUrl(endpoint, query), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(`API Error ${response.status}: Invalid JSON response`);
  }

  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      const maybeError = data as { message?: string; error?: string };
      throw new Error(maybeError.message || maybeError.error || "Request failed");
    }
    throw new Error("Request failed");
  }

  return data as T;
}
