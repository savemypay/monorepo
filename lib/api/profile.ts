const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const PROFILE_ENDPOINT = "/api/v1/profile";
const PROFILE_UPDATE_ENDPOINT = process.env.NEXT_PUBLIC_PROFILE_UPDATE_ENDPOINT?.trim();
const PROFILE_UPDATE_METHOD = (process.env.NEXT_PUBLIC_PROFILE_UPDATE_METHOD?.trim() || "PATCH").toUpperCase();

export interface Profile {
  id: number;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  is_active: boolean;
  category: string | null;
  name: string | null;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: Profile[];
  error: {
    code?: string;
    details?: string;
  } | null;
}

export type UpdateProfileInput = {
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

function extractErrorMessage(data: unknown, fallback: string) {
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

export async function getProfile(accessToken: string): Promise<Profile | null> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const response = await fetch(`${resolveBaseUrl()}${PROFILE_ENDPOINT}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Failed to fetch profile"));
  }

  const parsed = data as ProfileResponse;
  if (!parsed?.success) {
    throw new Error(parsed?.error?.details || parsed?.message || "Failed to fetch profile");
  }

  if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0] ?? null;
}

function normalizeProfileFromResponse(data: unknown) {
  const parsed = data as ProfileResponse;
  if (!parsed?.success) {
    throw new Error(parsed?.error?.details || parsed?.message || "Failed to update profile");
  }

  if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
    throw new Error("Updated profile response is empty");
  }

  return parsed.data[0] ?? null;
}

async function executeProfileUpdate(method: "PATCH" | "PUT", accessToken: string, payload: UpdateProfileInput) {
  const response = await fetch(`${resolveBaseUrl()}${PROFILE_UPDATE_ENDPOINT}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
}

export async function updateProfile(accessToken: string, payload: UpdateProfileInput): Promise<Profile | null> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const primaryMethod = PROFILE_UPDATE_METHOD === "PUT" ? "PUT" : "PATCH";
  const { response, data } = await executeProfileUpdate(primaryMethod, accessToken, payload);

  if (response.ok) {
    return normalizeProfileFromResponse(data);
  }

  if (response.status === 405 && primaryMethod === "PATCH") {
    const fallback = await executeProfileUpdate("PUT", accessToken, payload);
    if (fallback.response.ok) {
      return normalizeProfileFromResponse(fallback.data);
    }

    throw new Error(extractErrorMessage(fallback.data, "Failed to update profile"));
  }

  throw new Error(extractErrorMessage(data, "Failed to update profile"));
}
