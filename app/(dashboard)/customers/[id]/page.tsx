import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { customers, formatCurrency } from "@/lib/admin/mock-data";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Profile"
        title={customer.name}
        description="Inspect order history, rewards, and trust signals before applying support or risk actions."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="admin-panel p-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={customer.status} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {customer.id}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Orders</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{customer.orders}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Spend</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(customer.spend)}</p>
            </div>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="text-lg font-bold text-brand">Support notes</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Review referral usage if order pattern continues to spike.</p>
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Customer profile should link to payments and support cases once backend APIs are added.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
