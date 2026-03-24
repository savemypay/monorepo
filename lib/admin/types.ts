import type { LucideIcon } from "lucide-react";

export type AdminRole =
  | "Admin";

export type NavItem = {
  label: string;
  href: string;
  group: "Workspace" | "Account";
  icon: LucideIcon;
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  tone: "neutral" | "positive" | "warning";
};

export type DealStatus =
  | "Pending Review"
  | "Needs Changes"
  | "Approved"
  | "Live"
  | "Paused"
  | "Closed"
  | "Rejected";

export type DealRecord = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  status: DealStatus;
  interested: number;
  paid: number;
  revenue: number;
  createdAt: string;
  validTo: string;
};

export type VendorRecord = {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  status: "Active" | "Under Review" | "Suspended";
  activeDeals: number;
  revenue: number;
  complaints: number;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spend: number;
  rewards: number;
  status: "Healthy" | "Flagged";
};

export type PaymentRecord = {
  id: string;
  dealId: string;
  customer: string;
  vendor: string;
  amount: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
  createdAt: string;
};

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export type TrendRange = "last_week" | "one_month" | "three_months" | "last_year";

export type AdminLoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

export type AdminLoginItem = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: string;
};

export type AdminLoginResponse = {
  success: boolean;
  message: string;
  data: AdminLoginItem[];
  error: string | null;
};

export type UserOnboardingTrendRole = "customer" | "vendor";
export type ApiTrendGranularity = "day" | "week" | "month" | "year";

export type UserOnboardingTrendRequest = {
  accessToken: string;
  granularity: ApiTrendGranularity;
  role: UserOnboardingTrendRole;
  dateFrom?: string;
  dateTo?: string;
};

export type UserOnboardingTrendPoint = {
  period_start: string;
  period_end: string;
  new_users: number;
  cumulative_users: number;
};

export type UserOnboardingTrendItem = {
  granularity: ApiTrendGranularity;
  role: UserOnboardingTrendRole;
  date_from: string;
  date_to: string;
  total_new_users: number;
  total_users_till_to_date: number;
  trend: UserOnboardingTrendPoint[];
};

export type UserOnboardingTrendResponse = {
  success: boolean;
  message: string;
  data: UserOnboardingTrendItem[];
  error: string | null;
};

export type TransactionTrendRequest = {
  accessToken: string;
  granularity: ApiTrendGranularity;
  dateFrom?: string;
  dateTo?: string;
  vendorId?: string;
};

export type TransactionTrendPoint = {
  period_start: string;
  period_end: string;
  transactions_count: number;
  unique_paying_users: number;
  paid_amount: number;
  cumulative_paid_amount: number;
};

export type TransactionTrendItem = {
  granularity: ApiTrendGranularity;
  date_from: string;
  date_to: string;
  vendor_id: string | null;
  total_transactions: number;
  total_unique_paying_users: number;
  total_paid_amount: number;
  trend: TransactionTrendPoint[];
};

export type TransactionTrendResponse = {
  success: boolean;
  message: string;
  data: TransactionTrendItem[];
  error: string | null;
};

export type AdsByCategoryRequest = {
  accessToken: string;
  category?: string;
  vendorId?: string;
};

export type AdsByCategoryPoint = {
  category: string;
  ads_count: number;
};

export type AdsByCategoryItem = {
  category_filter: string | null;
  vendor_id: string | null;
  total_ads: number;
  by_category: AdsByCategoryPoint[];
};

export type AdsByCategoryResponse = {
  success: boolean;
  message: string;
  data: AdsByCategoryItem[];
  error: string | null;
};

export type DashboardOverviewItem = {
  live_deals: number;
  pending_approval: number;
  collections_today: number;
  active_vendors: number;
  new_customers: number;
  failed_payments: number;
  new_customers_window_days: number;
};

export type DashboardOverviewResponse = {
  success: boolean;
  message: string;
  data: DashboardOverviewItem[];
  error: string | null;
};

export type AdsListRequest = {
  accessToken: string;
  status?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
};

export type ApiErrorDetails = {
  code?: string;
  details?: string;
} | null;

export type AdTierItem = {
  id: number;
  seq: number;
  qty: number;
  discount_pct: number;
  label: string;
};

export type AdListItem = {
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

export type AdsListResponse = {
  success: boolean;
  message: string;
  data: AdListItem[];
  error: ApiErrorDetails;
};

export type PublishAdResponse = {
  success: boolean;
  message: string;
  data: AdListItem[];
  error: ApiErrorDetails;
};

export type RejectAdResponse = {
  success: boolean;
  message: string;
  data: AdListItem[];
  error: ApiErrorDetails;
};

export type AdDetailResponse = {
  success: boolean;
  message: string;
  data: AdListItem[];
  error: ApiErrorDetails;
};

export type PaidUserItem = {
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

export type PaidUsersResponse = {
  success: boolean;
  message: string;
  data: PaidUserItem[];
  error: ApiErrorDetails;
};

export type PaidUsersStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled";

export type CustomerTransactionAd = {
  id: number;
  title: string;
  product_name: string;
  status: string;
  valid_from: string;
  valid_to: string;
  images: string[];
} | null;

export type CustomerTransactionItem = {
  payment_id: number;
  order_id: string;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  ad: CustomerTransactionAd;
  user_email: string;
  user_phone_number: string;
  user_name: string;
};

export type CustomerTransactionsResponse = {
  success: boolean;
  message: string;
  data: CustomerTransactionItem[];
  error: ApiErrorDetails;
};

export type AdminUsersRole = "all" | "customer" | "vendor";

export type AdminUsersRequest = {
  accessToken: string;
  role?: AdminUsersRole;
  search?: string;
  page?: number;
  limit?: number;
};

export type AdminUserItem = {
  id: number;
  role: "customer" | "vendor";
  name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
};

export type AdminUsersSummaryItem = {
  role_filter: AdminUsersRole;
  total_customers: number;
  total_vendors: number;
  total_count: number;
  customers: AdminUserItem[];
  vendors: AdminUserItem[];
};

export type AdminUsersResponse = {
  success: boolean;
  message: string;
  data: AdminUsersSummaryItem[];
  error: ApiErrorDetails;
};

export type VendorRevenueAdItem = {
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
  description: string;
  terms: string;
  valid_from: string;
  valid_to: string;
  is_favorite: boolean;
  tiers: AdTierItem[];
  revenue_generated: number;
  successful_payments: number;
};

export type VendorAdsRevenueItem = {
  vendor_id: number;
  vendor_name: string | null;
  vendor_email: string | null;
  vendor_phone_number: string | null;
  total_ads: number;
  vendor_total_revenue: number;
  ads: VendorRevenueAdItem[];
};

export type VendorAdsRevenueResponse = {
  success: boolean;
  message: string;
  data: VendorAdsRevenueItem[];
  error: ApiErrorDetails;
};
