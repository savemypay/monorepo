"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdById, publishAd, rejectAd } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import { formatCurrency } from "@/lib/admin/presentation";
import type { AdListItem } from "@/lib/admin/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const dealId = Number(params.id);
  const invalidDealId = !Number.isFinite(dealId);
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [deal, setDeal] = useState<AdListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<"publish" | "reject" | null>(null);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    if (invalidDealId) {
      return;
    }

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
        setMissing(false);
        return getAdById(accessToken, dealId);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setDeal(data);
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

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load deal");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, dealId, hydrated, invalidDealId]);

  if (invalidDealId || missing) {
    notFound();
  }

  if (resolvedError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-700">
        {resolvedError}
      </div>
    );
  }

  if (loading || !deal) {
    return (
      <div className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-muted">
        Loading deal details...
      </div>
    );
  }

  const isDraftDeal = deal.status.toLowerCase() === "draft";

  const handleConfirmAction = async () => {
    if (!accessToken || !isDraftDeal || actionLoading || !actionDialog) {
      return;
    }

    setActionLoading(true);
    setActionMessage(null);

    try {
      const updatedDeal =
        actionDialog === "publish"
          ? await publishAd(accessToken, deal.id)
          : await rejectAd(accessToken, deal.id);

      setDeal(updatedDeal);
      setActionMessage(
        actionDialog === "publish" ? "Deal published successfully." : "Deal rejected successfully."
      );
      setActionDialog(null);
    } catch (actionError: unknown) {
      setActionMessage(actionError instanceof Error ? actionError.message : "Failed to update deal status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Review"
        title={deal.title}
        description="Inspect pricing, inventory, timing, and the commercial structure before taking an admin action."
        actionClassName="text-[#7A8CA3] hover:text-[#163B63] hover:underline transition"
        action={
          <Link
            href="/deals"
            className="text-base font-medium"
          >
            ⬅ Back to deals
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={deal.status}/>
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {deal.category}
            </span>
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              Vendor #{deal.vendor_id}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Token Amount</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(deal.token_amount)}</p>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Original Price</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(deal.original_price)}</p>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Total Quantity</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{deal.total_qty.toLocaleString("en-IN")}</p>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Slots Sold</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{deal.slots_sold.toLocaleString("en-IN")}</p>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Valid From</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatDate(deal.valid_from)}</p>
            </div>
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Valid To</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatDate(deal.valid_to)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand">Description</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">{deal.description || "No description provided."}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand">Terms</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">{deal.terms || "No terms provided."}</p>
          </div>
        </div>

        <div className="space-y-6">
          {isDraftDeal ? (
            <div className="admin-panel p-6">
              <h2 className="text-lg font-bold text-brand">Admin Actions</h2>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => setActionDialog("publish")}
                  disabled={actionLoading}
                  className="rounded-full bg-brand px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoading ? "Publishing..." : "Publish Deal"}
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialog("reject")}
                  disabled={actionLoading}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? "Processing..." : "Reject Deal"}
                </button>
              </div>
              {actionMessage ? <p className="mt-4 text-sm font-medium text-slate-700">{actionMessage}</p> : null}
            </div>
          ) : null}

          <div className="admin-panel p-6">
            <h2 className="text-lg font-bold text-brand">Inventory Snapshot</h2>
            <div className="mt-4 grid gap-3">
              <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Slots Remaining</p>
                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {deal.slots_remaining.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Product Name</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{deal.product_name}</p>
              </div>
            </div>
          </div>

          <div className="admin-panel p-6">
            <h2 className="text-lg font-bold text-brand">Discount Tiers</h2>
            <div className="mt-4 space-y-3">
              {deal.tiers.length === 0 ? (
                <p className="text-sm text-muted">No tiers configured for this deal.</p>
              ) : (
                deal.tiers.map((tier) => (
                  <div key={tier.id} className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{tier.label || `Tier ${tier.seq}`}</p>
                      <span className="text-sm font-bold text-brand">{tier.discount_pct}% off</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">Qty target: {tier.qty.toLocaleString("en-IN")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={actionDialog !== null} onOpenChange={(open) => setActionDialog(open ? actionDialog : null)}>
        <DialogContent className="max-w-md rounded-3xl border border-line bg-panel p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-brand">
              {actionDialog === "reject" ? "Reject this deal?" : "Publish this deal?"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted">
              {actionDialog === "reject"
                ? "This deal will be marked as canceled and removed from approval."
                : "This deal will go live for customers once published."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setActionDialog(null)}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={`rounded-full px-5 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
                actionDialog === "reject" ? "bg-rose-600 hover:bg-rose-700" : "bg-brand hover:opacity-95"
              }`}
            >
              {actionDialog === "reject" ? "Reject Deal" : "Publish Deal"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
