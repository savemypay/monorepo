"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Clock, Users, Heart, ArrowRight, Flame, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect, useState } from "react";
import { isApiAuthError } from "@/lib/api/authenticatedRequest";
import { setAdFavorite } from "@/lib/api/ads";

interface DealCardProps {
  id: number | string;
  title: string;
  image: string;
  discount: string;
  price: string;
  originalPrice?: string;
  joined: number;
  target: number;
  endsIn: string;
  isFavorite?: boolean;
}

export default function DealCard({
  id,
  title,
  image,
  discount,
  price,
  originalPrice,
  joined,
  target,
  endsIn,
  isFavorite = false,
}: DealCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();
  const [favorited, setFavorited] = useState(isFavorite);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite);
  }, [isFavorite]);

  const progress = Math.min((joined / target) * 100, 100);
  const isFulfilled = target > 0 && joined >= target;
  const isFillingFast = progress >= 70;
  const spotsLeft = Math.max(target - joined, 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !accessToken) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    const nextValue = !favorited;
    setIsUpdatingFavorite(true);

    try {
      const updatedFavorite = await setAdFavorite(id, nextValue, accessToken);
      setFavorited(updatedFavorite);
    } catch (error: unknown) {
      if (isApiAuthError(error)) {
        router.push(`/login?redirect=${pathname}`);
      }
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  return (
    <Link
      href={`/customer/deals/${id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#163B63]/10 transition-all duration-300 overflow-hidden"
    >
      {/* Image*/}
      <div className="relative w-full h-44 overflow-hidden bg-slate-100 flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-fill transition-transform duration-500"
        />

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#122E4E]/60 via-transparent to-transparent pointer-events-none" />

        {/* Top row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-[#F2B705]/90 text-[#122E4E] text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
            {discount} OFF
          </span>

          <button
            onClick={handleFavorite}
            aria-label="Add to favourites"
            disabled={isUpdatingFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-200 ${
              favorited
                ? "bg-red-50 text-red-500"
                : "bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white"
            } ${isUpdatingFavorite ? "cursor-wait opacity-80" : ""}`}
          >
            {isUpdatingFavorite ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Heart size={16} strokeWidth={2} fill={favorited ? "currentColor" : "none"} />
            )}
          </button>
        </div>

        {/* Timer badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#122E4E]/70 backdrop-blur-md text-[#F2B705] text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-[#F2B705]/20">
          <Clock size={12} />
          <span>{endsIn} left</span>
        </div>
      </div>

      {/*  Body  */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#163B63] leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-[#1CA7A6]">
          {title}
        </h3>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Users size={13} className="text-[#F2B705]" />
              <span>
                <span className="text-slate-700">
                  {joined.toLocaleString()}/{target.toLocaleString()}
                </span>{" "}
                joined
              </span>
            </span>

            {isFulfilled ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
                Fulfilled
              </span>
            ) : isFillingFast ? (
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-orange-600 uppercase tracking-wide animate-pulse">
                <Flame size={11} />
                {spotsLeft} spots left
              </span>
            ) : null}
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFulfilled
                  ? "bg-emerald-500"
                  : isFillingFast
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-[#163B63]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-50 mt-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              Group Price
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E2F46] tracking-tight">
                {price}
              </span>
              {originalPrice && (
                <span className="text-sm font-medium text-slate-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 group-hover:text-[#1CA7A6] group-hover:underline text-[#163B63] text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300">
            <span>View Deal</span>
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
