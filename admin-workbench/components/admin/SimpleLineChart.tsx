import type { AnalyticsPoint } from "@/lib/admin/types";

type SimpleLineChartProps = {
  title: string;
  description: string;
  points: AnalyticsPoint[];
  formatter?: (value: number) => string;
};

export function SimpleLineChart({
  title,
  description,
  points,
  formatter = (value) => value.toLocaleString("en-IN"),
}: SimpleLineChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const width = 100;
  const height = 44;

  const coordinates = points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const normalized = (point.value - min) / Math.max(max - min, 1);
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaCoordinates = `0,${height} ${coordinates} ${width},${height}`;
  const latestPoint = points[points.length - 1];

  return (
    <div className="admin-panel p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="rounded-2xl bg-panel-strong px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Latest</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">{formatter(latestPoint.value)}</p>
        </div>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${width} ${height + 4}`} className="h-56 w-full">
          <defs>
            <linearGradient id="overview-line-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#173b63" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#173b63" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <polyline fill="url(#overview-line-fill)" stroke="none" points={areaCoordinates} />
          <polyline
            fill="none"
            stroke="#173b63"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={coordinates}
          />
          {points.map((point, index) => {
            const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
            const normalized = (point.value - min) / Math.max(max - min, 1);
            const y = height - normalized * height;

            return <circle key={point.label} cx={x} cy={y} r="1.8" fill="#c68424" />;
          })}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted">
        {points.map((point) => (
          <div key={point.label}>{point.label}</div>
        ))}
      </div>
    </div>
  );
}
