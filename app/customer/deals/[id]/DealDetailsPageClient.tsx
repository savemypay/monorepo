"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  Tag, 
  Calendar, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Heart,
} from "lucide-react";
import { useAuthStore } from '@/lib/store/authStore';
import { Ad, getAdById, setAdFavorite } from '@/lib/api/ads';
import { initiateTokenPayment } from '@/lib/api/payments';
import { isApiAuthError } from '@/lib/api/authenticatedRequest';
import { buildIdempotencyKey, openRazorpayCheckout } from '@/lib/payments/razorpay';

// Brand palette (for reference):
// Primary Blue : #163B63
// Navy Blue    : #122E4E
// Gold         : #F2B705
// Teal         : #1CA7A6

type DealDetailsPageClientProps = {
  id: string;
};

type PaymentNoticeType = "success" | "error" | "info";

type PaymentNotice = {
  type: PaymentNoticeType;
  message: string;
};

type PaymentResultModal =
  | {
      status: "success" | "failure";
      message: string;
      referenceId?: string | null;
    }
  | null;

const SUCCESS_REDIRECT_SECONDS = 10;

export default function DealDetailsPageClient({ id }: DealDetailsPageClientProps) {
  const router = useRouter();

  const { user, accessToken } = useAuthStore();
  const [deal, setDeal] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null);
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(null);
  const [paymentResultModal, setPaymentResultModal] = useState<PaymentResultModal>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(SUCCESS_REDIRECT_SECONDS);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadDeal() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const selected = await getAdById(id);

        if (!isCancelled) {
          if (!selected) {
            setDeal(null);
            setErrorMessage("Deal not found.");
          } else {
            setDeal(selected);
            setIsFavorite(Boolean(selected.is_favorite));
          }
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load deal details.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDeal();
    return () => { isCancelled = true; };
  }, [id]);

  useEffect(() => {
    if (paymentResultModal?.status !== "success") return;

    setRedirectCountdown(SUCCESS_REDIRECT_SECONDS);

    const intervalId = window.setInterval(() => {
      setRedirectCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [paymentResultModal]);

  useEffect(() => {
    if (paymentResultModal?.status !== "success" || redirectCountdown !== 0) return;

    router.push("/customer");
  }, [paymentResultModal, redirectCountdown, router]);

  const formatCurrency = (value: number) =>
    `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0)}`;

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  const maxDiscount = useMemo(() => {
    if (!deal?.tiers?.length) return 0;
    return Math.max(...deal.tiers.map((tier) => Number(tier.discount_pct) || 0));
  }, [deal]);

  const progress = useMemo(() => {
    if (!deal || !deal.total_qty) return 0;
    return Math.min((deal.slots_sold / deal.total_qty) * 100, 100);
  }, [deal]);

  const isDealFulfilled = useMemo(() => {
    if (!deal) return false;
    if (typeof deal.slots_remaining === "number") {
      return deal.slots_remaining <= 0;
    }
    return deal.total_qty > 0 && deal.slots_sold >= deal.total_qty;
  }, [deal]);

  const successRedirectProgress = useMemo(() => {
    if (paymentResultModal?.status !== "success") return 0;
    return ((SUCCESS_REDIRECT_SECONDS - redirectCountdown) / SUCCESS_REDIRECT_SECONDS) * 100;
  }, [paymentResultModal, redirectCountdown]);

  const handleFavorite = async () => {
    if (!user || !accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(`/customer/deals/${id}`)}`);
      return;
    }
    if (!deal) return;

    const nextValue = !isFavorite;
    setIsUpdatingFavorite(true);

    try {
      const updatedFavorite = await setAdFavorite(deal.id, nextValue, accessToken);
      setIsFavorite(updatedFavorite);
      setDeal((current) => (current ? { ...current, is_favorite: updatedFavorite } : current));
    } catch (error: unknown) {
      if (isApiAuthError(error)) {
        router.push(`/login?redirect=${encodeURIComponent(`/customer/deals/${id}`)}`);
      }
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleAction = async () => {
    if (!user || !accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(`/customer/deals/${id}`)}`);
      return;
    }
    if (!deal) return;

    setIsProcessingPayment(true);
    setPaymentReferenceId(null);
    setPaymentResultModal(null);
    setPaymentNotice({ type: "info", message: "Initializing secure checkout..." });

    try {
      const idempotencyKey = buildIdempotencyKey(deal.id);
      const initiatedPayment = await initiateTokenPayment(deal.id, { idempotencyKey }, accessToken);

      if (!initiatedPayment.provider_payment_id) {
        throw new Error("Missing provider payment id in payment initiation response");
      }

      const providerName = initiatedPayment.provider?.toLowerCase();

      if (providerName !== "razorpay") {
        if (initiatedPayment.status?.toLowerCase() === "succeeded") {
          setPaymentReferenceId(initiatedPayment.provider_payment_id);
          setPaymentNotice({ type: "success", message: "Token payment completed successfully." });
          return;
        }
        throw new Error(
          initiatedPayment.error_message ||
            `Payment provider '${initiatedPayment.provider}' is not supported for web checkout`
        );
      }

      if (!initiatedPayment.provider_payment_id.startsWith("order_")) {
        throw new Error(`Invalid Razorpay order id from API: ${initiatedPayment.provider_payment_id}`);
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
      if (!razorpayKey) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");

      const checkoutResult = await openRazorpayCheckout({
        key: razorpayKey,
        amount: initiatedPayment.amount,
        currency: initiatedPayment.currency || "INR",
        name: "SaveMyPay",
        description: `Token advance for ${deal.product_name || deal.title}`,
        orderId: initiatedPayment.provider_payment_id,
        prefill: {
          name: user.name || undefined,
          email: user.email || undefined,
          contact: user.phone_number || undefined,
        },
        notes: {
          ad_id: String(deal.id),
          "Idempotency-Key": idempotencyKey,
        },
        themeColor: "#163B63", // ← updated to brand Primary Blue
      });

      if (checkoutResult.status === "success") {
        setPaymentReferenceId(checkoutResult.paymentId);
        setPaymentNotice(null);
        setPaymentResultModal({
          status: "success",
          message: "Your token advance is confirmed.",
          referenceId: checkoutResult.paymentId,
        });
        return;
      }
      if (checkoutResult.status === "dismissed") {
        setPaymentNotice({ type: "info", message: checkoutResult.message });
        return;
      }

      setPaymentReferenceId(checkoutResult.paymentId || initiatedPayment.provider_payment_id);
      setPaymentNotice(null);
      setPaymentResultModal({
        status: "failure",
        message: checkoutResult.message || "Payment failed",
        referenceId: checkoutResult.paymentId || initiatedPayment.provider_payment_id,
      });
    } catch (error: unknown) {
      if (isApiAuthError(error)) {
        router.push(`/login?redirect=${encodeURIComponent(`/customer/deals/${id}`)}`);
        return;
      }

      setPaymentNotice(null);
      setPaymentResultModal({
        status: "failure",
        message: error instanceof Error ? error.message : "Unable to process payment. Please try again.",
        referenceId: paymentReferenceId,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGoToDeals = () => {
    setPaymentResultModal(null);
    router.push("/customer");
  };

  const handleRetryPayment = () => {
    setPaymentResultModal(null);
    setPaymentNotice(null);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-56 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (errorMessage || !deal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/customer"
          className="inline-flex items-center text-slate-500 hover:text-[#163B63] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to All Deals
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
          <h2 className="text-xl font-semibold text-red-700">Unable to load deal</h2>
          <p className="mt-2 text-sm text-red-600">{errorMessage || "This deal is unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">

      {/* Back Navigation */}
      <Link
        href="/customer"
        className="inline-flex items-center text-slate-500 hover:text-[#163B63] transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to All Deals
      </Link>

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">

          {/* Left: title + meta */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status badge — green kept for semantic "active" meaning */}
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {deal.status}
              </span>
              {/* Category — brand gold accent */}
              <span className="bg-[#F2B705]/15 text-[#122E4E] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {deal.category}
              </span>
              {/* Verified — brand teal */}
              <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                <ShieldCheck size={14} className="text-[#1CA7A6]" /> Verified Vendor
              </span>
              {isDealFulfilled && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  All spots filled
                </span>
              )}
              <button
                type="button"
                onClick={handleFavorite}
                disabled={isUpdatingFavorite}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600"
                } ${isUpdatingFavorite ? "cursor-wait opacity-80" : ""}`}
              >
                {isUpdatingFavorite ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                )}
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#122E4E]">
              {deal.product_name || deal.title}
            </h1>
            <p className="text-slate-500 leading-relaxed text-base sm:text-lg max-w-3xl">
              {deal.description}
            </p>
          </div>

          {/* Right: countdown — brand navy bg */}
          <div className="bg-[#E7F6F6] px-5 sm:px-8 py-5 sm:py-6 rounded-2xl text-center w-full sm:w-auto sm:min-w-[220px] border border-[#1CA7A6]">
            <p className="text-[#F2B705] text-xs font-bold uppercase mb-2 tracking-wider">Offer Ends In</p>
            <div className="flex items-center justify-center gap-2 text-[#122E4E] font-bold text-xl sm:text-2xl">
              <Clock size={20} className="text-[#F2B705]" />
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 pt-8 border-t border-slate-100">

          {/* Target Goal */}
          <div className="rounded-xl border border-[#1CA7A6]/30 bg-[#1CA7A6]/5 p-4">
            <p className="text-slate-500 text-xs font-semibold uppercase mb-2 tracking-wide">Target Goal</p>
            <p className="text-2xl md:text-3xl font-bold text-[#1CA7A6]">
              {deal.total_qty}{" "}
              <span className="text-lg text-slate-400 font-medium">Buyers</span>
            </p>
          </div>

          {/* Deal Price */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-slate-500 text-xs font-semibold uppercase mb-2 tracking-wide">Deal Price</p>
            <p className="text-2xl md:text-3xl font-bold text-[#122E4E]">
              {formatCurrency(deal.original_price)}
            </p>
          </div>

          {/* Discount — gold accent */}
          <div className="rounded-xl border border-[#F2B705]/30 bg-[#F2B705]/5 p-4">
            <p className="text-slate-500 text-xs font-semibold uppercase mb-2 tracking-wide">Your Discount</p>
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-[#F2B705]" />
              <p className="text-2xl md:text-3xl font-bold text-[#122E4E]">{maxDiscount}%</p>
            </div>
          </div>

          {/* Token Advance — teal accent */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex flex-col justify-end">
            <p className="text-slate-500 text-xs font-semibold uppercase mb-2 tracking-wide">Token Advance</p>
            <p className="text-2xl md:text-3xl font-bold text-[#122E4E]">
              {formatCurrency(deal.token_amount)}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-5">
          {isDealFulfilled && (
            <p className="mb-3 text-sm font-medium text-emerald-700">
              This deal is fulfilled. All available spots have already been taken.
            </p>
          )}
          <button
            onClick={handleAction}
            disabled={isProcessingPayment || isDealFulfilled}
            className="w-full sm:w-auto sm:min-w-[260px] sm:ml-auto bg-[#163B63] hover:bg-[#122E4E] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : isDealFulfilled ? (
              "All Spots Filled"
            ) : user ? (
              "Pay Token Now"
            ) : (
              "Login to Pay"
            )}
          </button>
        </div>

        {/* Payment Notice */}
        {paymentNotice && (
          <div
            className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
              paymentNotice.type === "success"
                ? "border-[#1CA7A6]/30 bg-[#1CA7A6]/5 text-[#0e6b6a]"
                : paymentNotice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#163B63]/20 bg-[#163B63]/5 text-[#163B63]"
            }`}
          >
            <div className="flex items-start gap-2">
              {paymentNotice.type === "success" ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#1CA7A6]" />
              ) : paymentNotice.type === "error" ? (
                <XCircle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#163B63]" />
              )}
              <div>
                <p>{paymentNotice.message}</p>
                {paymentReferenceId && (
                  <p className="mt-1 text-xs opacity-70">Reference: {paymentReferenceId}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Pool Progress Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8">
        <h3 className="font-bold text-lg text-[#122E4E] mb-6">Pool Progress</h3>

        <div className="relative mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>{deal.slots_sold} Joined</span>
            <span>Goal: {deal.total_qty}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-1000 ease-out bg-[#163B63]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm border-t border-slate-50 pt-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={18} className="text-[#1CA7A6]" />
            Started:{" "}
            <span className="font-medium text-[#122E4E]">{formatDate(deal.valid_from)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <AlertCircle size={18} className="text-[#F2B705]" />
            Ends:{" "}
            <span className="font-medium text-[#122E4E]">{formatDate(deal.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* ── Discount Tiers Card ── */}
      {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-[#163B63]/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="font-bold text-lg text-[#122E4E]">
            Discount Tiers ({deal.tiers.length})
          </h3>
          <span className="text-xs text-slate-500">
            Progressive discounts unlock as more buyers join
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {sortedTiers.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              No discount tiers configured for this deal yet.
            </div>
          ) : (
            <div className="space-y-4">

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{deal.slots_sold} joined</span>
                  <span>{tierGoalQty} for max discount</span>
                </div>

                <div className="relative mt-2 h-4 rounded-full bg-white border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#163B63] transition-all duration-700"
                    style={{ width: `${tierOverallProgress}%` }}
                  />

                  {sortedTiers.map((tier) => {
                    const markerLeft =
                      tierGoalQty > 0 ? Math.min((tier.qty / tierGoalQty) * 100, 100) : 0;
                    return (
                      <div
                        key={tier.id}
                        className="absolute inset-y-0"
                        style={{ left: `calc(${markerLeft}% - 1px)` }}
                      >
                        <div className="h-full w-px bg-white/70" />
                        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white/95 border border-[#163B63]/20">
                          {tier.discount_pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{tierOverallProgress.toFixed(0)}% complete</span>
                  <span className={activeTier ? "text-[#1CA7A6] font-semibold" : "text-slate-600"}>
                    {activeTier ? `${activeTier.discount_pct}% unlocked` : "No tier unlocked yet"}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {sortedTiers.map((tier) => {
                  const isUnlocked = deal.slots_sold >= tier.qty;
                  const buyersNeeded = Math.max(tier.qty - deal.slots_sold, 0);

                  return (
                    <div
                      key={tier.id}
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        isUnlocked
                          ? "border-[#1CA7A6]/30 bg-[#1CA7A6]/5 text-[#0e6b6a]"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{tier.label || `Tier ${tier.seq}`}</span>
                        <span className={`font-bold ${isUnlocked ? "text-[#1CA7A6]" : "text-[#163B63]"}`}>
                          {tier.discount_pct}% OFF
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80">
                        {isUnlocked ? "✓ Unlocked" : `${buyersNeeded} buyers left`} • Unlock at {tier.qty}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div> */}

      </div>

      {paymentResultModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="px-6 pb-6 pt-8 sm:px-8">
              <div className="mx-auto flex w-full max-w-xs flex-col items-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <span
                    className={`absolute inset-0 rounded-full ${
                      paymentResultModal.status === "success" ? "bg-emerald-100" : "bg-red-100"
                    } animate-ping [animation-duration:1.8s]`}
                  />
                  <span
                    className={`absolute inset-[10px] rounded-full ${
                      paymentResultModal.status === "success" ? "bg-emerald-200" : "bg-red-200"
                    } animate-pulse`}
                  />
                  <div
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg ${
                      paymentResultModal.status === "success"
                        ? "bg-emerald-500 shadow-emerald-500/30"
                        : "bg-red-500 shadow-red-500/30"
                    }`}
                  >
                    {paymentResultModal.status === "success" ? (
                      <CheckCircle2 className="h-12 w-12 animate-[bounce_1.2s_ease-in-out_1] text-white" />
                    ) : (
                      <XCircle className="h-12 w-12 animate-[bounce_1.2s_ease-in-out_1] text-white" />
                    )}
                  </div>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-[#122E4E]">
                  {paymentResultModal.status === "success" ? "Payment successful" : "Payment failed"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{paymentResultModal.message}</p>

                {paymentResultModal.referenceId && (
                  <p className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    Reference: {paymentResultModal.referenceId}
                  </p>
                )}

                {paymentResultModal.status === "success" ? (
                  <div className="mt-6 w-full space-y-3">
                    <div className="overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-[#1CA7A6] transition-[width] duration-1000 ease-linear"
                        style={{ width: `${successRedirectProgress}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      Redirecting to deals page in {redirectCountdown} seconds
                    </p>
                    <button
                      type="button"
                      onClick={handleGoToDeals}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#163B63] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#122E4E]"
                    >
                      Home
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleGoToDeals}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      className="inline-flex items-center justify-center rounded-xl bg-[#163B63] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#122E4E]"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
