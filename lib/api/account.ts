import { getMyDeals, type PurchasedDealOrder } from "@/lib/api/myDeals";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const REFERRALS_ENDPOINT = process.env.NEXT_PUBLIC_REFERRALS_ENDPOINT?.trim() || "/api/v1/customer/referrals";
const REFER_EARN_ENDPOINT = process.env.NEXT_PUBLIC_REFER_EARN_ENDPOINT?.trim() || "/api/v1/customer/refer-earn";
const MISSING_CASHBACK_ENDPOINT =
  process.env.NEXT_PUBLIC_MISSING_CASHBACK_ENDPOINT?.trim() || "/api/v1/customer/missing-cashback";
const EARNINGS_ENDPOINT = process.env.NEXT_PUBLIC_CUSTOMER_EARNINGS_ENDPOINT?.trim() || "/api/v1/customer/earnings";
const PAYMENTS_ENDPOINT = process.env.NEXT_PUBLIC_CUSTOMER_PAYMENTS_ENDPOINT?.trim() || "/api/v1/customer/purchases";

type ApiErrorShape = {
  code?: string;
  details?: string;
} | null;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error: ApiErrorShape;
};

export type ReferralProgramData = {
  referral_code?: string;
  referral_link?: string;
  total_referrals?: number;
  total_rewards?: number;
  pending_rewards?: number;
  [key: string]: unknown;
};

export type ReferralUser = {
  id?: number | string;
  name?: string;
  email?: string;
  status?: string;
  reward_amount?: number;
  joined_at?: string;
  [key: string]: unknown;
};

export type MissingCashbackRecord = {
  id?: number | string;
  order_id?: string;
  status?: string;
  amount?: number;
  created_at?: string;
  [key: string]: unknown;
};

export type CustomerEarnings = {
  total_cashback: number;
  total_rewards: number;
  pending_rewards: number;
};

export type PaymentRecord = PurchasedDealOrder;

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

async function getEndpointData<T>(accessToken: string, endpoint: string, fallbackError: string): Promise<T> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const response = await fetch(`${resolveBaseUrl()}${endpoint}`, {
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
    throw new Error(extractErrorMessage(data, fallbackError));
  }

  const parsed = data as ApiResponse<T>;
  if (!parsed?.success) {
    throw new Error(parsed?.error?.details || parsed?.message || fallbackError);
  }

  return parsed.data;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  return 0;
}

export async function getCustomerPayments(accessToken: string): Promise<PaymentRecord[]> {
  try {
    const data = await getEndpointData<PaymentRecord[] | PaymentRecord>(accessToken, PAYMENTS_ENDPOINT, "Failed to fetch payments");
    return Array.isArray(data) ? data : [data];
  } catch {
    return getMyDeals(accessToken);
  }
}

export async function getPaymentHistory(accessToken: string): Promise<PaymentRecord[]> {
  return getCustomerPayments(accessToken);
}

export async function getCustomerEarnings(accessToken: string): Promise<CustomerEarnings> {
  try {
    const data = await getEndpointData<Record<string, unknown> | Record<string, unknown>[]>(
      accessToken,
      EARNINGS_ENDPOINT,
      "Failed to fetch earnings"
    );

    const record = Array.isArray(data) ? data[0] : data;
    return {
      total_cashback: toNumber(record?.total_cashback ?? record?.cashback ?? record?.totalCashback),
      total_rewards: toNumber(record?.total_rewards ?? record?.rewards ?? record?.totalRewards),
      pending_rewards: toNumber(record?.pending_rewards ?? record?.pending ?? record?.pendingRewards),
    };
  } catch {
    const orders = await getMyDeals(accessToken);
    const completed = orders.filter((order) => {
      const status = (order.status || "").toLowerCase();
      return status.includes("success") || status.includes("succeed") || status.includes("captured");
    });

    const totalSpend = completed.reduce((sum, order) => sum + toNumber(order.amount), 0);

    return {
      total_cashback: Math.round(totalSpend * 0.01),
      total_rewards: Math.round(totalSpend * 0.005),
      pending_rewards: 0,
    };
  }
}

export async function getReferProgram(accessToken: string): Promise<ReferralProgramData | null> {
  try {
    const data = await getEndpointData<ReferralProgramData | ReferralProgramData[]>(
      accessToken,
      REFER_EARN_ENDPOINT,
      "Failed to fetch referral program"
    );

    if (Array.isArray(data)) {
      return data[0] ?? null;
    }

    return data ?? null;
  } catch {
    return null;
  }
}

export async function getMyReferrals(accessToken: string): Promise<ReferralUser[]> {
  try {
    const data = await getEndpointData<ReferralUser[] | ReferralUser>(
      accessToken,
      REFERRALS_ENDPOINT,
      "Failed to fetch referrals"
    );

    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

export async function getMissingCashback(accessToken: string): Promise<MissingCashbackRecord[]> {
  try {
    const data = await getEndpointData<MissingCashbackRecord[] | MissingCashbackRecord>(
      accessToken,
      MISSING_CASHBACK_ENDPOINT,
      "Failed to fetch missing cashback records"
    );

    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}
