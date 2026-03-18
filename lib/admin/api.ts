import type {
  AdDetailResponse,
  AdminLoginItem,
  AdminLoginPayload,
  AdminLoginResponse,
  AdminUsersRequest,
  AdminUsersResponse,
  AdminUsersSummaryItem,
  AdListItem,
  AdsByCategoryItem,
  AdsByCategoryRequest,
  AdsByCategoryResponse,
  AdsListRequest,
  AdsListResponse,
  CustomerTransactionItem,
  CustomerTransactionsResponse,
  DashboardOverviewItem,
  DashboardOverviewResponse,
  PaidUserItem,
  PaidUsersResponse,
  PaidUsersStatus,
  PublishAdResponse,
  RejectAdResponse,
  TransactionTrendItem,
  TransactionTrendRequest,
  TransactionTrendResponse,
  UserOnboardingTrendItem,
  UserOnboardingTrendRequest,
  UserOnboardingTrendResponse,
  VendorAdsRevenueItem,
  VendorAdsRevenueResponse,
} from "@/lib/admin/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  return API_BASE_URL.replace(/\/+$/, "");
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function extractErrorMessage(data: unknown, fallback: string) {
  return typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
    ? (data as { message: string }).message
    : fallback;
}

async function handleUnauthorizedSession() {
  if (typeof window === "undefined") {
    return;
  }

  const { logoutAdminSession } = await import("@/lib/admin/auth-store");
  logoutAdminSession();
}

async function assertProtectedResponse(response: Response, data: unknown, fallback: string) {
  if (response.status === 401) {
    await handleUnauthorizedSession();
    throw new Error("Admin session expired");
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, fallback));
  }
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

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Admin login failed"));
  }

  const parsed = data as AdminLoginResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Admin login failed");
  }

  return parsed.data[0];
}

// Fetch customer or vendor onboarding growth for the overview trend chart.
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

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch onboarding trend");

  const parsed = data as UserOnboardingTrendResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch onboarding trend");
  }

  return parsed.data[0];
}

// Fetch payment collection trend data for revenue and transaction analytics.
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

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch transaction trend");

  const parsed = data as TransactionTrendResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch transaction trend");
  }

  return parsed.data[0];
}

// Fetch ads with optional status or vendor filtering for list and queue views.
export async function getAds(payload: AdsListRequest): Promise<AdListItem[]> {
  const searchParams = new URLSearchParams();

  if (payload.status) {
    searchParams.set("status", payload.status);
  }

  if (payload.vendorId) {
    searchParams.set("vendor_id", payload.vendorId);
  }

  if (payload.page) {
    searchParams.set("page", String(payload.page));
  }

  if (payload.limit) {
    searchParams.set("limit", String(payload.limit));
  }

  const query = searchParams.toString();
  const endpoint = `${resolveBaseUrl()}/api/v1/ads${query ? `?${query}` : ""}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch ads");

  const parsed = data as AdsListResponse;
  if (!parsed.success) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch ads");
  }

  return parsed.data ?? [];
}

// Fetch a single ad by id for the deal detail page.
export async function getAdById(accessToken: string, adId: number): Promise<AdListItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/ads/${adId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch ad");

  const parsed = data as AdDetailResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch ad");
  }

  return parsed.data[0];
}

// Publish a draft ad and return the updated deal payload.
export async function publishAd(accessToken: string, adId: number): Promise<AdListItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/ads/${adId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to publish ad");

  const parsed = data as PublishAdResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to publish ad");
  }

  return parsed.data[0];
}

// Reject a draft ad and return the updated deal payload.
export async function rejectAd(accessToken: string, adId: number): Promise<AdListItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/ads/${adId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to reject ad");

  const parsed = data as RejectAdResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to reject ad");
  }

  return parsed.data[0];
}

// Fetch recent successful paid-user transactions for payments and overview cards.
export async function getPaidUsers(
  accessToken: string,
  params?: { status?: PaidUsersStatus; customerSearch?: string; customerId?: string }
): Promise<PaidUserItem[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.customerSearch?.trim()) {
    searchParams.set("customer_search", params.customerSearch.trim());
  }

  if (params?.customerId) {
    searchParams.set("customer_id", params.customerId);
  }

  const query = searchParams.toString();
  const endpoint = `${resolveBaseUrl()}/api/v1/payments/paid-users${query ? `?${query}` : ""}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch recent payments");

  const parsed = data as PaidUsersResponse;
  if (!parsed.success) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch recent payments");
  }

  return parsed.data ?? [];
}

// Fetch all transactions for a single customer.
export async function getCustomerTransactions(
  accessToken: string,
  customerId: string
): Promise<CustomerTransactionItem[]> {
  const searchParams = new URLSearchParams({ customer_id: customerId });
  const response = await fetch(
    `${resolveBaseUrl()}/api/v1/payments/customer-transactions?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch customer transactions");

  const parsed = data as CustomerTransactionsResponse;
  if (!parsed.success) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch customer transactions");
  }

  return parsed.data ?? [];
}

// Fetch admin-visible customer or vendor user records with optional search.
export async function getAdminUsers(payload: AdminUsersRequest): Promise<AdminUsersSummaryItem> {
  const searchParams = new URLSearchParams({
    role: payload.role ?? "all",
  });

  if (payload.search?.trim()) {
    searchParams.set("search", payload.search.trim());
  }

  if (payload.page) {
    searchParams.set("page", String(payload.page));
  }

  if (payload.limit) {
    searchParams.set("limit", String(payload.limit));
  }

  const response = await fetch(`${resolveBaseUrl()}/api/v1/auth/admin/users?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch admin users");

  const parsed = data as AdminUsersResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch admin users");
  }

  return parsed.data[0];
}

// Fetch vendor revenue summary and ad-level performance for vendor detail pages.
export async function getVendorAdsRevenue(accessToken: string, vendorId: number): Promise<VendorAdsRevenueItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/auth/admin/vendors/${vendorId}/ads-revenue`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch vendor revenue");

  const parsed = data as VendorAdsRevenueResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || parsed.error?.details || "Failed to fetch vendor revenue");
  }

  return parsed.data[0];
}

// Fetch category contribution counts for the overview donut chart.
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

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch category analytics");

  const parsed = data as AdsByCategoryResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch category analytics");
  }

  return parsed.data[0];
}

// Fetch top-level dashboard KPI metrics for the admin overview.
export async function getDashboardOverview(accessToken: string): Promise<DashboardOverviewItem> {
  const response = await fetch(`${resolveBaseUrl()}/api/v1/analytics/dashboard-overview`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await readJson(response);
  await assertProtectedResponse(response, data, "Failed to fetch dashboard overview");

  const parsed = data as DashboardOverviewResponse;
  if (!parsed.success || !parsed.data?.length) {
    throw new Error(parsed.message || "Failed to fetch dashboard overview");
  }

  return parsed.data[0];
}
