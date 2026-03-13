import { PageHeader } from "@/components/admin/PageHeader";

const queues = [
  { label: "Payment Failed", count: 8, owner: "Support Team A" },
  { label: "Refund Request", count: 5, owner: "Finance Review" },
  { label: "Vendor Complaint", count: 3, owner: "Ops Team" },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations Queue"
        title="Support"
        description="This module is scaffolded for case handling, SLA tracking, and cross-entity issue resolution."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {queues.map((queue) => (
          <div key={queue.label} className="admin-panel p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{queue.label}</p>
            <p className="mt-3 text-4xl font-extrabold text-brand">{queue.count}</p>
            <p className="mt-3 text-sm text-slate-700">Owner: {queue.owner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
