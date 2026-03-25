"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaidUsers } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { formatCurrency } from "@/lib/admin/presentation";
import type { PaidUserItem, PaidUsersStatus } from "@/lib/admin/types";

const PAYMENT_STATUS_FILTERS: Array<{ label: string; value: PaidUsersStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Requires Action", value: "requires_action" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Canceled", value: "canceled" },
];

function formatDateTime(dateTime: string) {
  const parsed = new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PaymentsPage() {
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const searchParams = useSearchParams();
  const customerIdFilter = searchParams.get("customer_id") ?? "";
  const [payments, setPayments] = useState<PaidUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaidUsersStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;

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

        setLoading(true);
        setError(null);
        return getPaidUsers(accessToken, {
          status: statusFilter === "all" ? undefined : statusFilter,
          customerSearch: debouncedSearch,
          customerId: customerIdFilter || undefined,
        });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setPayments(data);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load payments");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated, statusFilter, debouncedSearch, customerIdFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance Operations"
        title="Payments"
        description="Track transaction health, reconciliation risk, refunds, and deal-linked revenue in one finance view."
      />

      <div className="admin-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaidUsersStatus | "all")}>
              <SelectTrigger className="h-11 w-[220px] rounded-2xl border border-line bg-white text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full max-w-sm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer name, email, or phone"
              className="h-11 w-full rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        {customerIdFilter ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="rounded-full border border-line bg-panel-strong px-3 py-1.5">
              Filtered by customer #{customerIdFilter}
            </span>
            <Link href="/payments" prefetch={false} className="text-sm font-semibold text-brand">
              Clear filter
            </Link>
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto">
        {resolvedError ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
            {resolvedError}
          </div>
        ) : loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
            No payments found.
          </div>
        ) : (
          <table className="table-grid">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>
                    <p className="font-bold text-slate-900">{payment.order_id || `PY-${payment.payment_id}`}</p>
                    <p className="text-sm text-muted"># {payment.deal_ref}</p>
                  </td>
                  <td>
                    <div className="space-y-1 text-sm text-slate-700">
                      {payment.user_name ? (
                        <div className="flex items-center gap-2">
                          <UserRound size={14} className="text-muted" />
                          <span className="font-semibold text-slate-900">{payment.user_name}</span>
                        </div>
                      ) : null}
                      {payment.user_email ? (
                        <div className="flex items-center gap-2 text-muted">
                          <Mail size={14} />
                          <span>{payment.user_email}</span>
                        </div>
                      ) : null}
                      {payment.user_phone_number ? (
                        <div className="flex items-center gap-2 text-muted">
                          <Phone size={14} />
                          <span>{payment.user_phone_number}</span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDateTime(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
}
