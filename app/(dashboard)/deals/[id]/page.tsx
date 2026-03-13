import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { deals, formatCurrency } from "@/lib/admin/mock-data";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = deals.find((item) => item.id === id);

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Review"
        title={deal.title}
        description="Inspect pricing, participation, vendor ownership, and approval history before taking an admin action."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={deal.status} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {deal.category}
            </span>
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              Vendor: {deal.vendor}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Interested</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{deal.interested}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Paid Users</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{deal.paid}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Revenue</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(deal.revenue)}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Valid To</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{deal.validTo}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand">Approval notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>Confirm final image set before moving from Pending Review to Approved.</li>
              <li>Verify vendor stock commitment against target quantity.</li>
              <li>Review payout risk because category margin is thinner than average.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-panel p-6">
            <h2 className="text-lg font-bold text-brand">Admin actions</h2>
            <div className="mt-4 grid gap-3">
              <button className="rounded-full bg-brand px-4 py-3 text-sm font-bold text-white">Approve Deal</button>
              <button className="rounded-full bg-accent px-4 py-3 text-sm font-bold text-white">Request Changes</button>
              <button className="rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-800">Pause Deal</button>
              <button className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">Reject Deal</button>
            </div>
          </div>

          <div className="admin-panel p-6">
            <h2 className="text-lg font-bold text-brand">Audit trail</h2>
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-brand pl-4">
                <p className="font-semibold text-slate-900">Operations Admin requested commercial review</p>
                <p className="mt-1 text-sm text-muted">March 10, 2026 · 09:30</p>
              </div>
              <div className="border-l-2 border-accent pl-4">
                <p className="font-semibold text-slate-900">Vendor uploaded revised pricing tiers</p>
                <p className="mt-1 text-sm text-muted">March 09, 2026 · 19:12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
