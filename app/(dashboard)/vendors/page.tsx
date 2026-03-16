"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function VendorsPage() {
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<AdminUserItem[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      void Promise.resolve()
        .then(() => {
          if (isCancelled) {
            throw new Error("cancelled");
          }

          setLoading(true);
          setError(null);
          return getAdminUsers({
            accessToken,
            role: "vendor",
            search,
          });
        })
        .then((data) => {
          if (!data || isCancelled) {
            return;
          }

          setVendors(data.vendors ?? []);
          setTotalVendors(data.total_vendors);
        })
        .catch((fetchError: unknown) => {
          if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
            return;
          }

          setError(fetchError instanceof Error ? fetchError.message : "Failed to load vendors");
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, hydrated, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor Operations"
        title="Vendors"
        description="Monitor vendor accounts using live admin user records from the platform."
      />

      <div className="admin-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Total Vendors</p>
              <p className="mt-2 text-2xl font-bold text-brand">{loading ? "--" : totalVendors.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendor name, email, or phone"
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
              Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
              No vendors found.
            </div>
          ) : (
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <p className="font-bold text-slate-900"></p>
                      <p className="text-sm text-muted">{vendor.name ||`ID ${vendor.id}`}</p>
                    </td>
                    <td>{vendor.email || "NA"}</td>
                    <td>{vendor.phone_number || "NA"}</td>
                    <td>
                      <StatusBadge status={vendor.is_active ? "Active" : "Inactive"} />
                    </td>
                    <td>{formatDate(vendor.created_at)}</td>
                    <td>
                      <Link href={`/vendors/${vendor.id}`} className="text-sm font-bold text-brand">
                        Open
                      </Link>
                    </td>
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
