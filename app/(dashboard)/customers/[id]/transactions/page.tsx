"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getCustomerTransactions } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import { formatCurrency } from "@/lib/admin/presentation";
import type { CustomerTransactionItem } from "@/lib/admin/types";

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

export default function CustomerTransactionsPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const [transactions, setTransactions] = useState<CustomerTransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedError = hydrated && !accessToken ? "Admin session not found" : error;

  useEffect(() => {
    if (!customerId) {
      return;
    }

    if (!hydrated || !accessToken) {
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
        return getCustomerTransactions(accessToken, customerId);
      })
      .then((data) => {
        if (!data || isCancelled) {
          return;
        }

        setTransactions(data);
      })
      .catch((fetchError: unknown) => {
        if (isCancelled || (fetchError instanceof Error && fetchError.message === "cancelled")) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load customer transactions");
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, customerId, hydrated]);

  if (!customerId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Transactions"
        title={`Customer #${customerId}`}
        description="Review all payments tied to this customer."
        action={
          <Link href="/customers" className="text-sm font-bold text-gray-400 hover:text-slate-700 transition">
            ← Back to customers
          </Link>
        }
      />

      <div className="admin-panel overflow-x-auto p-5">
        {resolvedError ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700">
            {resolvedError}
          </div>
        ) : loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-sm font-medium text-muted">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-line px-6 text-center text-sm font-medium text-muted">
            No transactions found for this customer.
          </div>
        ) : (
          <table className="table-grid">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Deal</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>
                    <p className="font-bold text-slate-900">{payment.order_id || `PY-${payment.payment_id}`}</p>
                    <p className="text-sm text-muted"># {payment.deal_ref}</p>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-900">{payment.ad?.title || "Deal"}</p>
                    <p className="text-sm text-muted">
                      {payment.ad?.product_name || "No product"} · {payment.ad?.status || "Unknown"}
                    </p>
                  </td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDateTime(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
