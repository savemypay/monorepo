"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getVendorAdsRevenue, type VendorAdsRevenueItem } from "@/lib/admin/api";
import { readStoredAdminSession } from "@/lib/admin/auth";
import { formatCurrency } from "@/lib/admin/mock-data";

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

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const vendorId = Number(params.id);
  const invalidVendorId = !Number.isFinite(vendorId);
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined);
  const [vendorData, setVendorData] = useState<VendorAdsRevenueItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const sessionReady = accessToken !== undefined;
  const resolvedError = sessionReady && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    void Promise.resolve().then(() => {
      setAccessToken(readStoredAdminSession()?.accessToken ?? null);
    });
  }, []);

  useEffect(() => {
    if (invalidVendorId || !sessionReady || !accessToken) {
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
        return getVendorAdsRevenue(accessToken, vendorId);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setVendorData(data);
        setMissing(false);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        if (fetchError instanceof Error && /not found/i.test(fetchError.message)) {
          setMissing(true);
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load vendor revenue");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, invalidVendorId, sessionReady, vendorId]);

  if (invalidVendorId || missing) {
    notFound();
  }

  if (resolvedError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-700">
        {resolvedError}
      </div>
    );
  }

  if (loading || !vendorData) {
    return (
      <div className="rounded-2xl border border-line bg-panel-strong px-6 py-5 text-sm font-medium text-muted">
        Loading vendor revenue details...
      </div>
    );
  }

  const vendorName = vendorData.vendor_name || `Vendor #${vendorData.vendor_id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor Revenue"
        title={vendorName}
        description="Inspect vendor contact information, ad volume, total revenue, and per-ad monetization."
      />

        <div className="admin-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={vendorData.total_ads > 0 ? "Active" : "Inactive"} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              Vendor ID {vendorData.vendor_id}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Vendor Email</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{vendorData.vendor_email || "--"}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Phone Number</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{vendorData.vendor_phone_number || "--"}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Total Ads</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{vendorData.total_ads.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Total Revenue</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatCurrency(vendorData.vendor_total_revenue)}
              </p>
            </div>
          </div>
        </div>
      <div className="admin-panel p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-brand">Vendor Ads</h2>
          <p className="mt-1 text-sm text-muted">Revenue and payment performance for each ad owned by this vendor.</p>
        </div>

        {vendorData.ads.length === 0 ? (
          <div className="rounded-2xl border border-line bg-panel-strong px-6 py-5 text-sm font-medium text-muted">
            No ads found for this vendor.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Status</th>
                  <th>Token</th>
                  <th>Payments</th>
                  <th>Slots Sold</th>
                  <th>Revenue</th>
                  <th>Valid To</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.ads.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <p className="font-bold text-slate-900">{ad.title}</p>
                      <p className="text-sm text-muted">
                        AD-{ad.id} · {ad.product_name} · {ad.category}
                      </p>
                    </td>
                    <td>
                      <StatusBadge status={ad.status} />
                    </td>
                    <td>{formatCurrency(ad.token_amount)}</td>
                    <td>{ad.successful_payments.toLocaleString("en-IN")}</td>
                    <td>
                      {ad.slots_sold.toLocaleString("en-IN")} / {ad.total_qty.toLocaleString("en-IN")}
                    </td>
                    <td>{formatCurrency(ad.revenue_generated)}</td>
                    <td>{formatDate(ad.valid_to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
