type AdminLoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

type UserOnboardingTrendRole = "customer" | "vendor";
type UserOnboardingTrendGranularity = "day" | "week" | "month" | "year";
type TransactionTrendGranularity = "day" | "week" | "month" | "year";

type AdminLoginItem = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: string;
};

type AdminLoginResponse = {
  success: boolean;
  message: string;
  data: AdminLoginItem[];
  error: string | null;
};

type UserOnboardingTrendRequest = {
  accessToken: string;
  granularity: UserOnboardingTrendGranularity;
  role: UserOnboardingTrendRole;
  dateFrom?: string;
  dateTo?: string;
};

type UserOnboardingTrendPoint = {
  period_start: string;
  period_end: string;
  new_users: number;
  cumulative_users: number;
};

type UserOnboardingTrendItem = {
  granularity: UserOnboardingTrendGranularity;
  role: UserOnboardingTrendRole;
  date_from: string;
  date_to: string;
  total_new_users: number;
  total_users_till_to_date: number;
  trend: UserOnboardingTrendPoint[];
};

type UserOnboardingTrendResponse = {
  success: boolean;
  message: string;
  data: UserOnboardingTrendItem[];
  error: string | null;
};

type TransactionTrendRequest = {
  accessToken: string;
  granularity: TransactionTrendGranularity;
  dateFrom?: string;
  dateTo?: string;
  vendorId?: string;
};

type TransactionTrendPoint = {
  period_start: string;
  period_end: string;
  transactions_count: number;
  unique_paying_users: number;
  paid_amount: number;
  cumulative_paid_amount: number;
};

type TransactionTrendItem = {
  granularity: TransactionTrendGranularity;
  date_from: string;
  date_to: string;
  vendor_id: string | null;
  total_transactions: number;
  total_unique_paying_users: number;
  total_paid_amount: number;
  trend: TransactionTrendPoint[];
};

type TransactionTrendResponse = {
  success: boolean;
  message: string;
  data: TransactionTrendItem[];
  error: string | null;
};

type AdsByCategoryRequest = {
  accessToken: string;
  category?: string;
  vendorId?: string;
};

type AdsByCategoryPoint = {
  category: string;
  ads_count: number;
};

type AdsByCategoryItem = {
  category_filter: string | null;
  vendor_id: string | null;
  total_ads: number;
  by_category: AdsByCategoryPoint[];
};

type AdsByCategoryResponse = {
  success: boolean;
  message: string;
  data: AdsByCategoryItem[];
  error: string | null;
};

type DashboardOverviewItem = {
  live_deals: number;
  pending_approval: number;
  collections_today: number;
  active_vendors: number;
  new_customers: number;
  failed_payments: number;
  new_customers_window_days: number;
};

type DashboardOverviewResponse = {
  success: boolean;
  message: string;
  data: DashboardOverviewItem[];
  error: string | null;
};

type AdsListRequest = {
  accessToken: string;
  status?: string;
  vendorId?: string;
};

type AdTierItem = {
  id: number;
  seq: number;
  qty: number;
  discount_pct: number;
  label: string;
};

type AdListItem = {
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
  is_favorite: boolean;
  tiers: AdTierItem[];
};

type AdsListResponse = {
  success: boolean;
  message: string;
  data: AdListItem[];
  error: {
    code?: string;
    details?: string;
  } | null;
};

type PaidUserItem = {
  payment_id: number;
  order_id: string;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  ad: Record<string, unknown>;
  user_email: string;
  user_phone_number: string;
  user_name: string;
};

type PaidUsersResponse = {
  success: boolean;
  message: string;
  data: PaidUserItem[];
  error: {
    code?: string;
    details?: string;
  } | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  return API_BASE_URL.replace(/\/+$/, "");
}

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginItem> {
  if (!payload.username && !payload.email) {
    throw new Error("Username or email is required");
  }

  const response = await fetch(`${resolveBaseUrl()}/api/v1/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
        : "Admin login failed";

    throw new Error(message);
  }

  const parsed = data as AdminLoginResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Admin login failed");
  }

  return parsed.data[0];
}

export async function getUserOnboardingTrend(
  payload: UserOnboardingTrendRequest,
): Promise<UserOnboardingTrendItem> {
  const searchParams = new URLSearchParams({
    granularity: payload.granularity,
    role: payload.role,
  });

  if (payload.dateFrom) {
    searchParams.set("date_from", payload.dateFrom);
  }

  if (payload.dateTo) {
    searchParams.set("date_to", payload.dateTo);
  }

  const response = await fetch(`${resolveBaseUrl()}/api/v1/analytics/user-onboarding-trend?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch onboarding trend";

    throw new Error(message);
  }

  const parsed = data as UserOnboardingTrendResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch onboarding trend");
  }

  return parsed.data[0];
}

export async function getTransactionTrend(
  payload: TransactionTrendRequest,
): Promise<TransactionTrendItem> {
  const searchParams = new URLSearchParams({
    granularity: payload.granularity,
  });

  if (payload.dateFrom) {
    searchParams.set("date_from", payload.dateFrom);
  }

  if (payload.dateTo) {
    searchParams.set("date_to", payload.dateTo);
  }

  if (payload.vendorId) {
    searchParams.set("vendor_id", payload.vendorId);
  }

  const response = await fetch(`${resolveBaseUrl()}/api/v1/analytics/transactions-trend?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch transaction trend";

    throw new Error(message);
  }

  const parsed = data as TransactionTrendResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch transaction trend");
  }

  return parsed.data[0];
}

export async function getAds(payload: AdsListRequest): Promise<AdListItem[]> {
  const searchParams = new URLSearchParams();

  if (payload.status) {
    searchParams.set("status", payload.status);
  }

  if (payload.vendorId) {
    searchParams.set("vendor_id", payload.vendorId);
  }

  const query = searchParams.toString();
  const endpoint = `${resolveBaseUrl()}/api/v1/ads${query ? `?${query}` : ""}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch ads";

    throw new Error(message);
  }

  const parsed = data as AdsListResponse;
  if (!parsed.success) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch ads");
  }

  return parsed.data ?? [];
}

export async function getPaidUsers(accessToken: string): Promise<PaidUserItem[]> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/payments/paid-users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch recent payments";

    throw new Error(message);
  }

  const parsed = data as PaidUsersResponse;
  if (!parsed.success) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch recent payments");
  }

  return parsed.data ?? [];
}

export async function getAdsByCategory(payload: AdsByCategoryRequest): Promise<AdsByCategoryItem> {
  const searchParams = new URLSearchParams();

  if (payload.category) {
    searchParams.set("category", payload.category);
  }

  if (payload.vendorId) {
    searchParams.set("vendor_id", payload.vendorId);
  }

  const query = searchParams.toString();
  const endpoint = `${resolveBaseUrl()}/api/v1/analytics/ads-by-category${query ? `?${query}` : ""}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch category analytics";

    throw new Error(message);
  }

  const parsed = data as AdsByCategoryResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch category analytics");
  }

  return parsed.data[0];
}

export async function getDashboardOverview(accessToken: string): Promise<DashboardOverviewItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/analytics/dashboard-overview`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Failed to fetch dashboard overview";

    throw new Error(message);
  }

  const parsed = data as DashboardOverviewResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch dashboard overview");
  }

  return parsed.data[0];
}
