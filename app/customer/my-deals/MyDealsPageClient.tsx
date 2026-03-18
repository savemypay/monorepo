"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import { AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { getMyDeals, PurchasedDealOrder } from "@/lib/api/myDeals";
import { useAuthStore } from '@/lib/store/authStore';
import Image from "next/image";

const FALLBACK_IMAGE = "/assets/Tesla-Model-Y-1-1160x652.webp";

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function getNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return null;
}

function getImage(record: Record<string, unknown>) {
  const directImage = getString(record, ["image", "thumbnail", "cover_image"]);
  if (directImage) return directImage;

  const images = record.images;
  if (Array.isArray(images)) {
    const first = images.find((img) => typeof img === "string" && img.trim());
    if (typeof first === "string" && first.trim()) return first;
  }

  return FALLBACK_IMAGE;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeCurrency = (currency || "INR").toUpperCase();

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount}`;
  }
}

function statusStyles(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("success") || normalized.includes("succeed") || normalized.includes("captured")) {
    return "bg-green-100 text-green-700";
  }
  if (normalized.includes("fail")) {
    return "bg-red-100 text-red-700";
  }
  if (normalized.includes("pending") || normalized.includes("created")) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-slate-100 text-slate-700";
}

function mapAd(order: PurchasedDealOrder) {
  const ad = toRecord(order.ad);
  const dealId = getNumber(ad, ["id", "ad_id", "deal_id"]);

  return {
    dealId,
    title: getString(ad, ["product_name", "title", "name"]) || order.deal_ref || "Purchased Deal",
    category: getString(ad, ["category", "type"]) || "General",
    image: getImage(ad),
  };
}

export default function MyDealsPage() {
  const { user, accessToken } = useAuthStore();
  const [orders, setOrders] = useState<PurchasedDealOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyDeals(accessToken);
      setOrders(data);
    } catch (error: unknown) {
      setOrders([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch your purchased deals."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!user || !accessToken) return;
    loadOrders();
  }, [user, accessToken, loadOrders]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [orders]
  );

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-100 p-6 rounded-full">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Please Login</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            You need to be logged in to view your orders and track pool progress.
          </p>
        </div>
        <Link
          href="/login?redirect=%2Fcustomer%2Fmy-orders"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        {sortedOrders.length > 0 && !isLoading && (
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold w-fit">
            {sortedOrders.length} order{sortedOrders.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-medium">Loading your orders...</p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-red-700">
            <AlertCircle size={18} className="mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load orders</p>
              <p className="text-sm mt-1">{errorMessage}</p>
              <button
                onClick={loadOrders}
                className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && sortedOrders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 py-10 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ShoppingBag size={48} className="text-gray-300" />
            <div>
              <p className="text-gray-900 font-medium">No purchased deals yet.</p>
              <p className="text-gray-500 text-sm mb-4">Join a pool to see your orders here.</p>
              <Link href="/customer" className="inline-block  text-[#168F8E] font-bold hover:underline">
                Browse Active Pools
              </Link>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && sortedOrders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Deal</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Deal Ref</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Purchased On</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const ad = mapAd(order);
                  const orderStatus = statusStyles(order.status || "");
                  const amountLabel = formatAmount(Number(order.amount) || 0, order.currency || "INR");
                  const orderDate = formatDate(order.created_at);

                  return (
                    <tr
                      key={`${order.payment_id}-${order.order_id}`}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-3">
                          {/* <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                            <Image
                              src={ad.image}
                              alt={ad.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div> */}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{ad.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{ad.category}</p>
                            <p className="mt-1 text-[11px] text-slate-400">Payment ID: {order.payment_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="max-w-[170px] truncate text-sm font-medium text-slate-900">
                          {order.order_id || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="max-w-[140px] truncate text-sm text-slate-700">{order.deal_ref || "-"}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-semibold text-slate-900">{amountLabel}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm text-slate-700">{orderDate}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatus}`}>
                          {order.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {ad.dealId ? (
                          <Link
                            href={`/customer/deals/${ad.dealId}`}
                            className="inline-flex rounded-lg bg-[#163B63]/8 px-3 py-2 text-sm font-semibold text-[#163B63] transition-colors hover:bg-[#163B63]/12"
                          >
                            View Deal
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">No deal link</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
