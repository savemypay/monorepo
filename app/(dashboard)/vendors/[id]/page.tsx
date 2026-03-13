import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency, vendors } from "@/lib/admin/mock-data";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = vendors.find((item) => item.id === id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor Profile"
        title={vendor.businessName}
        description="Review business health, compliance posture, commercial output, and support pressure before taking partner actions."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={vendor.status} />
            <span className="rounded-full bg-panel-strong px-4 py-2 text-sm font-semibold text-slate-700">
              {vendor.category}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Owner</p>
              <p className="mt-2 text-xl font-extrabold text-slate-900">{vendor.ownerName}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Revenue</p>
              <p className="mt-2 text-xl font-extrabold text-slate-900">{formatCurrency(vendor.revenue)}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Active Deals</p>
              <p className="mt-2 text-xl font-extrabold text-slate-900">{vendor.activeDeals}</p>
            </div>
            <div className="admin-panel-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Complaints</p>
              <p className="mt-2 text-xl font-extrabold text-slate-900">{vendor.complaints}</p>
            </div>
          </div>
        </div>

        <div className="admin-panel p-6">
          <h2 className="text-lg font-bold text-brand">Recommended actions</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Review KYC completeness before approving new high-value campaigns.</p>
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Check complaint trend against fulfilment promises.</p>
            <p className="rounded-2xl bg-panel-strong px-4 py-3">Assign account manager if campaign volume increases further.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
