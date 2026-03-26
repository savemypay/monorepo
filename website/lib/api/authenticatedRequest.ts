import { useAuthStore } from "@/lib/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

type ApiErrorShape =
  | {
      code?: string;
      details?: string;
    }
  | string
  | null;

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorShape;
};

type AuthenticatedRequestOptions = {
  accessToken: string;
  method?: string;
  headers?: HeadersInit;
  jsonBody?: unknown;
  cache?: RequestCache;
};

type ParseOptions = {
  expectEnvelope?: boolean;
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  isAuthError: boolean;

  constructor(message: string, options: { status: number; code?: string }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options.status;
    this.code = options.code;
    this.isAuthError = options.status === 401 || options.status === 403;
  }
}

export function resolveApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  return API_BASE_URL.replace(/\/+$/, "");
}

export function extractApiErrorMessage(data: unknown, fallback: string) {
  if (typeof data !== "object" || data === null) return fallback;

  if ("message" in data && typeof (data as { message?: unknown }).message === "string") {
    return (data as { message: string }).message;
  }

  if (
    "error" in data &&
    typeof (data as { error?: unknown }).error === "object" &&
    (data as { error?: unknown }).error !== null &&
    "details" in ((data as { error: { details?: unknown } }).error || {}) &&
    typeof (data as { error: { details?: unknown } }).error.details === "string"
  ) {
    return (data as { error: { details: string } }).error.details;
  }

  return fallback;
}

function extractApiErrorCode(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "object" &&
    (data as { error?: unknown }).error !== null &&
    "code" in ((data as { error: { code?: unknown } }).error || {}) &&
    typeof (data as { error: { code?: unknown } }).error.code === "string"
  ) {
    return (data as { error: { code: string } }).error.code;
  }

  return undefined;
}

function logoutIfUnauthorized(status: number) {
  if (status !== 401 && status !== 403) return;

  const { accessToken, user, isAuthenticated, logout } = useAuthStore.getState();
  if (!accessToken && !user && !isAuthenticated) return;

  logout();
}

export async function authenticatedRequest(
  endpoint: string,
  { accessToken, method = "GET", headers, jsonBody, cache = "no-store" }: AuthenticatedRequestOptions
) {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("Authorization", `Bearer ${accessToken}`);
  mergedHeaders.set("ngrok-skip-browser-warning", "true");

  if (jsonBody !== undefined && !mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${resolveApiBaseUrl()}${endpoint}`, {
    method,
    headers: mergedHeaders,
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    cache,
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  logoutIfUnauthorized(response.status);

  return { response, data };
}

export function parseAuthenticatedResponse<T>(
  response: Response,
  data: unknown,
  fallbackError: string,
  { expectEnvelope = true }: ParseOptions = {}
): T {
  if (!response.ok) {
    throw new ApiRequestError(extractApiErrorMessage(data, fallbackError), {
      status: response.status,
      code: extractApiErrorCode(data),
    });
  }

  if (!expectEnvelope) {
    return data as T;
  }

  const parsed = data as ApiEnvelope<T>;
  if (!parsed?.success) {
    throw new ApiRequestError(parsed?.message || extractApiErrorMessage(data, fallbackError), {
      status: response.status,
      code: extractApiErrorCode(data),
    });
  }

  return parsed.data as T;
}

export async function authenticatedJsonRequest<T>(
  endpoint: string,
  options: AuthenticatedRequestOptions & { fallbackError: string; expectEnvelope?: boolean }
): Promise<T> {
  const { fallbackError, expectEnvelope = true, ...requestOptions } = options;
  const { response, data } = await authenticatedRequest(endpoint, requestOptions);

  return parseAuthenticatedResponse<T>(response, data, fallbackError, { expectEnvelope });
}

export function isApiAuthError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && error.isAuthError;
}
