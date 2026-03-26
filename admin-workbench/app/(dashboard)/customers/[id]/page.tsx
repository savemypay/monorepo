"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminUsers } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
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

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);
  const invalidCustomerId = !Number.isFinite(customerId);
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [customer, setCustomer] = useState<AdminUserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    if (invalidCustomerId || !hydrated || !accessToken) {
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
        setMissing(false);
        return getAdminUsers({ accessToken, role: "customer" });
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        const matchedCustomer = data.customers.find((item) => item.id === customerId) ?? null;
        setCustomer(matchedCustomer);
        setMissing(!matchedCustomer);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load customer");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, customerId, hydrated, invalidCustomerId]);

  if (invalidCustomerId || missing) {
    notFound();
  }

  if (resolvedError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-700">
        {resolvedError}
      </div>
    );
  }

  if (loading || !customer) {
    return (
      <div className="rounded-2xl border border-line bg-panel-strong px-6 py-5 text-sm font-medium text-muted">
        Loading customer profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Profile"
        title={customer.name}
        description="Inspect the live customer account record exposed by the admin users API."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="admin-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={customer.is_active ? "Active" : "Inactive"} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              Customer ID {customer.id}
            </span>
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {customer.role}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Email</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{customer.email || "--"}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Phone Number</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{customer.phone_number || "--"}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Joined</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{formatDate(customer.created_at)}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Account State</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{customer.is_active ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="text-lg font-bold text-brand">Admin notes</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-2xl bg-panel-strong px-4 py-3">This profile is currently powered only by the admin users listing response.</p>
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Customer-specific orders, payments, or support history can be attached here once dedicated endpoints are available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
