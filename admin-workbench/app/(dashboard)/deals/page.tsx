"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAds } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import { formatCurrency } from "@/lib/admin/presentation";
import type { AdListItem } from "@/lib/admin/types";

type DealStatusFilter = "all" | "draft" | "active" | "filled" | "expired" | "canceled";

const DEAL_STATUS_FILTERS: Array<{ label: string; value: DealStatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Filled", value: "filled" },
  { label: "Expired", value: "expired" },
  { label: "Canceled", value: "canceled" },
];

function formatDate(dateTime: string) {
  const parsed = new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DealsPage() {
  const searchParams = useSearchParams();
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deals, setDeals] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;
  const hasNextPage = deals.length === limit;
  const createdStatus = searchParams.get("created");

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

        if (activeFilter === "all") {
          return getAds({ accessToken, page, limit });
        }

        return getAds({ accessToken, status: activeFilter, page, limit });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setDeals(data);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load deals");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, activeFilter, hydrated, limit, page]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Governance"
        title="Deals"
        description="Review deal quality, monitor performance, and move campaigns through their approval lifecycle."
        actionClassName="text-[#D9A304] hover:underline transition"
        action={
          <Link href="/deals/new" prefetch={false} className="text-base font-bold">
            + New Deal
          </Link>
        }
      />

      <div className="admin-panel p-5">
        {createdStatus === "draft" ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Deal created successfully. It is currently in draft status. Verify and publish it from the deals page.
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {DEAL_STATUS_FILTERS.map((filter) => {
            const isActive = filter.value === activeFilter;

            return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setPage(1);
                  }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-slate-700 hover:border-brand/20 hover:text-brand"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 overflow-x-auto">
          {resolvedError ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
              {resolvedError}
            </div>
          ) : loading ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
              Loading deals...
            </div>
          ) : deals.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
              No deals found for the selected status.
            </div>
          ) : (
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Token</th>
                  <th>Total Qty</th>
                  <th>Sold</th>
                  <th>Valid To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <p className="font-bold text-slate-900">{deal.title}</p>
                      <p className="text-sm text-muted">
                        AD-{deal.id} · {deal.category}
                      </p>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800">Vendor #{deal.vendor_id}</p>
                      <p className="text-sm text-muted">{deal.product_name}</p>
                    </td>
                    <td>
                      <StatusBadge status={deal.status} />
                    </td>
                    <td>{formatCurrency(deal.token_amount)}</td>
                    <td>{deal.total_qty.toLocaleString("en-IN")}</td>
                    <td>{deal.slots_sold.toLocaleString("en-IN")}</td>
                    <td>{formatDate(deal.valid_to)}</td>
                    <td>
                      <Link
                        href={`/deals/${deal.id}`}
                        prefetch={false}
                        className="text-sm font-bold text-brand hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>Page {page}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNextPage}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
