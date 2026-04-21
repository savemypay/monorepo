import { PageHeader } from "@/components/admin/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Controls"
        title="Settings"
        description="Configure approval SLAs, finance thresholds, reward defaults, and other business-level controls."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-panel p-5">
          <h2 className="text-lg font-bold text-brand">Approval Thresholds</h2>
          <p className="mt-3 text-sm text-slate-700">Pending review SLA: 12 hours</p>
          <p className="mt-2 text-sm text-slate-700">High-value deal escalation: Rs 5,00,000</p>
        </div>
        <div className="admin-panel p-5">
          <h2 className="text-lg font-bold text-brand">Finance Controls</h2>
          <p className="mt-3 text-sm text-slate-700">Refund review threshold: Rs 10,000</p>
          <p className="mt-2 text-sm text-slate-700">Payout batch frequency: Daily at 6 PM</p>
        </div>
      </div>
    </div>
  );
}
