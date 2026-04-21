import type { TrendRange } from "@/lib/admin/types";

export const overviewTrendRangeOptions: Array<{ label: string; value: TrendRange }> = [
  { label: "Last Week", value: "last_week" },
  { label: "1 Month", value: "one_month" },
  { label: "3 Months", value: "three_months" },
  { label: "Last Year", value: "last_year" },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
