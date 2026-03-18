"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, Loader2, Save } from "lucide-react";
import { FAQ_ITEMS } from "@/components/Home/data";
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
import MyDealsPageClient from "@/app/customer/my-deals/MyDealsPageClient";
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

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

  if (isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-slate-600">Manage your profile details used across orders, referrals, and rewards.</p>

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
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total_cashback: 0,
    total_rewards: 0,
    pending_rewards: 0,
  });

  // useEffect(() => {
  //   let mounted = true;

  //   if (!accessToken) {
  //     return;
  //   }

  //   const load = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const data = await getCustomerEarnings(accessToken);
  //       if (!mounted) return;
  //       setSummary(data);
  //     } catch (err) {
  //       if (!mounted) return;
  //       setError(err instanceof Error ? err.message : "Failed to fetch earnings");
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   };

  //   void load();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [accessToken]);

  if (loading) return <LoadingState label="Loading earnings summary..." />;
  if (error) return <ErrorState label={error} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Total Cashback</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.total_cashback)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Total Rewards</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.total_rewards)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Pending Rewards</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.pending_rewards)}</p>
      </div>
    </div>
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
