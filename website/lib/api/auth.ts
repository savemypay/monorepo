export interface LoginParams {
  email?: string;
  phone_number?: string;
}

export interface VerifyParams {
  email?: string;
  phone_number?: string;
  code: string;
}

export interface AuthUser {
  id: number;
  email: string | null;
  phone_number: string;
  is_active: boolean;
  name?: string | null;
}

export interface AuthData {
  identifier: string;
  access_token: string;
  access_token_expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  user: AuthUser;
  role:string;
  user_id:string;
  vendor_id:string;
  is_new_user:boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData[];
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

async function postJson<TResponse>(endpoint: string, payload: object): Promise<TResponse> {
  const response = await fetch(`${resolveBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Request failed";

    throw new Error(message);
  }

  return data as TResponse;
}

export function sendLoginOtp(params: LoginParams): Promise<AuthResponse> {
  if (!params.email && !params.phone_number) {
    throw new Error("Email or phone number is required");
  }
  return postJson<AuthResponse>("/api/v1/auth/customer/login", params);
}

export function verifyLoginOtp(params: VerifyParams): Promise<AuthResponse> {
  if (!params.code) {
    throw new Error("OTP code is required");
  }
  return postJson<AuthResponse>("/api/v1/auth/customer/verify", params);
}
