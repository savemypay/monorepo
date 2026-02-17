"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import { AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { getMyDeals, PurchasedDealOrder } from "@/lib/api/myDeals";
import { useAuthStore } from '@/lib/store/authStore';

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
          href="/login?redirect=%2Fcustomer%2Fmy-deals"
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Deals you have already joined using token payment.</p>
        </div>
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
              <Link href="/customer" className="inline-block text-blue-600 font-bold hover:underline">
                Browse Active Pools
              </Link>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && sortedOrders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedOrders.map((order) => {
            const ad = mapAd(order);
            const orderStatus = statusStyles(order.status || "");
            const amountLabel = formatAmount(Number(order.amount) || 0, order.currency || "INR");
            const orderDate = formatDate(order.created_at);

            return (
              <article
                key={`${order.payment_id}-${order.order_id}`}
                className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{ad.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ad.category}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatus}`}>
                    {order.status || "unknown"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Amount</p>
                    <p className="font-semibold text-gray-900">{amountLabel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Purchased On</p>
                    <p className="font-semibold text-gray-900">{orderDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Order ID</p>
                    <p className="font-medium text-gray-900 truncate">{order.order_id || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Deal Ref</p>
                    <p className="font-medium text-gray-900 truncate">{order.deal_ref || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Payment ID: {order.payment_id}</span>
                  {ad.dealId ? (
                    <Link
                      href={`/customer/deals/${ad.dealId}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View Deal
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">No deal link</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
