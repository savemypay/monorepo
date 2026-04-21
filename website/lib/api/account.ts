import { type PurchasedDealOrder } from "@/lib/api/myDeals";
import { authenticatedJsonRequest } from "@/lib/api/authenticatedRequest";

const REFERRALS_ENDPOINT = process.env.NEXT_PUBLIC_REFERRALS_ENDPOINT?.trim() || "/api/v1/customer/referrals";
const REFER_EARN_ENDPOINT = process.env.NEXT_PUBLIC_REFER_EARN_ENDPOINT?.trim() || "/api/v1/customer/refer-earn";
const MISSING_CASHBACK_ENDPOINT =
  process.env.NEXT_PUBLIC_MISSING_CASHBACK_ENDPOINT?.trim() || "/api/v1/customer/missing-cashback";
const EARNINGS_ENDPOINT = process.env.NEXT_PUBLIC_CUSTOMER_EARNINGS_ENDPOINT?.trim() || "/api/v1/customer/earnings";
const PAYMENTS_ENDPOINT = process.env.NEXT_PUBLIC_CUSTOMER_PAYMENTS_ENDPOINT?.trim() || "/api/v1/customer/purchases";

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

async function getEndpointData<T>(accessToken: string, endpoint: string, fallbackError: string): Promise<T> {
  return authenticatedJsonRequest<T>(endpoint, {
    accessToken,
    method: "GET",
    fallbackError,
  });
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  return 0;
}

export async function getCustomerPayments(accessToken: string): Promise<PaymentRecord[]> {
  const data = await getEndpointData<PaymentRecord[] | PaymentRecord>(
    accessToken,
    PAYMENTS_ENDPOINT,
    "Failed to fetch payments"
  );
  return Array.isArray(data) ? data : [data];
}

export async function getPaymentHistory(accessToken: string): Promise<PaymentRecord[]> {
  return getCustomerPayments(accessToken);
}

export async function getCustomerEarnings(accessToken: string): Promise<CustomerEarnings> {
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
}

export async function getReferProgram(accessToken: string): Promise<ReferralProgramData | null> {
  const data = await getEndpointData<ReferralProgramData | ReferralProgramData[]>(
    accessToken,
    REFER_EARN_ENDPOINT,
    "Failed to fetch referral program"
  );

  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data ?? null;
}

export async function getMyReferrals(accessToken: string): Promise<ReferralUser[]> {
  const data = await getEndpointData<ReferralUser[] | ReferralUser>(
    accessToken,
    REFERRALS_ENDPOINT,
    "Failed to fetch referrals"
  );

  return Array.isArray(data) ? data : [data];
}

export async function getMissingCashback(accessToken: string): Promise<MissingCashbackRecord[]> {
  const data = await getEndpointData<MissingCashbackRecord[] | MissingCashbackRecord>(
    accessToken,
    MISSING_CASHBACK_ENDPOINT,
    "Failed to fetch missing cashback records"
  );

  return Array.isArray(data) ? data : [data];
}
