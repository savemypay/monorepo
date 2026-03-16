"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Clock3,
  CreditCard,
  Layers3,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  formatCurrency,
  overviewTrendRangeOptions,
} from "@/lib/admin/presentation";
import type { TrendRange } from "@/lib/admin/types";
import {
  getAds,
  getAdsByCategory,
  getDashboardOverview,
  getPaidUsers,
  getTransactionTrend,
  getUserOnboardingTrend,
} from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";

type TrendEntity = "customer" | "vendor";
type EntityTrendPoint = {
  label: string;
  value: number;
};
type EntityTrendSummary = {
  totalNewUsers: number;
  totalUsersTillDate: number;
  points: EntityTrendPoint[];
};
type CollectionTrendSummary = {
  totalTransactions: number;
  totalUniquePayingUsers: number;
  totalPaidAmount: number;
  points: EntityTrendPoint[];
};
type OverviewMetric = {
  label: string;
  value: string;
};
type DashboardOverviewSummary = {
  metrics: OverviewMetric[];
};
type CategoryContributionPoint = {
  label: string;
  value: number;
  color: string;
  adsCount: number;
};
type ApprovalQueueItem = {
  id: number;
  title: string;
  vendorLabel: string;
  tokenAmount: number;
  totalQty: number;
  age: string;
};
type DealsSnapshotItem = {
  id: number;
  title: string;
  vendorLabel: string;
  status: string;
  totalQty: number;
  slotsSold: number;
  tokenAmount: number;
};
type RecentPaymentItem = {
  id: number;
  dealRef: string;
  customerName: string;
  status: string;
  createdAt: string;
  amount: number;
  orderId:string;
};

type MetricIconKey = "deals" | "approval" | "collections" | "vendors" | "customers" | "payments";
type MetricTheme = {
  bgClassName: string;
  iconClassName: string;
};

const ICON_MAP: Record<MetricIconKey, LucideIcon> = {
  deals: Layers3,
  approval: Clock3,
  collections: Wallet,
  vendors: CreditCard,
  customers: UserRound,
  payments: CreditCard,
};

const METRIC_ICON_KEYS: MetricIconKey[] = ["deals", "approval", "collections", "vendors", "customers", "payments"];
const METRIC_THEMES: Record<MetricIconKey, MetricTheme> = {
  deals: {
    bgClassName: "bg-sky-50",
    iconClassName: "text-sky-700",
  },
  approval: {
    bgClassName: "bg-amber-50",
    iconClassName: "text-amber-700",
  },
  collections: {
    bgClassName: "bg-emerald-50",
    iconClassName: "text-emerald-700",
  },
  vendors: {
    bgClassName: "bg-violet-50",
    iconClassName: "text-violet-700",
  },
  customers: {
    bgClassName: "bg-rose-50",
    iconClassName: "text-rose-700",
  },
  payments: {
    bgClassName: "bg-cyan-50",
    iconClassName: "text-cyan-700",
  },
};
const CATEGORY_COLORS = ["#163B63", "#F2B705", "#2DD4BF", "#F43F5E", "#A855F7"];

type TrendTooltipPayload = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function TrendTooltip({ active, payload, label }: TrendTooltipPayload) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">{formatCurrency(Number(payload[0].value) || 0)}</p>
    </div>
  );
}

type DonutTooltipPayload = {
  name?: string;
  value?: number;
  payload?: { label?: string; adsCount?: number };
};

type DonutTooltipProps = {
  active?: boolean;
  payload?: DonutTooltipPayload[];
};

type CountTooltipPayload = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unitLabel: string;
};

const RANGE_TO_GRANULARITY: Record<TrendRange, "day" | "week" | "month" | "year"> = {
  last_week: "day",
  one_month: "week",
  three_months: "month",
  last_year: "month",
};

function formatApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: Date, range: TrendRange) {
  const next = new Date(date);

  if (range === "last_week") {
    next.setDate(next.getDate() - 6);
    return next;
  }

  if (range === "one_month") {
    next.setMonth(next.getMonth() - 1);
    return next;
  }

  if (range === "three_months") {
    next.setMonth(next.getMonth() - 3);
    return next;
  }

  next.setFullYear(next.getFullYear() - 1);
  return next;
}

function formatTrendLabel(start: string, end: string, granularity: "day" | "week" | "month" | "year") {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (granularity === "day") {
    return startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  if (granularity === "week") {
    const startLabel = startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const endLabel = endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return `${startLabel} - ${endLabel}`;
  }

  if (granularity === "month") {
    return startDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }

  return startDate.toLocaleDateString("en-IN", { year: "numeric" });
}

function getApprovalAgeTone(age: string) {
  const hours = Number.parseInt(age, 10);

  if (Number.isNaN(hours)) {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  if (hours >= 24) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (hours >= 12) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function formatApprovalAge(validFrom: string) {
  const createdAt = new Date(validFrom);
  const diffMs = Date.now() - createdAt.getTime();

  if (Number.isNaN(createdAt.getTime()) || diffMs <= 0) {
    return "Recently added";
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (totalHours < 1) {
    return "Less than 1 hour";
  }

  if (totalHours < 24) {
    return `${totalHours} hours waiting`;
  }

  const days = Math.floor(totalHours / 24);
  return `${days} days waiting`;
}

function formatDateTime(dateTime: string) {
  const parsed = new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function DonutTooltip({ active, payload }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const label = item.payload?.label || item.name || "Category";

  return (
    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {(item.payload?.adsCount ?? 0).toLocaleString("en-IN")} ads
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-500">{item.value}% contribution</p>
    </div>
  );
}

function CountTooltip({ active, payload, label, unitLabel }: CountTooltipPayload) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {Number(payload[0].value).toLocaleString("en-IN")} {unitLabel}
      </p>
    </div>
  );
}

export default function OverviewPage() {
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [collectionRange, setCollectionRange] = useState<TrendRange>("last_week");
  const [entityRange, setEntityRange] = useState<TrendRange>("one_month");
  const [trendEntity, setTrendEntity] = useState<TrendEntity>("customer");
  const [overviewData, setOverviewData] = useState<DashboardOverviewSummary | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [approvalQueueData, setApprovalQueueData] = useState<ApprovalQueueItem[]>([]);
  const [approvalQueueLoading, setApprovalQueueLoading] = useState(false);
  const [approvalQueueError, setApprovalQueueError] = useState<string | null>(null);
  const [dealsSnapshotData, setDealsSnapshotData] = useState<DealsSnapshotItem[]>([]);
  const [dealsSnapshotLoading, setDealsSnapshotLoading] = useState(false);
  const [dealsSnapshotError, setDealsSnapshotError] = useState<string | null>(null);
  const [recentPaymentsData, setRecentPaymentsData] = useState<RecentPaymentItem[]>([]);
  const [recentPaymentsLoading, setRecentPaymentsLoading] = useState(false);
  const [recentPaymentsError, setRecentPaymentsError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryContributionPoint[]>([]);
  const [categoryTotalAds, setCategoryTotalAds] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [collectionTrendData, setCollectionTrendData] = useState<CollectionTrendSummary | null>(null);
  const [collectionTrendLoading, setCollectionTrendLoading] = useState(false);
  const [collectionTrendError, setCollectionTrendError] = useState<string | null>(null);
  const [entityTrendData, setEntityTrendData] = useState<EntityTrendSummary | null>(null);
  const [entityTrendLoading, setEntityTrendLoading] = useState(false);
  const [entityTrendError, setEntityTrendError] = useState<string | null>(null);
  const selectedCollectionRangeLabel =
    overviewTrendRangeOptions.find((option) => option.value === collectionRange)?.label ?? "Last Week";
  const selectedEntityRangeLabel =
    overviewTrendRangeOptions.find((option) => option.value === entityRange)?.label ?? "Last Week";
  const entityUnitLabel = trendEntity === "customer" ? "customers" : "vendors";
  const entityChartTitle = trendEntity === "customer" ? "Customer" : "Vendor";
  const entityChartDescription =
    trendEntity === "customer"
      ? `${selectedEntityRangeLabel} customer acquisition movement.`
      : `${selectedEntityRangeLabel} active vendor expansion.`;
  const entityStrokeColor = trendEntity === "customer" ? "#F2B705" : "#173B63";
  const entityDotColor = trendEntity === "customer" ? "#163B63" : "#C68424";
  const entityTrend = entityTrendData?.points ?? [];
  const revenueTrend = collectionTrendData?.points ?? [];
  const overviewMetrics = overviewData?.metrics ?? [];
  const sessionMissingMessage = hydrated && !accessToken ? "Admin session not found" : null;
  const resolvedOverviewError = sessionMissingMessage || overviewError;
  const resolvedApprovalQueueError = sessionMissingMessage || approvalQueueError;
  const resolvedDealsSnapshotError = sessionMissingMessage || dealsSnapshotError;
  const resolvedRecentPaymentsError = sessionMissingMessage || recentPaymentsError;
  const resolvedCategoryError = sessionMissingMessage || categoryError;
  const resolvedCollectionTrendError = sessionMissingMessage || collectionTrendError;
  const resolvedEntityTrendError = sessionMissingMessage || entityTrendError;

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setOverviewLoading(true);
        setOverviewError(null);
        return getDashboardOverview(accessToken);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setOverviewData({
          metrics: [
            {
              label: "Live Deals",
              value: data.live_deals.toLocaleString("en-IN"),
            },
            {
              label: "Pending Approval",
              value: data.pending_approval.toLocaleString("en-IN"),
            },
            {
              label: "Collections Today",
              value: formatCurrency(data.collections_today),
            },
            {
              label: "Active Vendors",
              value: data.active_vendors.toLocaleString("en-IN"),
            },
            {
              label: "New Customers",
              value: data.new_customers.toLocaleString("en-IN"),
            },
            {
              label: "Failed Payments",
              value: data.failed_payments.toLocaleString("en-IN"),
            },
          ],
        });
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setOverviewError(error instanceof Error ? error.message : "Failed to load dashboard overview");
      })
      .finally(() => {
        if (!isCancelled) {
          setOverviewLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setRecentPaymentsLoading(true);
        setRecentPaymentsError(null);
        return getPaidUsers(accessToken);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setRecentPaymentsData(
          data.slice(0, 4).map((item) => ({
            id: item.payment_id,
            dealRef: item.deal_ref,
            customerName: item.user_name || item.user_email || item.user_phone_number,
            status: item.status,
            createdAt: formatDateTime(item.created_at),
            amount: item.amount,
            orderId:item.order_id,
          })),
        );
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setRecentPaymentsError(error instanceof Error ? error.message : "Failed to load recent payments");
      })
      .finally(() => {
        if (!isCancelled) {
          setRecentPaymentsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setDealsSnapshotLoading(true);
        setDealsSnapshotError(null);
        return Promise.all([
          getAds({ accessToken, status: "active" }),
          getAds({ accessToken, status: "draft" }),
        ]);
      })
      .then((responses) => {
        if (!responses || isCancelled) {
          return;
        }

        const [activeAds, draftAds] = responses;
        const snapshot = [...activeAds, ...draftAds].slice(0, 4).map((item) => ({
          id: item.id,
          title: item.title,
          vendorLabel: `Vendor #${item.vendor_id}`,
          status: item.status,
          totalQty: item.total_qty,
          slotsSold: item.slots_sold,
          tokenAmount: item.token_amount,
        }));

        setDealsSnapshotData(snapshot);
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setDealsSnapshotError(error instanceof Error ? error.message : "Failed to load deals snapshot");
      })
      .finally(() => {
        if (!isCancelled) {
          setDealsSnapshotLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setApprovalQueueLoading(true);
        setApprovalQueueError(null);
        return getAds({
          accessToken,
          status: "draft",
        });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setApprovalQueueData(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            vendorLabel: `Vendor #${item.vendor_id}`,
            tokenAmount: item.token_amount,
            totalQty: item.total_qty,
            age: formatApprovalAge(item.valid_from),
          })),
        );
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setApprovalQueueError(error instanceof Error ? error.message : "Failed to load approval queue");
      })
      .finally(() => {
        if (!isCancelled) {
          setApprovalQueueLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setCategoryLoading(true);
        setCategoryError(null);
        return getAdsByCategory({ accessToken });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        const totalAds = data.total_ads;
        setCategoryTotalAds(totalAds);
        setCategoryData(
          data.by_category.map((item, index) => ({
            label: item.category,
            value: totalAds > 0 ? Math.round((item.ads_count / totalAds) * 100) : 0,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            adsCount: item.ads_count,
          })),
        );
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setCategoryError(error instanceof Error ? error.message : "Failed to load category contribution");
      })
      .finally(() => {
        if (!isCancelled) {
          setCategoryLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    const today = new Date();
    const dateTo = formatApiDate(today);
    const dateFrom = formatApiDate(shiftDate(today, collectionRange));
    const granularity = RANGE_TO_GRANULARITY[collectionRange];
    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setCollectionTrendLoading(true);
        setCollectionTrendError(null);
        return getTransactionTrend({
          accessToken,
          granularity,
          dateFrom,
          dateTo,
        });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setCollectionTrendData({
          totalTransactions: data.total_transactions,
          totalUniquePayingUsers: data.total_unique_paying_users,
          totalPaidAmount: data.total_paid_amount,
          points: data.trend.map((point) => ({
            label: formatTrendLabel(point.period_start, point.period_end, data.granularity),
            value: point.paid_amount,
          })),
        });
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setCollectionTrendError(error instanceof Error ? error.message : "Failed to load transaction trend");
      })
      .finally(() => {
        if (!isCancelled) {
          setCollectionTrendLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, collectionRange, hydrated]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    const today = new Date();
    const dateTo = formatApiDate(today);
    const dateFrom = formatApiDate(shiftDate(today, entityRange));
    const granularity = RANGE_TO_GRANULARITY[entityRange];
    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setEntityTrendLoading(true);
        setEntityTrendError(null);
        return getUserOnboardingTrend({
          accessToken,
          role: trendEntity,
          granularity,
          dateFrom,
          dateTo,
        });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setEntityTrendData({
          totalNewUsers: data.total_new_users,
          totalUsersTillDate: data.total_users_till_to_date,
          points: data.trend.map((point) => ({
            label: formatTrendLabel(point.period_start, point.period_end, data.granularity),
            value: point.new_users,
          })),
        });
      })
      .catch((error: unknown) => {
        if (isCancelled || (error instanceof Error && error.message === "cancelled")) {
          return;
        }

        setEntityTrendError(error instanceof Error ? error.message : "Failed to load onboarding trend");
      })
      .finally(() => {
        if (!isCancelled) {
          setEntityTrendLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, entityRange, hydrated, trendEntity]);

  return (
    <div className="space-y-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back. Here is what is happening across SaveMyPay today.</p>
        </div>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {overviewMetrics.map((metric, index) => {
          const iconKey = METRIC_ICON_KEYS[index % METRIC_ICON_KEYS.length];
          const Icon = ICON_MAP[iconKey];
          const theme = METRIC_THEMES[iconKey];

          return (
            <Card key={metric.label} className="admin-panel rounded-3xl border-blue-100">
              <CardContent className="">
                <div className="mb-4 flex items-start gap-4">
                  <div className={`rounded-xl p-2.5 ${theme.bgClassName} ${theme.iconClassName}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</h3>
                    <p className="text-3xl font-bold text-[#163B63]">{overviewLoading ? "--" : metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {resolvedOverviewError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
          {resolvedOverviewError}
        </div>
      ) : null}

      <section className="mb-8 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Marketplace Trends</h2>
          <p className="mt-1 text-sm text-gray-500">Track collections, customer growth, and vendor activation over time.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="admin-panel rounded-3xl border-blue-100 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Revenue Trend</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">{selectedCollectionRangeLabel} platform collections.</CardDescription>
            </div>
            <Select
              value={collectionRange}
              onValueChange={(value) => {
                setCollectionTrendLoading(Boolean(accessToken));
                setCollectionTrendError(accessToken || !hydrated ? null : "Admin session not found");
                setCollectionRange(value as TrendRange);
              }}
            >
              <SelectTrigger className="h-11 min-w-[150px] rounded-2xl border-line bg-white px-4 text-sm font-semibold text-slate-700 shadow-none">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {overviewTrendRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {resolvedCollectionTrendError ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                  {resolvedCollectionTrendError}
                </div>
              ) : collectionTrendLoading ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
                  Loading transaction trend...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value: number) => formatCurrency(value)}
                      width={72}
                    />
                    <RechartsTooltip content={<TrendTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Collections"
                      stroke="#163B63"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "#F2B705", stroke: "#ffffff" }}
                      activeDot={{ r: 6, fill: "#163B63" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="admin-panel rounded-3xl border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Category Contribution</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">{categoryLoading ? "Loading active category mix." : `${categoryTotalAds} total ads in distribution.`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] flex-col items-center justify-center">
              {resolvedCategoryError ? (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                  {resolvedCategoryError}
                </div>
              ) : categoryLoading ? (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-line  px-6 text-sm font-medium text-muted">
                  Loading category contribution...
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-line  px-6 text-center text-sm font-medium text-muted">
                  No category analytics available yet.
                </div>
              ) : (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {categoryData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {categoryData.map((entry) => (
                      <div key={entry.label} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </section>

      <section className="mb-8">
        <Card className="admin-panel rounded-3xl border-blue-100 shadow-sm">
          <CardHeader className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">{entityChartTitle}</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">{entityChartDescription}</CardDescription>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                value={trendEntity}
                onValueChange={(value) => {
                  setEntityTrendLoading(Boolean(accessToken));
                  setEntityTrendError(accessToken || !hydrated ? null : "Admin session not found");
                  setTrendEntity(value as TrendEntity);
                }}
              >
                <SelectTrigger className="h-11 min-w-[160px] rounded-2xl border-line bg-white px-4 text-sm font-semibold text-slate-700 shadow-none">
                  <SelectValue placeholder="Select trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={entityRange}
                onValueChange={(value) => {
                  setEntityTrendLoading(Boolean(accessToken));
                  setEntityTrendError(accessToken || !hydrated ? null : "Admin session not found");
                  setEntityRange(value as TrendRange);
                }}
              >
                <SelectTrigger className="h-11 min-w-[150px] rounded-2xl border-line bg-white px-4 text-sm font-semibold text-slate-700 shadow-none">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {overviewTrendRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {resolvedEntityTrendError ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                  {resolvedEntityTrendError}
                </div>
              ) : entityTrendLoading ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-line  px-6 text-sm font-medium text-muted">
                  Loading onboarding trend...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={entityTrend} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      width={48}
                    />
                    <RechartsTooltip
                      content={<CountTooltip unitLabel={entityUnitLabel} />}
                      cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={entityChartTitle}
                      stroke={entityStrokeColor}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: entityDotColor, stroke: "#ffffff" }}
                      activeDot={{ r: 6, fill: entityStrokeColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card className="admin-panel overflow-hidden rounded-3xl border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Approval Queue</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Deals currently waiting for review or changes.</CardDescription>
            </div>
            <Link
              href="/deals"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#163B63]/15 px-4 text-sm font-bold text-[#163B63] transition hover:bg-[#163B63]/5"
            >
              View All Deals
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {resolvedApprovalQueueError ? (
              <div className="m-6 flex min-h-36 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                {resolvedApprovalQueueError}
              </div>
            ) : approvalQueueLoading ? (
              <div className="m-6 flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-sm font-medium text-muted">
                Loading draft deals...
              </div>
            ) : approvalQueueData.length === 0 ? (
              <div className="m-6 flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-center text-sm font-medium text-muted">
                No draft deals are waiting for approval.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className=" hover:bg-slate-50/80">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Deal</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Vendor</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Token</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total Qty</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Wait Time</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalQueueData.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70">
                    <TableCell className="px-6 py-5 font-semibold text-slate-900 whitespace-normal">{item.title}</TableCell>
                    <TableCell className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-normal">{item.vendorLabel}</TableCell>
                    <TableCell className="px-6 py-5 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.tokenAmount)}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {item.totalQty.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="px-6 py-5 whitespace-normal">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${getApprovalAgeTone(item.age)}`}
                      >
                          <Clock3 size={15} className="opacity-70" />
                          {item.age}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Link
                          href={`/deals/${item.id}`}
                          className="inline-flex items-center justify-center text-sm font-medium text-[#163B63] transition hover:underline"
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="admin-panel rounded-3xl border-blue-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Live and Pending Deals</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Current deal performance snapshot.</CardDescription>
              </div>
              <Link href="/deals" className="text-sm font-bold text-[#163B63] hover:underline">
                Open Deals
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedDealsSnapshotError ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                {resolvedDealsSnapshotError}
              </div>
            ) : dealsSnapshotLoading ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-sm font-medium text-muted">
                Loading active and draft deals...
              </div>
            ) : dealsSnapshotData.length === 0 ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-center text-sm font-medium text-muted">
                No active or draft deals available right now.
              </div>
            ) : (
              dealsSnapshotData.map((deal) => {
                const progressPct = deal.totalQty > 0 ? Math.min((deal.slotsSold / deal.totalQty) * 100, 100) : 0;

                return (
                  <div key={deal.id} className="rounded-2xl border border-blue-100 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{deal.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          AD-{deal.id} · {deal.vendorLabel}
                        </p>
                      </div>
                      <StatusBadge status={deal.status} />
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-[#163B63]" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {deal.slotsSold}/{deal.totalQty}
                      </span>
                      <span className="ml-auto text-sm font-bold text-gray-900">{formatCurrency(deal.tokenAmount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="admin-panel rounded-3xl border-blue-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Recent Payments</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Pending, failed, and refunded transactions that need context.</CardDescription>
              </div>
              <Link href="/payments" className="text-sm font-bold text-[#163B63] hover:underline">
                Open Payments
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedRecentPaymentsError ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
                {resolvedRecentPaymentsError}
              </div>
            ) : recentPaymentsLoading ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-sm font-medium text-muted">
                Loading recent payments...
              </div>
            ) : recentPaymentsData.length === 0 ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-line  px-6 text-center text-sm font-medium text-muted">
                No recent paid users available right now.
              </div>
            ) : (
              recentPaymentsData.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-blue-100 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{payment.orderId}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {payment.customerName}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">{payment.createdAt}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
