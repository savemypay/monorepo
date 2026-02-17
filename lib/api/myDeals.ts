const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const MY_ORDERS_ENDPOINT = "/api/v1/customer/purchases";

export interface PurchasedDealOrder {
  payment_id: number;
  order_id: string;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  ad: Record<string, unknown> | null;
  user_email: string;
  user_phone_number: string;
  user_name: string;
}

interface MyDealsApiError {
  code?: string;
  details?: string;
}

interface MyDealsResponse {
  success: boolean;
  message: string;
  data: PurchasedDealOrder[];
  error: MyDealsApiError | null;
}

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

export async function getMyDeals(accessToken: string): Promise<PurchasedDealOrder[]> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const response = await fetch(`${resolveBaseUrl()}${MY_ORDERS_ENDPOINT}`, {
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
    throw new Error(extractErrorMessage(data, "Failed to fetch purchased deals"));
  }

  const parsed = data as MyDealsResponse;
  if (!parsed?.success) {
    throw new Error(parsed?.error?.details || parsed?.message || "Failed to fetch purchased deals");
  }

  return Array.isArray(parsed.data) ? parsed.data : [];
}
