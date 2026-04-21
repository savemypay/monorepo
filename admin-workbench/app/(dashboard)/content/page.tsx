import { PageHeader } from "@/components/admin/PageHeader";

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Merchandising Control"
        title="Content"
        description="Use this area for homepage banners, featured deals, category ordering, and promotional labels once content APIs are wired."
      />

      <div className="admin-panel p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="admin-panel-soft p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Featured Deals</p>
            <p className="mt-3 text-sm text-slate-700">Pin high-conversion or strategic campaigns to customer entry points.</p>
          </div>
          <div className="admin-panel-soft p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Homepage Banners</p>
            <p className="mt-3 text-sm text-slate-700">Control campaign messaging, launch windows, and seasonal merchandising.</p>
          </div>
          <div className="admin-panel-soft p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Category Ordering</p>
            <p className="mt-3 text-sm text-slate-700">Promote categories based on growth strategy, inventory depth, or margin mix.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
