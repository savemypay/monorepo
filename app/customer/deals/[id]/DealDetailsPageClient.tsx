"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  ShieldCheck,
  Tag,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { Ad, AdTier, getAdById, getRenderableAdImages, setAdFavorite } from "@/lib/api/ads";
import { initiateTokenPayment } from "@/lib/api/payments";
import { isApiAuthError } from "@/lib/api/authenticatedRequest";
import { buildIdempotencyKey, openRazorpayCheckout } from "@/lib/payments/razorpay";

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

type CumulativeTier = AdTier & {
  unlockQty: number;
};

const SUCCESS_REDIRECT_SECONDS = 10;
const GALLERY_AUTO_SLIDE_MS = 4000;
const GALLERY_MANUAL_PAUSE_MS = 5000;

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isGalleryManuallyPaused, setIsGalleryManuallyPaused] = useState(false);
  const manualPauseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDeal() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const selected = await getAdById(id, accessToken);

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

    void loadDeal();

    return () => {
      isCancelled = true;
    };
  }, [id, accessToken]);

  const galleryImages = useMemo(() => getRenderableAdImages(deal?.images), [deal?.images]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [deal?.id]);

  useEffect(() => {
    if (selectedImageIndex > galleryImages.length - 1) {
      setSelectedImageIndex(0);
    }
  }, [galleryImages.length, selectedImageIndex]);

  useEffect(() => {
    if (galleryImages.length <= 1 || isGalleryHovered || isGalleryManuallyPaused) return;

    const intervalId = window.setInterval(() => {
      setSelectedImageIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
    }, GALLERY_AUTO_SLIDE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [galleryImages.length, isGalleryHovered, isGalleryManuallyPaused]);

  useEffect(() => {
    return () => {
      if (manualPauseTimeoutRef.current) {
        window.clearTimeout(manualPauseTimeoutRef.current);
      }
    };
  }, []);

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

  const isDealFulfilled = useMemo(() => {
    if (!deal) return false;
    if (typeof deal.slots_remaining === "number") {
      return deal.slots_remaining <= 0;
    }
    return deal.total_qty > 0 && deal.slots_sold >= deal.total_qty;
  }, [deal]);

  const sortedTiers = useMemo(() => {
    if (!deal?.tiers?.length) return [];
    return [...deal.tiers].sort((left, right) => Number(left.seq) - Number(right.seq));
  }, [deal]);

  const cumulativeTiers = useMemo<CumulativeTier[]>(() => {
    let cumulativeQty = 0;
    return sortedTiers.map((tier) => {
      cumulativeQty += Number(tier.qty) || 0;
      return {
        ...tier,
        unlockQty: cumulativeQty,
      };
    });
  }, [sortedTiers]);

  const activeTier = useMemo(() => {
    if (!deal) return null;
    return cumulativeTiers.reduce<CumulativeTier | null>((current, tier) => {
      if (deal.slots_sold >= tier.unlockQty) {
        return tier;
      }
      return current;
    }, null);
  }, [deal, cumulativeTiers]);

  const nextTier = useMemo(() => {
    if (!deal) return null;
    return cumulativeTiers.find((tier) => deal.slots_sold < tier.unlockQty) ?? null;
  }, [deal, cumulativeTiers]);

  const currentUnlockedDiscount = activeTier?.discount_pct ?? 0;
  const maxAvailableDiscount = cumulativeTiers[cumulativeTiers.length - 1]?.discount_pct ?? 0;

  const tierTrackMax = useMemo(() => {
    const tierMaxQty = cumulativeTiers[cumulativeTiers.length - 1]?.unlockQty ?? 0;
    return Math.max(tierMaxQty, Number(deal?.total_qty) || 0, Number(deal?.slots_sold) || 0, 1);
  }, [cumulativeTiers, deal]);

  const tierOverallProgress = useMemo(() => {
    if (!deal) return 0;
    return Math.min((deal.slots_sold / tierTrackMax) * 100, 100);
  }, [deal, tierTrackMax]);

  const buyersNeededForNextTier = useMemo(() => {
    if (!deal || !nextTier) return 0;
    return Math.max(nextTier.unlockQty - deal.slots_sold, 0);
  }, [deal, nextTier]);

  const successRedirectProgress = useMemo(() => {
    if (paymentResultModal?.status !== "success") return 0;
    return ((SUCCESS_REDIRECT_SECONDS - redirectCountdown) / SUCCESS_REDIRECT_SECONDS) * 100;
  }, [paymentResultModal, redirectCountdown]);

  const pauseGalleryAfterManualInteraction = () => {
    setIsGalleryManuallyPaused(true);

    if (manualPauseTimeoutRef.current) {
      window.clearTimeout(manualPauseTimeoutRef.current);
    }

    manualPauseTimeoutRef.current = window.setTimeout(() => {
      setIsGalleryManuallyPaused(false);
      manualPauseTimeoutRef.current = null;
    }, GALLERY_MANUAL_PAUSE_MS);
  };

  const goToPreviousImage = () => {
    pauseGalleryAfterManualInteraction();
    setSelectedImageIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const goToNextImage = () => {
    pauseGalleryAfterManualInteraction();
    setSelectedImageIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

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
        themeColor: "#163B63",
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

  if (isLoading) {
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

  if (errorMessage || !deal) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/customer"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#163B63]"
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
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <Link
          href="/customer"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#163B63]"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to All Deals
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100"
              onMouseEnter={() => setIsGalleryHovered(true)}
              onMouseLeave={() => setIsGalleryHovered(false)}
            >
              <div
                className="flex h-full transition-transform duration-700 ease-out"
                style={{ width: `${galleryImages.length * 100}%`, transform: `translateX(-${selectedImageIndex * (100 / galleryImages.length)}%)` }}
              >
                {galleryImages.map((image, index) => (
                  <div key={`${image}-slide-${index}`} className="relative h-full shrink-0" style={{ width: `${100 / galleryImages.length}%` }}>
                    <Image
                      src={image}
                      alt={`${deal.product_name || deal.title} image ${index + 1}`}
                      fill
                      className="object-fill"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-white/20 bg-white/40 px-3 py-1 text-xs font-semibold text-slate-950/55 backdrop-blur-md">
                    {selectedImageIndex + 1}/{galleryImages.length}
                  </span>
                  {galleryImages.length > 1 && (
                    <div className="flex items-center gap-2">
                      {galleryImages.map((image, index) => {
                        const isSelected = index === selectedImageIndex;

                        return (
                          <button
                            key={`${image}-indicator-${index}`}
                            type="button"
                            onClick={() => {
                              pauseGalleryAfterManualInteraction();
                              setSelectedImageIndex(index);
                            }}
                            className={`h-2.5 w-2.5 rounded-full border border-white/50 transition-all ${
                              isSelected ? "bg-[#F2B705] shadow-[0_0_0_4px_rgba(242,183,5,0.18)]" : "bg-white/50 hover:bg-white/80"
                            }`}
                            aria-label={`Show deal image ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  )}
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

          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-green-700">
                {deal.status}
              </span>
              <span className="rounded-full bg-[#F2B705]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#122E4E]">
                {deal.category}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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

            <h1 className="mt-4 text-2xl font-bold text-[#122E4E] md:text-3xl">{deal.product_name || deal.title}</h1>

            <div className="mt-6 rounded-2xl border border-[#1CA7A6] bg-[#E7F6F6] px-5 py-5 text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-[#F2B705]">Offer Ends In</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-xl font-medium text-[#122E4E] sm:justify-start sm:text-2xl">
                <Clock size={20} className="text-[#F2B705]" />
                {timeLeft}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deal price</p>
                <p className="mt-2 text-2xl font-medium text-[#122E4E]">{formatCurrency(deal.original_price)}</p>
              </div>
              <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Token advance</p>
                <p className="mt-2 text-2xl font-medium text-[#122E4E]">{formatCurrency(deal.token_amount)}</p>
              </div>
            </div>

            <div className="mt-6">
              {isDealFulfilled && (
                <p className="mb-3 text-sm font-medium text-emerald-700">
                  This deal is fulfilled. All available spots have already been taken.
                </p>
              )}
              <button
                onClick={handleAction}
                disabled={isProcessingPayment || isDealFulfilled}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#163B63] px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-[#122E4E] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
                    {paymentReferenceId && <p className="mt-1 text-xs opacity-70">Reference: {paymentReferenceId}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#1CA7A6]/30 bg-[#1CA7A6]/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Target goal</p>
            <p className="text-2xl font-bold text-[#1CA7A6] md:text-3xl">
              {deal.total_qty} <span className="text-lg font-medium text-slate-400">Buyers</span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#B8C4D3] bg-[#E8F0F8] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current participation</p>
            <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{deal.slots_sold}</p>
          </div>

          <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current unlocked discount</p>
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-[#F2B705]" />
              <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{currentUnlockedDiscount}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1CA7A6]/50 bg-[#E7F6F6] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Slots remaining</p>
            <p className="text-2xl font-bold text-[#122E4E] md:text-3xl">{Math.max(deal.slots_remaining ?? 0, 0)}</p>
          </div>
        </div>

        {/* Deal description */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Deal description</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {deal.category}
            </span>
          </div>
          <p className="mt-4 break-words text-base leading-8 text-slate-600">{deal.description}</p>
          {deal.terms && deal.terms !== "NA" && (
            <div className="mt-5 break-words rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <span className="font-semibold text-[#122E4E]">Terms:</span> {deal.terms}
            </div>
          )}
        </div>

        {/* Discount Journey */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-[#163B63]/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-[#122E4E]">Discount Journey</h3>
              <p className="mt-1 text-sm text-slate-500">
                Tier quantities are cumulative by sequence, so each new milestone builds on the previous one.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Up to {maxAvailableDiscount}% off
            </span>
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
                      <span>{deal.slots_sold} buyers joined</span>
                      <span>Final milestone at {tierTrackMax} buyers</span>
                    </div>

                    <div className="relative mt-10 pb-10 sm:pb-12">
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
                          <div
                            key={tier.id}
                            className="absolute top-0"
                            style={{ left: `calc(${markerLeft}% - 1px)` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-1 sm:px-2 py-1 text-[7px] sm:text-[10px] font-bold text-slate-700 shadow-sm">
                              {tier.discount_pct}%
                            </div>
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-500">
                              {tier.unlockQty} <span className="hidden sm:block">buyers</span>
                            </div>
                            <div className={`mt-1 h-4 w-0.5 ${unlocked ? "bg-[#1CA7A6]" : "bg-slate-300"}`} />
                            <span
                              className={`absolute top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white shadow ${
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

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Journey status</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-800">
                        {activeTier ? `${activeTier.label || `Tier ${activeTier.seq}`} active` : "No tier active yet"}
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        {activeTier
                          ? `${activeTier.discount_pct}% unlocked at ${activeTier.unlockQty} buyers.`
                          : "Get more buyers in to unlock the first discount tier."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#F2B705]/30 bg-[#F2B705]/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6b00]">Next milestone</p>
                      <p className="mt-2 text-2xl font-bold text-[#122E4E]">
                        {nextTier ? `${buyersNeededForNextTier} more buyers` : "All tiers unlocked"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {nextTier
                          ? `Reach ${nextTier.unlockQty} total buyers to unlock ${nextTier.discount_pct}% on ${nextTier.label || `Tier ${nextTier.seq}`}.`
                          : "The final discount milestone is already active."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final milestone</p>
                      <p className="mt-2 text-2xl font-bold text-[#122E4E]">{maxAvailableDiscount}% off</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Unlocks at {tierTrackMax} buyers when the full discount journey is completed.
                      </p>
                    </div>
                  </div>
                </div>

                
              </div>
            )}
          </div>
        </div>
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
