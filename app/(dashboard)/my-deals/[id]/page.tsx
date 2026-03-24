"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Image as ImageIcon,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone,
  Tag,
  User,
  Users,
} from "lucide-react";
import { getLeads, Lead } from "@/lib/api/leads";
import { getDealById } from "@/lib/api/deals";
import { Deal } from "@/lib/dealHelpers";

type TierProgress = NonNullable<Deal["tiers"]>[number] & {
  unlockQty: number;
};

function PoolDetailsContent({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [customerList, setCustomerList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!dealId) return;

    const fetchDealDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await getDealById(dealId);

        if (json.success) {
          const selectedDeal = json.data?.[0] ?? null;
          setDeal(selectedDeal);
          if (!selectedDeal) {
            setError("Deal not found");
          }
        } else {
          setError(json.message || "Error loading deal.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading deal.");
      } finally {
        setLoading(false);
      }
    };

    void fetchDealDetails();
  }, [dealId]);

  useEffect(() => {
    if (!dealId) return;

    const fetchCustomerList = async () => {
      try {
        setCustomersLoading(true);
        const json = await getLeads(dealId);
        if (json.success) {
          setCustomerList(json.data ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCustomersLoading(false);
      }
    };

    void fetchCustomerList();
  }, [dealId]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [deal?.id]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (value: number) =>
    `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0)}`;

  const timeLeft = useMemo(() => {
    if (!deal) return "N/A";
    const end = new Date(deal.valid_to);
    const diffMs = end.getTime() - Date.now();
    if (!Number.isFinite(diffMs) || diffMs <= 0) return "Ending soon";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    if (days > 0) return `${days} Days ${hours} Hours`;
    if (hours > 0) return `${hours} Hours`;
    return `${Math.max(1, totalMinutes)} Mins`;
  }, [deal]);

  const progress = useMemo(() => {
    if (!deal || !deal.total_qty) return 0;
    return Math.min((deal.slots_sold / deal.total_qty) * 100, 100);
  }, [deal]);

  const sortedTiers = useMemo(() => {
    if (!deal?.tiers?.length) return [];
    return [...deal.tiers].sort((left, right) => Number(left.seq) - Number(right.seq));
  }, [deal?.tiers]);

  const cumulativeTiers = useMemo<TierProgress[]>(() => {
    let runningQty = 0;
    return sortedTiers.map((tier) => {
      runningQty += Number(tier.qty) || 0;
      return {
        ...tier,
        unlockQty: runningQty,
      };
    });
  }, [sortedTiers]);

  const activeTier = useMemo(() => {
    if (!deal) return null;
    return cumulativeTiers.reduce<TierProgress | null>((current, tier) => {
      if (deal.slots_sold >= tier.unlockQty) return tier;
      return current;
    }, null);
  }, [cumulativeTiers, deal]);

  const nextTier = useMemo(() => {
    if (!deal) return null;
    return cumulativeTiers.find((tier) => deal.slots_sold < tier.unlockQty) ?? null;
  }, [cumulativeTiers, deal]);

  const maxDiscount = cumulativeTiers[cumulativeTiers.length - 1]?.discount_pct ?? 0;
  const currentUnlockedDiscount = activeTier?.discount_pct ?? 0;
  const tierTrackMax = Math.max(
    cumulativeTiers[cumulativeTiers.length - 1]?.unlockQty ?? 0,
    Number(deal?.total_qty) || 0,
    Number(deal?.slots_sold) || 0,
    1
  );
  const tierOverallProgress = deal ? Math.min((deal.slots_sold / tierTrackMax) * 100, 100) : 0;
  const buyersNeededForNextTier = deal && nextTier ? Math.max(nextTier.unlockQty - deal.slots_sold, 0) : 0;

  const dealImages = deal?.images ?? [];
  const galleryImages = dealImages.length > 0 ? dealImages : [""];
  const hasImages = dealImages.length > 0;
  const currentImage = galleryImages[activeImageIndex] ?? galleryImages[0];
  const revenue = deal ? deal.slots_sold * deal.token_amount : 0;

  const goToPreviousImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const goToNextImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="aspect-[4/3] rounded-3xl bg-slate-200" />
          <div className="space-y-4 rounded-3xl bg-slate-200/70 p-8">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-12 w-3/4 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-56 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/my-deals"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#163B63]"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to My Deals
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
          <h2 className="text-xl font-semibold text-red-700">Unable to load deal</h2>
          <p className="mt-2 text-sm text-red-600">{error || "This deal is unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <Link
        href="/my-deals"
        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#163B63]"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to My Deals
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          {hasImages ? (
            <>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src={currentImage}
                  alt={deal.product_name || deal.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Deal Gallery</p>
                      <p className="mt-1 text-lg font-semibold text-white">{deal.product_name || deal.title}</p>
                    </div>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {activeImageIndex + 1}/{galleryImages.length}
                    </span>
                  </div>
                </div>

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-md transition hover:bg-slate-950/55"
                      aria-label="Show previous deal image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-md transition hover:bg-slate-950/55"
                      aria-label="Show next deal image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((image, index) => {
                    const isSelected = index === activeImageIndex;
                    return (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                          isSelected
                            ? "border-[#163B63] ring-2 ring-[#163B63]/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        aria-label={`Show deal image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${deal.title} preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className={`absolute inset-0 transition ${
                            isSelected ? "bg-[#163B63]/10" : "bg-slate-950/10 hover:bg-transparent"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
              <ImageIcon size={32} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium">No images available</p>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
              {deal.status}
            </span>
            <span className="rounded-full bg-[#F2B705]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#122E4E]">
              {deal.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <ShieldCheck size={14} className="text-[#1CA7A6]" /> Vendor Deal
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-[#122E4E] md:text-4xl">{deal.product_name || deal.title}</h1>

          <div className="mt-6 rounded-2xl border border-[#1CA7A6] bg-[#E7F6F6] px-5 py-5 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F2B705]">Offer Ends In</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xl font-bold text-[#122E4E] sm:justify-start sm:text-2xl">
              <Clock size={20} className="text-[#F2B705]" />
              {timeLeft}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Original price</p>
              <p className="mt-2 text-2xl font-bold text-[#122E4E]">{formatCurrency(deal.original_price)}</p>
            </div>
            <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Token advance</p>
              <p className="mt-2 text-2xl font-bold text-[#122E4E]">{formatCurrency(deal.token_amount)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#1CA7A6]/30 bg-[#1CA7A6]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current unlocked discount</p>
              <div className="mt-2 flex items-center gap-2 text-[#122E4E]">
                <Tag size={18} className="text-[#1CA7A6]" />
                <p className="text-2xl font-bold">{currentUnlockedDiscount}%</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue collected</p>
              <p className="mt-2 text-2xl font-bold text-[#122E4E]">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#1CA7A6]/30 bg-[#1CA7A6]/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Target goal</p>
          <p className="text-2xl font-bold text-[#1CA7A6] md:text-3xl">
            {deal.total_qty} <span className="text-lg font-medium text-slate-400">Units</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#B8C4D3] bg-[#E8F0F8] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current participation</p>
          <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{deal.slots_sold}</p>
        </div>

        <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Top available discount</p>
          <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{maxDiscount}% off</p>
        </div>

        <div className="rounded-2xl border border-[#1CA7A6]/50 bg-[#E7F6F6] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Slots remaining</p>
          <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{Math.max(deal.slots_remaining ?? 0, 0)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Deal description</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{deal.category}</span>
        </div>
        <p className="mt-4 text-base leading-8 text-slate-600">{deal.description || "No description provided."}</p>
        {deal.terms && deal.terms !== "NA" && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            <span className="font-semibold text-[#122E4E]">Terms:</span> {deal.terms}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-[#163B63]/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-[#122E4E]">Discount Journey</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tier quantities are cumulative. Each milestone unlocks a bigger discount as more users join.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Up to {maxDiscount}% off</span>
        </div>

        <div className="p-5 sm:p-6">
          {cumulativeTiers.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              No discount tiers configured for this deal yet.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{deal.slots_sold} users joined</span>
                    <span>{tierTrackMax} users across all tier milestones</span>
                  </div>

                  <div className="relative mt-10">
                    <div className="h-4 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#163B63] via-[#1CA7A6] to-[#F2B705] transition-all duration-700"
                        style={{ width: `${tierOverallProgress}%` }}
                      />
                    </div>

                    {cumulativeTiers.map((tier) => {
                      const markerLeft = Math.min((tier.unlockQty / tierTrackMax) * 100, 100);
                      const unlocked = deal.slots_sold >= tier.unlockQty;

                      return (
                        <div key={tier.id} className="absolute top-0" style={{ left: `calc(${markerLeft}% - 1px)` }}>
                          <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm sm:block">
                            {tier.discount_pct}%
                          </div>
                          <div className={`mt-1 h-4 w-0.5 ${unlocked ? "bg-[#1CA7A6]" : "bg-slate-300"}`} />
                          <span
                            className={`absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white shadow ${
                              unlocked ? "bg-[#1CA7A6]" : "bg-slate-300"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{tierOverallProgress.toFixed(0)}% of the discount journey completed</span>
                    <span className="font-semibold text-[#122E4E]">
                      {activeTier ? `${activeTier.discount_pct}% currently unlocked` : "No discount unlocked yet"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current unlock</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-800">
                      {activeTier ? `${activeTier.discount_pct}% off` : "0% off"}
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      {activeTier
                        ? `${activeTier.label || `Tier ${activeTier.seq}`} is active after ${activeTier.unlockQty} users.`
                        : "Get more users in to unlock the first discount tier."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6b00]">Next milestone</p>
                    <p className="mt-2 text-2xl font-bold text-[#122E4E]">
                      {nextTier ? `${buyersNeededForNextTier} more users` : "All tiers unlocked"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {nextTier
                        ? `Reach ${nextTier.unlockQty} total users to unlock ${nextTier.discount_pct}% on ${nextTier.label || `Tier ${nextTier.seq}`}.`
                        : "The final discount milestone is already active."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign timeline</p>
                    <p className="mt-2 text-lg font-bold text-[#122E4E]">{formatDate(deal.valid_from)} to {formatDate(deal.valid_to)}</p>
                    <p className="mt-1 text-sm text-slate-600">Track the deal window and current participation before it closes.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {cumulativeTiers.map((tier) => {
                  const unlocked = deal.slots_sold >= tier.unlockQty;
                  const isCurrentTier = activeTier?.id === tier.id;
                  const isUpcomingTier = nextTier?.id === tier.id;
                  const usersNeeded = Math.max(tier.unlockQty - deal.slots_sold, 0);

                  return (
                    <div
                      key={tier.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        unlocked
                          ? "border-emerald-200 bg-emerald-50"
                          : isUpcomingTier
                            ? "border-[#F2B705]/40 bg-[#FFF8DD]"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tier.label || `Tier ${tier.seq}`}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-[#122E4E]">{tier.discount_pct}% off</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                            unlocked
                              ? "bg-emerald-100 text-emerald-700"
                              : isUpcomingTier
                                ? "bg-[#F2B705]/15 text-[#8a6b00]"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {unlocked ? (isCurrentTier ? "Current" : "Unlocked") : isUpcomingTier ? "Next" : "Locked"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>
                          Unlocks at <span className="font-semibold text-[#122E4E]">{tier.unlockQty}</span> total users
                        </p>
                        <p>
                          {unlocked
                            ? "This discount is already active in the cumulative journey."
                            : `${usersNeeded} more user${usersNeeded === 1 ? "" : "s"} needed to unlock this tier.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
        <h3 className="mb-6 text-lg font-bold text-[#122E4E]">Pool Progress</h3>

        <div className="relative mb-8">
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
            <span>{deal.slots_sold} Joined</span>
            <span>Goal: {deal.total_qty}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-[#163B63] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-50 pt-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={18} className="text-[#1CA7A6]" />
            Started: <span className="font-medium text-[#122E4E]">{formatDate(deal.valid_from)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <AlertCircle size={18} className="text-[#F2B705]" />
            Ends: <span className="font-medium text-[#122E4E]">{formatDate(deal.valid_to)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-[#163B63]/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-[#122E4E]">Joined Customers</h3>
            <p className="mt-1 text-sm text-slate-500">Paid users associated with this deal.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {customerList.length} customers
            </span>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {customersLoading ? (
          <div className="flex justify-center p-12 text-gray-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : customerList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p>No customers have joined yet.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerList.map((cust) => (
                    <tr key={cust.payment_id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cust.user_name || "Guest User"}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {cust.user_email ? (
                                <>
                                  <Mail size={10} /> {cust.user_email}
                                </>
                              ) : (
                                <>
                                  <Smartphone size={10} /> {cust.user_phone_number}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{cust.order_id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium text-gray-800">₹{cust.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDateTime(cust.created_at)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                            cust.status === "succeeded"
                              ? "border-green-100 bg-green-50 text-green-700"
                              : "border-yellow-100 bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {cust.status === "succeeded" && <CheckCircle size={12} />}
                          {cust.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {customerList.map((cust) => (
                <div key={cust.payment_id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cust.user_name || "Guest User"}</p>
                        <p className="font-mono text-xs text-gray-400">#{cust.order_id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        cust.status === "succeeded"
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-yellow-100 bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {cust.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Amount</span>
                      <span className="font-semibold text-gray-900">₹{cust.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Date</span>
                      <span>{formatDate(cust.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [dealId, setDealId] = useState<string | null>(null);

  useEffect(() => {
    params.then((value) => setDealId(value.id));
  }, [params]);

  if (!dealId) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-gray-400">
        <Loader2 className="mb-4 animate-spin text-blue-600" size={40} />
        <p>Loading details...</p>
      </div>
    );
  }

  return <PoolDetailsContent dealId={dealId} />;
}
