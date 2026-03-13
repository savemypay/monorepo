import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency, payments } from "@/lib/admin/mock-data";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = payments.find((item) => item.id === id);

  if (!payment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payment Review"
        title={payment.id}
        description="Inspect transaction health, linked deal, vendor, and customer data before finance action."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="admin-panel p-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={payment.status} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {payment.dealId}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Customer</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{payment.customer}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Vendor</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{payment.vendor}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Amount</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{formatCurrency(payment.amount)}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Created</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{payment.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="text-lg font-bold text-brand">Finance actions</h2>
          <div className="mt-4 grid gap-3">
            <button className="rounded-full bg-brand px-4 py-3 text-sm font-bold text-white">Mark Reviewed</button>
            <button className="rounded-full bg-accent px-4 py-3 text-sm font-bold text-white">Start Refund Review</button>
            <button className="rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-800">Add Internal Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
