import { apiRequest } from "@/lib/api/client";

export interface DashboardSummary {
  active_ads: number;
  total_leads: number;
  total_revenue: number;
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  error: string | null;
  data: DashboardSummary[];
}

export const getDashboardSummary = async (
  vendorId: number
): Promise<DashboardSummaryResponse> => {
  return apiRequest<DashboardSummaryResponse>("/api/v1/payments/dashboard-summary", {
    method: "GET",
    query: { vendor_id: vendorId },
  });
};
