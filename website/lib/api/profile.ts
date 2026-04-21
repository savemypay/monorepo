import {
  authenticatedJsonRequest,
  authenticatedRequest,
  extractApiErrorMessage,
  parseAuthenticatedResponse,
} from "@/lib/api/authenticatedRequest";

const PROFILE_ENDPOINT = "/api/v1/profile";
const PROFILE_UPDATE_ENDPOINT = "/api/v1/auth/customer/profile";
const PROFILE_UPDATE_METHOD = ("PATCH").toUpperCase();

export interface Profile {
  id: number;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  is_active: boolean;
  category: string | null;
  name: string | null;
}

export type UpdateProfileInput = {
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

export async function getProfile(accessToken: string): Promise<Profile | null> {
  const data = await authenticatedJsonRequest<Profile[]>(PROFILE_ENDPOINT, {
    accessToken,
    method: "GET",
    fallbackError: "Failed to fetch profile",
  });

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0] ?? null;
}

async function executeProfileUpdate(method: "PATCH" | "PUT", accessToken: string, payload: UpdateProfileInput) {
  const { response, data } = await authenticatedRequest(PROFILE_UPDATE_ENDPOINT, {
    accessToken,
    method,
    jsonBody: payload,
  });

  return { response, data };
}

export async function updateProfile(accessToken: string, payload: UpdateProfileInput): Promise<Profile | null> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const primaryMethod = PROFILE_UPDATE_METHOD === "PUT" ? "PUT" : "PATCH";
  const { response, data } = await executeProfileUpdate(primaryMethod, accessToken, payload);

  if (response.ok) {
    return parseAuthenticatedResponse<Profile[]>(response, data, "Failed to update profile")[0] ?? null;
  }

  if (response.status === 405 && primaryMethod === "PATCH") {
    const fallback = await executeProfileUpdate("PUT", accessToken, payload);
    if (fallback.response.ok) {
      return parseAuthenticatedResponse<Profile[]>(
        fallback.response,
        fallback.data,
        "Failed to update profile"
      )[0] ?? null;
    }

    throw new Error(extractApiErrorMessage(fallback.data, "Failed to update profile"));
  }

  throw new Error(extractApiErrorMessage(data, "Failed to update profile"));
}
