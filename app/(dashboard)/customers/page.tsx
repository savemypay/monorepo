"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminUsers } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { AdminUserItem } from "@/lib/admin/types";

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

export default function CustomersPage() {
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [customers, setCustomers] = useState<AdminUserItem[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / limit));

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
        return getAdminUsers({
          accessToken,
          role: "customer",
          search: debouncedSearch,
          page,
          limit,
        });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setCustomers(data.customers ?? []);
        setTotalCustomers(data.total_customers);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load customers");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated, debouncedSearch, page, limit]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Oversight"
        title="Customers"
        description="Review customer accounts using live admin user records from the platform."
      />

      <div className="admin-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Total Customers</p>
              <p className="mt-2 text-2xl font-bold text-brand">{loading ? "--" : totalCustomers.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search customer name, email, or phone"
              className="h-11 w-full rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {resolvedError ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
              {resolvedError}
            </div>
          ) : loading ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
              No customers found.
            </div>
          ) : (
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <p className="text-sm text-muted">{customer.name || `ID ${customer.id}`}</p>
                    </td>
                    <td>{customer.email || "NA"}</td>
                    <td>{customer.phone_number || "NA"}</td>
                    <td>
                      <StatusBadge status={customer.is_active ? "Active" : "Inactive"} />
                    </td>
                    <td>{formatDate(customer.created_at)}</td>
                  <td>
                    <Link href={`/customers/${customer.id}/transactions`} className="text-sm font-bold text-brand">
                      Transactions
                    </Link>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
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
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
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
