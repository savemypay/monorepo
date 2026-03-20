"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import DealCard from "@/components/DealCard";
import { getAds, type Ad } from "@/lib/api/ads";
import { useAuthStore } from "@/lib/store/authStore";

type SavedDealViewModel = {
  id: number;
  title: string;
  image: string;
  discount: string;
  price: string;
  joined: number;
  target: number;
  endsIn: string;
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

function formatImage(images: string[] | null | undefined) {
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMAGE;

  const image = images[0]?.trim();
  if (!image) return FALLBACK_IMAGE;

  if (image.startsWith("data:image/")) {
    return FALLBACK_IMAGE;
  }

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }

  return FALLBACK_IMAGE;
}

function mapAdToCard(ad: Ad): SavedDealViewModel {
  return {
    id: ad.id,
    title: ad.product_name || ad.title,
    image: formatImage(ad.images),
    discount: formatDiscount(ad),
    price: formatPrice(Number(ad.original_price) || 0),
    joined: Number(ad.slots_sold) || 0,
    target: Number(ad.total_qty) || 0,
    endsIn: formatTimeLeft(ad.valid_to),
    isFavorite: Boolean(ad.is_favorite),
  };
}

export default function SavedDealsPageClient() {
  const { accessToken } = useAuthStore();
  const [deals, setDeals] = useState<SavedDealViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadSavedDeals() {
      if (!accessToken) {
        if (!isCancelled) {
          setDeals([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ads = await getAds(accessToken);
        const saved = ads
          .filter((ad) => String(ad.status).toLowerCase() === "active" && Boolean(ad.is_favorite))
          .map(mapAdToCard);

        if (!isCancelled) {
          setDeals(saved);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load wishlist deals");
          setDeals([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSavedDeals();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading wishlist deals...</span>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      );
    }

    if (deals.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Heart size={48} className="text-slate-300" />
            <div>
              <p className="font-medium text-slate-900">You have not saved any deals yet.</p>
              <Link href="/customer" className="mt-2 inline-block font-bold text-[#163B63] hover:underline">
                Explore Deals
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {deals.map((deal) => (
          <DealCard key={deal.id} {...deal} />
        ))}
      </div>
    );
  }, [deals, errorMessage, isLoading]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        All deals you marked with the heart icon appear here for quick access.
      </p>
      {content}
    </div>
  );
}
