"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getPaidUsers, type PaidUserItem } from "@/lib/admin/api";
import { readStoredAdminSession } from "@/lib/admin/auth";
import { formatCurrency } from "@/lib/admin/mock-data";

function formatDateTime(dateTime: string) {
  const parsed = new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PaymentsPage() {
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined);
  const [payments, setPayments] = useState<PaidUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionReady = accessToken !== undefined;
  const resolvedError = sessionReady && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    void Promise.resolve().then(() => {
      setAccessToken(readStoredAdminSession()?.accessToken ?? null);
    });
  }, []);

  useEffect(() => {
    if (!sessionReady || !accessToken) {
      return;
    }

    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (isCancelled) {
          throw new Error("cancelled");
        }

        setLoading(true);
        setError(null);
        return getPaidUsers(accessToken);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setPayments(data);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load payments");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, sessionReady]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance Operations"
        title="Payments"
        description="Track transaction health, reconciliation risk, refunds, and deal-linked revenue in one finance view."
      />

      <div className="admin-panel overflow-x-auto p-5">
        {resolvedError ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
            {resolvedError}
          </div>
        ) : loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
            No payments found.
          </div>
        ) : (
          <table className="table-grid">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>
                    <p className="font-bold text-slate-900">{payment.order_id || `PY-${payment.payment_id}`}</p>
                    <p className="text-sm text-muted"># {payment.deal_ref}</p>
                  </td>
                  <td>
                    <p className="text-sm text-muted">
                      {payment.user_name || payment.user_email || payment.user_phone_number || "N/A"}
                    </p>
                  </td>
                  <td>NA</td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDateTime(payment.created_at)}</td>
                  <td>
                    {/* <Link href={`/payments/${payment.payment_id}`} className="text-sm font-bold text-brand">
                      Review
                    </Link> */}
                    <button className="text-gray-300">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
