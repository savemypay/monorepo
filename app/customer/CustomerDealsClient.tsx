"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  isFavorite: boolean;
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
    image: formatImage(ad.images),
    discount: formatDiscount(ad),
    price: formatPrice(Number(ad.original_price) || 0),
    joined: Number(ad.slots_sold) || 0,
    target: Number(ad.total_qty) || 0,
    endsIn: formatTimeLeft(ad.valid_to),
    category: ad.category || "Other",
    isFavorite: Boolean(ad.is_favorite),
  };
}

function CustomerDealsLoading() {
  return (
    <div className="space-y-8">
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allDeals, setAllDeals] = useState<DealViewModel[]>([]);
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
          setAllDeals(mappedDeals);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Failed to load active deals";
          setErrorMessage(message);
          setAllDeals([]);
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

  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const selectedCategoryParam = searchParams.get("category") || "All Deals";

  const categories = useMemo(() => ["All Deals", ...new Set(allDeals.map((deal) => deal.category))], [allDeals]);

  const activeCategory = useMemo(() => {
    if (selectedCategoryParam === "All Deals") return "All Deals";
    return categories.includes(selectedCategoryParam) ? selectedCategoryParam : "All Deals";
  }, [selectedCategoryParam, categories]);

  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      const inCategory = activeCategory === "All Deals" || deal.category === activeCategory;
      if (!inCategory) return false;

      if (!query) return true;
      const haystack = `${deal.title} ${deal.category}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [allDeals, activeCategory, query]);

  const updateCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All Deals") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const queryString = params.toString();
    router.replace(queryString ? `/customer?${queryString}` : "/customer");
  };

  if (isLoading) {
    return <CustomerDealsLoading />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-medium mb-2 md:mb-4 text-xl text-[#163B63]">Top Categories</h1>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateCategoryFilter(cat)}
              className={`px-6 py-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-[#163B63] text-white border-gray-900 shadow-md transform"
                  : "bg-white border-gray-200 text-gray-600 hover:border-[#122E4E] hover:bg-gray-50 hover:text-[#163B63]"
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

      {!errorMessage && filteredDeals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-7 bg-[#f5f5f5]">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}

      {!errorMessage && allDeals.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No active deals right now</h3>
          <p className="mt-2 text-sm text-slate-500">Please check back shortly for new group offers.</p>
        </div>
      )}

      {!errorMessage && allDeals.length > 0 && filteredDeals.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No matching deals found</h3>
          <p className="mt-2 text-sm text-slate-500">
            Try another search term or switch to a different category.
          </p>
        </div>
      )}
    </div>
  );
}
