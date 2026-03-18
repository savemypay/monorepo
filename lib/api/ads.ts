import {
  authenticatedRequest,
  extractApiErrorMessage,
  parseAuthenticatedResponse,
} from "@/lib/api/authenticatedRequest";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export interface AdTier {
  id: number;
  seq: number;
  qty: number;
  discount_pct: number;
  label: string;
}

export interface Ad {
  id: number;
  vendor_id: number;
  title: string;
  product_name: string;
  category: string;
  token_amount: number;
  original_price: number;
  total_qty: number;
  slots_remaining: number;
  slots_sold: number;
  status: string;
  images: string[];
  description: string;
  terms: string;
  valid_from: string;
  valid_to: string;
  is_favorite?: boolean;
  tiers: AdTier[];
}

interface AdsResponse {
  success: boolean;
  message: string;
  data: Ad[];
  error: string | { code?: string; details?: string } | null;
}

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

function extractErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

export async function getAds(): Promise<Ad[]> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/ads`, {
    method: "GET",
    headers: {
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
    throw new Error(extractErrorMessage(data, "Failed to fetch ads"));
  }

  const parsed = data as AdsResponse;
  if (!parsed?.success) {
    throw new Error("Failed to fetch ads");
  }

  return Array.isArray(parsed.data) ? parsed.data : [];
}

export async function getAdById(adId: string | number): Promise<Ad | null> {
  if (adId === "" || adId === null || adId === undefined) {
    throw new Error("Ad id is required");
  }

  const response = await fetch(`${resolveBaseUrl()}/api/v1/ads/${encodeURIComponent(String(adId))}`, {
    method: "GET",
    headers: {
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
    throw new Error(extractErrorMessage(data, "Failed to fetch ad details"));
  }

  const parsed = data as AdsResponse;
  if (!parsed?.success) {
    throw new Error("Failed to fetch ad details");
  }

  if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0] ?? null;
}

export async function setAdFavorite(
  adId: string | number,
  isFavorite: boolean,
  accessToken: string
): Promise<boolean> {
  if (adId === "" || adId === null || adId === undefined) {
    throw new Error("Ad id is required");
  }

  const { response, data } = await authenticatedRequest(`/api/v1/ads/${encodeURIComponent(String(adId))}/favorite`, {
    accessToken,
    method: "PUT",
    jsonBody: {
      is_favorite: isFavorite,
    },
  });

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, "Failed to update favorite"));
  }

  const parsed = parseAuthenticatedResponse<Ad[] | Ad | null>(response, data, "Failed to update favorite");

  if (Array.isArray(parsed)) {
    const updated = parsed[0];
    if (updated && typeof updated.is_favorite === "boolean") {
      return updated.is_favorite;
    }
    return isFavorite;
  }

  if (parsed && typeof parsed === "object" && typeof parsed.is_favorite === "boolean") {
    return parsed.is_favorite;
  }

  return isFavorite;
}
