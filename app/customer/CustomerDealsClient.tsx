"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import DealCard from "@/components/DealCard";
import { Ad, getAds } from "@/lib/api/ads";

type DealViewModel = {
  id: number;
  title: string;
  image: string;
  discount: string;
  price: string;
  joined: number;
  target: number;
  endsIn: string;
  category: string;
};

const FALLBACK_IMAGE = "/assets/Tesla-Model-Y-1-1160x652.webp";

function formatPrice(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDiscount(ad: Ad) {
  if (!ad.tiers?.length) return "0%";
  const maxDiscount = Math.max(...ad.tiers.map((tier) => Number(tier.discount_pct) || 0));
  return `${maxDiscount}%`;
}

function formatTimeLeft(validTo: string) {
  const end = new Date(validTo);
  const diffMs = end.getTime() - Date.now();

  if (!Number.isFinite(diffMs) || diffMs <= 0) return "ending soon";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  if (totalMinutes < 60) return `${Math.max(1, totalMinutes)} mins`;

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) return `${totalHours} hours`;

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays} days`;
}

function formatImage(images: string[]) {
  if (!images?.length) return FALLBACK_IMAGE;
  const image = images[0];
  if (!image) return FALLBACK_IMAGE;

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }

  return FALLBACK_IMAGE;
}

function mapAdToCard(ad: Ad): DealViewModel {
  return {
    id: ad.id,
    title: ad.product_name || ad.title,
    // image: formatImage(ad.images),
    image: FALLBACK_IMAGE,
    discount: formatDiscount(ad),
    price: formatPrice(Number(ad.original_price) || 0),
    joined: Number(ad.slots_sold) || 0,
    target: Number(ad.total_qty) || 0,
    endsIn: formatTimeLeft(ad.valid_to),
    category: ad.category || "Other",
  };
}

function CustomerDealsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Sparkles size={16} />
            </span>
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Live Offers</span>
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-80 max-w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div>
        <div className="h-6 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="flex items-center gap-3 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-24 bg-slate-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8 bg-[#f5f5f5]">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-40 w-full bg-slate-200" />
            <div className="p-5 space-y-4">
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-200 rounded" />
                <div className="h-2 w-2/3 bg-slate-200 rounded" />
              </div>
              <div className="flex items-end justify-between pt-2">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerDealsClient() {
  const [deals, setDeals] = useState<DealViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDeals() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ads = await getAds();
        const mappedDeals = ads
          .filter((ad) => String(ad.status).toLowerCase() === "active")
          .map(mapAdToCard);

        if (!isCancelled) {
          setDeals(mappedDeals);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Failed to load active deals";
          setErrorMessage(message);
          setDeals([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDeals();

    return () => {
      isCancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => ["All Deals", ...new Set(deals.map((deal) => deal.category))],
    [deals]
  );

  if (isLoading) {
    return <CustomerDealsLoading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Sparkles size={16} />
            </span>
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Live Offers</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Active Pools</h1>
          <p className="text-gray-500 max-w-md">
            Join forces with other buyers. The more people join, the better deals everyone unlocks.
          </p>
        </div>
      </div>

      <div>
        <h1 className="font-bold mb-2 text-xl">Top Categories</h1>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-6 py-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 border ${
                i === 0
                  ? "bg-gray-900 text-white border-gray-900 shadow-md transform scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {!errorMessage && deals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8 bg-[#f5f5f5]">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}

      {!errorMessage && deals.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No active deals right now</h3>
          <p className="mt-2 text-sm text-slate-500">Please check back shortly for new group offers.</p>
        </div>
      )}
    </div>
  );
}
