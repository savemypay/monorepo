type StatusBadgeProps = {
  status: string;
};

const toneByStatus: Record<string, string> = {
  "pending review": "bg-amber-100 text-amber-800",
  "needs changes": "bg-orange-100 text-orange-800",
  approved: "bg-sky-100 text-sky-800",
  live: "bg-emerald-100 text-emerald-800",
  paused: "bg-slate-200 text-slate-700",
  closed: "bg-zinc-200 text-zinc-800",
  rejected: "bg-rose-100 text-rose-800",
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  filled: "bg-sky-100 text-sky-800",
  expired: "bg-zinc-200 text-zinc-800",
  canceled: "bg-rose-100 text-rose-800",
  "under review": "bg-amber-100 text-amber-800",
  suspended: "bg-rose-100 text-rose-800",
  healthy: "bg-emerald-100 text-emerald-800",
  flagged: "bg-rose-100 text-rose-800",
  succeeded: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  refunded: "bg-sky-100 text-sky-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = toneByStatus[status.toLowerCase()] ?? "bg-slate-100 text-slate-700";

  return <span className={`status-chip ${tone}`}>{status}</span>;
}
