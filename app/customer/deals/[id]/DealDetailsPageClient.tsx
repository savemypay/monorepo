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
  XCircle
} from "lucide-react";
import { useAuthStore } from '@/lib/store/authStore';
import { Ad, getAds } from '@/lib/api/ads';
import { initiateTokenPayment } from '@/lib/api/payments';
import { buildIdempotencyKey, openRazorpayCheckout } from '@/lib/payments/razorpay';

type DealDetailsPageClientProps = {
  id: string;
};

type PaymentNoticeType = "success" | "error" | "info";

type PaymentNotice = {
  type: PaymentNoticeType;
  message: string;
};

export default function DealDetailsPageClient({ id }: DealDetailsPageClientProps) {
  const router = useRouter();

  const { user, accessToken } = useAuthStore();
  const [deal, setDeal] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null);
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDeal() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ads = await getAds();
        const selected = ads.find((ad) => String(ad.id) === id);

        if (!isCancelled) {
          if (!selected) {
            setDeal(null);
            setErrorMessage("Deal not found.");
          } else {
            setDeal(selected);
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

    return () => {
      isCancelled = true;
    };
  }, [id]);

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

  const sortedTiers = useMemo(
    () => [...(deal?.tiers ?? [])].sort((a, b) => a.seq - b.seq),
    [deal]
  );

  const tierGoalQty = useMemo(() => {
    if (!sortedTiers.length) return 0;
    return Math.max(...sortedTiers.map((tier) => Number(tier.qty) || 0));
  }, [sortedTiers]);

  const tierOverallProgress = useMemo(() => {
    if (!deal || tierGoalQty <= 0) return 0;
    return Math.min((deal.slots_sold / tierGoalQty) * 100, 100);
  }, [deal, tierGoalQty]);

  const activeTier = useMemo(() => {
    if (!deal || !sortedTiers.length) return null;
    return sortedTiers.reduce<(typeof sortedTiers)[number] | null>(
      (current, tier) => (deal.slots_sold >= tier.qty ? tier : current),
      null
    );
  }, [deal, sortedTiers]);

  const handleAction = async () => {
    if (!user || !accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(`/customer/deals/${id}`)}`);
      return;
    }
    if (!deal) {
      return;
    }

    setIsProcessingPayment(true);
    setPaymentReferenceId(null);
    setPaymentNotice({
      type: "info",
      message: "Initializing secure checkout...",
    });

    try {
      const idempotencyKey = buildIdempotencyKey(deal.id);
      const initiatedPayment = await initiateTokenPayment(
        deal.id,
        {
          idempotencyKey,
        },
        accessToken
      );

      if (!initiatedPayment.provider_payment_id) {
        throw new Error("Missing provider payment id in payment initiation response");
      }

      const providerName = initiatedPayment.provider?.toLowerCase();

      if (providerName !== "razorpay") {
        if (initiatedPayment.status?.toLowerCase() === "succeeded") {
          setPaymentReferenceId(initiatedPayment.provider_payment_id);
          setPaymentNotice({
            type: "success",
            message: "Token payment completed successfully.",
          });
          return;
        }
        throw new Error(
          initiatedPayment.error_message ||
            `Payment provider '${initiatedPayment.provider}' is not supported for web checkout`
        );
      }

      if (!initiatedPayment.provider_payment_id.startsWith("order_")) {
        throw new Error(
          `Invalid Razorpay order id from API: ${initiatedPayment.provider_payment_id}`
        );
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
      if (!razorpayKey) {
        throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");
      }

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
        themeColor: "#2563eb",
      });

      if (checkoutResult.status === "success") {
        setPaymentReferenceId(checkoutResult.paymentId);
        setPaymentNotice({
          type: "success",
          message: "Payment successful. Your token advance is confirmed.",
        });
        return;
      }

      if (checkoutResult.status === "dismissed") {
        setPaymentNotice({
          type: "info",
          message: checkoutResult.message,
        });
        return;
      }

      setPaymentReferenceId(checkoutResult.paymentId || initiatedPayment.provider_payment_id);
      setPaymentNotice({
        type: "error",
        message: checkoutResult.message,
      });
    } catch (error: unknown) {
      setPaymentNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to process payment. Please try again.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-56 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (errorMessage || !deal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/customer"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      
      {/* Back Navigation */}
      <Link 
        href="/customer" 
        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to All Deals
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {deal.status}
              </span>
              <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {deal.category}
              </span>
              <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                <ShieldCheck size={14} className="text-blue-500" /> Verified Vendor
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{deal.product_name || deal.title}</h1>
            <p className="text-gray-500 leading-relaxed text-base sm:text-lg max-w-3xl">{deal.description}</p>
          </div>
          
          <div className="bg-blue-50 px-5 sm:px-8 py-5 sm:py-6 rounded-2xl text-center w-full sm:w-auto sm:min-w-[220px] border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-2">Offer Ends In</p>
            <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xl sm:text-2xl">
              <Clock size={20} />
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 pt-8 border-t border-gray-100">
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Target Goal</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{deal.total_qty} <span className="text-lg text-gray-400 font-medium">Buyers</span></p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Your Discount</p>
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-green-600" />
              <p className="text-2xl md:text-3xl font-bold text-green-600">{maxDiscount}%</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Deal Price</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{formatCurrency(deal.original_price)}</p>
          </div>
          
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex flex-col justify-end">
             <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Token Advance</p>
             <p className="text-2xl md:text-3xl font-bold text-blue-600">{formatCurrency(deal.token_amount)}</p>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={handleAction}
            disabled={isProcessingPayment}
            className="w-full sm:w-auto sm:min-w-[260px] sm:ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : user ? (
              'Pay Token Now'
            ) : (
              'Login to Join'
            )}
          </button>
        </div>

        {paymentNotice && (
          <div
            className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
              paymentNotice.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : paymentNotice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            <div className="flex items-start gap-2">
              {paymentNotice.type === "success" ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : paymentNotice.type === "error" ? (
                <XCircle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <div>
                <p>{paymentNotice.message}</p>
                {paymentReferenceId && (
                  <p className="mt-1 text-xs opacity-80">Reference: {paymentReferenceId}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Pool Progress</h3>
        
        <div className="relative mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>{deal.slots_sold} Joined</span>
            <span>Goal: {deal.total_qty}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm border-t border-gray-50 pt-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} className="text-gray-400" />
            Started: <span className="font-medium text-gray-900">{formatDate(deal.valid_from)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle size={18} className="text-gray-400" />
            Ends: <span className="font-medium text-gray-900">{formatDate(deal.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* Discount Tiers */}
      {/* <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="font-bold text-lg text-gray-800">Discount Tiers ({deal.tiers.length})</h3>
          <span className="text-xs text-gray-500">Progressive discounts unlock as more buyers join</span>
        </div>

        <div className="p-5 sm:p-6">
          {sortedTiers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
              No discount tiers configured for this deal yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                  <span>{deal.slots_sold} joined</span>
                  <span>{tierGoalQty} for max discount</span>
                </div>

                <div className="relative mt-2 h-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-700"
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
                        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                          {tier.discount_pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-600">{tierOverallProgress.toFixed(0)}% complete</span>
                  <span className={activeTier ? "text-green-700 font-semibold" : "text-gray-600"}>
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
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        isUnlocked
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{tier.label || `Tier ${tier.seq}`}</span>
                        <span>{tier.discount_pct}% OFF</span>
                      </div>
                      <p className="mt-1 text-[11px]">
                        {isUnlocked ? "Unlocked" : `${buyersNeeded} buyers left`} • Unlock at {tier.qty}
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
  );
}
