import type { AnalyticsPoint } from "@/lib/admin/types";

type SimpleBarChartProps = {
  title: string;
  description: string;
  points: AnalyticsPoint[];
  suffix?: string;
};

export function SimpleBarChart({ title, description, points, suffix = "" }: SimpleBarChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="admin-panel p-5">
      <h2 className="text-lg font-bold text-brand">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <div className="mt-6 space-y-4">
        {points.map((point) => (
          <div key={point.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{point.label}</span>
              <span className="text-muted">
                {point.value.toLocaleString("en-IN")}
                {suffix}
              </span>
            </div>
            <div className="h-3 rounded-full bg-panel-strong">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#173b63,#c68424)]"
                style={{ width: `${(point.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
