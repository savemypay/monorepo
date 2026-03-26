import type { DashboardMetric } from "@/lib/admin/types";

const toneMap = {
  neutral: "text-muted",
  positive: "text-success",
  warning: "text-warning",
};

export function MetricCard({ label, value, change, tone }: DashboardMetric) {
  return (
    <div className="admin-panel p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="kpi-number mt-3 text-brand">{value}</p>
      <p className={`mt-3 text-sm font-medium ${toneMap[tone]}`}>{change}</p>
    </div>
  );
}
