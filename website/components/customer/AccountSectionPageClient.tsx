"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Copy, Loader2, Save } from "lucide-react";
import { FAQ_ITEMS } from "@/components/Home/data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/authStore";
import {
  getCustomerEarnings,
  getCustomerPayments,
  getMissingCashback,
  getMyReferrals,
  getPaymentHistory,
  getReferProgram,
  type MissingCashbackRecord,
  type PaymentRecord,
  type ReferralProgramData,
  type ReferralUser,
} from "@/lib/api/account";
import { getProfile, updateProfile } from "@/lib/api/profile";
import {
  getBrowserNotificationPermission,
  registerBrowserPushToken,
  type BrowserNotificationPermission,
} from "@/lib/notifications/firebase";
import MyDealsPageClient from "@/app/customer/my-deals/MyDealsPageClient";
import SavedDealsPageClient from "@/app/customer/saved/SavedDealsPageClient";
import type { CustomerAccountSectionSlug } from "@/lib/customer-account";

function formatDate(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number, currency = "INR") {
  const safeValue = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `${currency} ${safeValue}`;
  }
}

function statusTone(status: string | undefined) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("success") || normalized.includes("succeed") || normalized.includes("captured")) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized.includes("fail")) {
    return "bg-red-100 text-red-700";
  }
  if (normalized.includes("pending") || normalized.includes("created")) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-slate-100 text-slate-700";
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="py-16 flex items-center justify-center text-sm text-slate-500 gap-2">
      <Loader2 size={16} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">{label}</p>;
}

function ErrorState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
      <AlertCircle size={16} className="mt-0.5" />
      <span>{label}</span>
    </div>
  );
}

function ProfileSettingsSection() {
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<BrowserNotificationPermission>("unavailable");
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    setNotificationPermission(getBrowserNotificationPermission());
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!accessToken) {
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const profile = await getProfile(accessToken);
        if (!mounted) return;

        setForm({
          name: profile?.name || "",
          email: profile?.email || "",
          phone_number: profile?.phone_number || "",
        });
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Failed to load profile");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateProfile(accessToken, {
        name: form.name.trim() || null,
        email: form.email.trim() || null,
        phone_number: form.phone_number.trim() || null,
      });

      setForm({
        name: updated?.name || "",
        email: updated?.email || "",
        phone_number: updated?.phone_number || "",
      });
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!accessToken) {
      setNotificationError("Please log in again to enable notifications.");
      return;
    }

    setIsNotificationLoading(true);
    setNotificationMessage(null);
    setNotificationError(null);

    try {
      const result = await registerBrowserPushToken(accessToken, { promptForPermission: true });
      setNotificationPermission(getBrowserNotificationPermission());
      setNotificationMessage(
        result.isNewToken
          ? "Browser notifications are now active on this device."
          : "Browser notifications are already active on this device."
      );
    } catch (error) {
      setNotificationPermission(getBrowserNotificationPermission());
      setNotificationError(error instanceof Error ? error.message : "Failed to enable notifications");
    } finally {
      setIsNotificationLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  const notificationStatus = (() => {
    switch (notificationPermission) {
      case "granted":
        return {
          title: "Notifications enabled",
          description: "Deal updates and payment confirmations can be delivered to this browser.",
          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
        };
      case "denied":
        return {
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings to receive deal alerts on this device.",
          tone: "border-amber-200 bg-amber-50 text-amber-800",
        };
      case "default":
        return {
          title: "Notifications not enabled yet",
          description: "Turn on browser notifications for payment updates, saved-deal reminders, and pool milestones.",
          tone: "border-slate-200 bg-slate-50 text-slate-700",
        };
      case "unsupported":
        return {
          title: "Notifications unsupported",
          description: "This browser does not support push notifications.",
          tone: "border-slate-200 bg-slate-50 text-slate-700",
        };
      default:
        return {
          title: "Notifications unavailable",
          description: "Firebase web push is not configured for this environment yet.",
          tone: "border-slate-200 bg-slate-50 text-slate-700",
        };
    }
  })();

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-slate-600">Manage your profile details used across orders, referrals, rewards, and browser notifications.</p>

      {errorMessage ? <ErrorState label={errorMessage} /> : null}
      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-start gap-2">
          <CheckCircle2 size={16} className="mt-0.5" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
            placeholder="Enter your email"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mobile Number</span>
          <input
            value={form.phone_number}
            onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))}
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
            placeholder="Enter mobile number"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-[#1CA7A6] text-[#ffffff] hover:bg-[#168F8E] disabled:opacity-60"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Changes
      </button>

      <div className={`rounded-2xl border p-4 ${notificationStatus.tone}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-white/80 p-2">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{notificationStatus.title}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">{notificationStatus.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={isNotificationLoading || notificationPermission === "unsupported" || notificationPermission === "unavailable"}
            className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-lg bg-[#163B63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#122E4E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isNotificationLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            {notificationPermission === "granted" ? "Reconnect Notifications" : "Enable Browser Notifications"}
          </button>
        </div>

        {notificationMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white/80 p-3 text-sm text-emerald-700 flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5" />
            <span>{notificationMessage}</span>
          </div>
        ) : null}

        {notificationError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-white/80 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{notificationError}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PaymentsTable({
  rows,
  loading,
  error,
  emptyLabel,
}: {
  rows: PaymentRecord[];
  loading: boolean;
  error: string | null;
  emptyLabel: string;
}) {
  if (loading) return <LoadingState label="Loading records..." />;
  if (error) return <ErrorState label={error} />;
  if (!rows.length) return <EmptyState label={emptyLabel} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Order ID</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.payment_id}-${row.order_id}`} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">{row.order_id || "-"}</td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(Number(row.amount) || 0, row.currency || "INR")}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>
                  {row.status || "unknown"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(row.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsSection() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomerPayments(accessToken);
        if (!mounted) return;
        setRows(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch payments");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Track transaction status for your token payments and completed purchases.</p>
      <PaymentsTable rows={rows} loading={loading} error={error} emptyLabel="No payment records available." />
    </div>
  );
}

function PaymentHistorySection() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentHistory(accessToken);
        if (!mounted) return;
        setRows(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch payment history");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Complete history of your payment lifecycle across all deals.</p>
      <PaymentsTable rows={rows} loading={loading} error={error} emptyLabel="No payment history available." />
    </div>
  );
}

function MyEarningsSection() {
  const demoRewards = [
    {
      id: "starter-cashback",
      reward: "Insurence",
      pointsRequired: 300,
      cashValue: 1000,
      expiresOn: "30 Apr 2026",
      status: "Available for redemption",
    },
    // {
    //   id: "smart-shopper",
    //   reward: "Smart Shopper Bonus",
    //   pointsRequired: 500,
    //   cashValue: 300,
    //   expiresOn: "12 May 2026",
    //   status: "Popular reward slab",
    // },
    // {
    //   id: "premium-redeem",
    //   reward: "Premium Redeem Pack",
    //   pointsRequired: 1000,
    //   cashValue: 750,
    //   expiresOn: "25 May 2026",
    //   status: "High-value cash reward",
    // },
  ] as const;

  const availablePoints = 240;
  const [selectedReward, setSelectedReward] = useState<(typeof demoRewards)[number] | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-600">Redeemable balance</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{availablePoints} pts</p>
              
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Reward</th>
                <th className="px-4 py-3 text-left font-semibold">Points Earned</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Expires On</th>
                {/* <th className="px-4 py-3 text-left font-semibold">Status</th> */}
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {demoRewards.map((item) => {
                const pointsShortfall = Math.max(item.pointsRequired - availablePoints, 0);

                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.reward}</p>
                        <p className="mt-1 text-xs text-slate-500">Redeem points for direct cash value in your rewards wallet.</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{item.pointsRequired} pts</td>
                    <td className="px-4 py-4 text-slate-700">{formatCurrency(item.cashValue)}</td>
                    <td className="px-4 py-4 text-slate-600">{item.expiresOn}</td>
                    {/* <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {pointsShortfall > 0 ? `${pointsShortfall}` : item.status}
                      </span>
                    </td> */}
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReward(item)}
                        className="inline-flex items-center justify-center rounded-lg bg-[#163B63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#122E4E]"
                      >
                        Claim
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(selectedReward)} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-200 p-0 overflow-hidden">
          {selectedReward ? (
            <div className="bg-white">
              <div className="bg-slate-900 px-6 py-5 text-white">
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-xl font-bold">Redeem {selectedReward.reward}</DialogTitle>
                  <DialogDescription className="text-sm text-slate-200">
                    Redemption preview for the rewards journey.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Available points</span>
                    <span className="font-semibold text-slate-900">{availablePoints} pts</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                    <span>Points required</span>
                    <span className="font-semibold text-slate-900">{selectedReward.pointsRequired} pts</span>
                  </div>
                  {/* <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                    <span>Cash value</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(selectedReward.cashValue)}</span>
                  </div> */}
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  You need <span className="font-semibold">{Math.max(selectedReward.pointsRequired - availablePoints, 0)} more points</span> to redeem.
                </div>
              </div>

              <DialogFooter className="border-t border-slate-100 px-6 py-4 sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="inline-flex items-center justify-center rounded-lg bg-[#1CA7A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#168F8E]"
                >
                  Keep Earning Points
                </button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReferEarnSection() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReferralProgramData | null>(null);

  // useEffect(() => {
  //   let mounted = true;

  //   if (!accessToken) {
  //     return;
  //   }

  //   const load = async () => {
  //     setLoading(true);
  //     const response = await getReferProgram(accessToken);
  //     if (mounted) {
  //       setData(response);
  //       setLoading(false);
  //     }
  //   };

  //   void load();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [accessToken]);

  const referralCode = String(data?.referral_code || "NA");
  const referralLink = String(data?.referral_link || "");

  return (
    <div className="space-y-4">
      {loading ? <LoadingState label="Loading referral program..." /> : null}

      {!loading && (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referral Code</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{referralCode}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referral Link</p>
            {referralLink ? (
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <input value={referralLink} readOnly className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white" />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Referral link not available yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Total Referrals</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{Number(data?.total_referrals || 0)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Total Rewards</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(Number(data?.total_rewards || 0))}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Pending Rewards</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(Number(data?.pending_rewards || 0))}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MyReferralsSection() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ReferralUser[]>([]);

  // useEffect(() => {
  //   let mounted = true;

  //   if (!accessToken) {
  //     return;
  //   }

  //   const load = async () => {
  //     setLoading(true);
  //     const response = await getMyReferrals(accessToken);
  //     if (mounted) {
  //       setRows(response);
  //       setLoading(false);
  //     }
  //   };

  //   void load();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [accessToken]);

  if (loading) return <LoadingState label="Loading referrals..." />;
  if (!rows.length) return <EmptyState label="No referrals found yet." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Reward</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">{String(row.name || "-")}</td>
              <td className="px-4 py-3 text-slate-700">{String(row.email || "-")}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(String(row.status || ""))}`}>
                  {String(row.status || "unknown")}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(Number(row.reward_amount || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MissingCashbackSection() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MissingCashbackRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      return;
    }

    const load = async () => {
      setLoading(true);
      const response = await getMissingCashback(accessToken);
      if (mounted) {
        setRows(response);
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  if (loading) return <LoadingState label="Loading missing cashback requests..." />;
  if (!rows.length) {
    return (
      <div className="space-y-4">
        <EmptyState label="No missing cashback tickets found." />
        <p className="text-sm text-slate-600">
          If a cashback is missing, contact support with your order reference and payment details.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Ticket</th>
            <th className="px-4 py-3 text-left font-semibold">Order ID</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">#{String(row.id ?? "-")}</td>
              <td className="px-4 py-3 text-slate-700">{String(row.order_id || "-")}</td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(Number(row.amount || 0))}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(String(row.status || ""))}`}>
                  {String(row.status || "unknown")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HelpSection() {
  const topFaqs = useMemo(() => FAQ_ITEMS.slice(0, 5), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Get quick answers for account, payment, and referral related questions.</p>
      <div className="space-y-3">
        {topFaqs.map((item) => (
          <div key={item.question} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">{item.question}</p>
            <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
          </div>
        ))}
      </div>
      <Link href="/faq" className="inline-flex text-sm font-semibold text-blue-600 hover:underline">
        Open full FAQ page
      </Link>
    </div>
  );
}

function ReviewUsSection() {
  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-slate-600">Your feedback helps us improve deal quality, transparency, and overall product experience.</p>
      <a
        href="mailto:support@savemypay.xyz?subject=SaveMyPay%20Feedback"
        className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Write a Review
      </a>
    </div>
  );
}

function PrivacyPolicySection() {
  return (
    <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
      <p>
        SaveMyPay collects the minimum account and transaction information needed to process payments, manage referrals,
        and improve customer support.
      </p>
      <p>
        We never sell your personal data. Data is shared only with payment, compliance, and service partners required for
        platform operations.
      </p>
      <p>
        For policy updates or account-related data requests, contact
        <a href="mailto:privacy@savemypay.xyz" className="text-blue-600 hover:underline ml-1">
          privacy@savemypay.xyz
        </a>
        .
      </p>
    </div>
  );
}

export default function AccountSectionPageClient({ section }: { section: CustomerAccountSectionSlug }) {
  if (section === "my-orders") {
    return <MyDealsPageClient />;
  }

  if (section === "wishlist") {
    return <SavedDealsPageClient />;
  }

  if (section === "profile-settings") {
    return <ProfileSettingsSection />;
  }

  if (section === "payments") {
    return <PaymentsSection />;
  }

  if (section === "payment-history") {
    return <PaymentHistorySection />;
  }

  if (section === "my-earnings") {
    return <MyEarningsSection />;
  }

  if (section === "refer-earn") {
    return <ReferEarnSection />;
  }

  if (section === "my-referrals") {
    return <MyReferralsSection />;
  }

  if (section === "missing-cashback") {
    return <MissingCashbackSection />;
  }

  if (section === "help") {
    return <HelpSection />;
  }

  if (section === "review-us") {
    return <ReviewUsSection />;
  }

  return <PrivacyPolicySection />;
}
