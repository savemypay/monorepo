import { apiRequest } from "@/lib/api/client";

export interface Lead {
  order_id: string;
  payment_id: number;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  amount_major?: number;
  currency: string;
  status: string;
  created_at: string;
  user_email: string | null;
  user_phone_number: string | null;
  user_name: string | null;
  ad?: {
    title?: string;
    id?: number;
  } | null;
}

interface LeadsPage {
  page: number;
  limit: number;
  total_count: number;
  entries: Lead[];
}

interface RawLeadsResponse {
  success: boolean;
  message: string;
  data: LeadsPage[];
  error?: {
    code: string;
    details: string;
  } | null;
}

export interface LeadsResponse {
  success: boolean;
  message: string;
  data: Lead[];
  totalCount: number;
  page: number;
  limit: number;
  error?: {
    code: string;
    details: string;
  } | null;
}

export const getLeads = async (ad_id?: string | number): Promise<LeadsResponse> => {
  const query = ad_id ? { ad_id } : undefined;
  const response = await apiRequest<RawLeadsResponse>("/api/v1/payments/paid-users", {
    method: "GET",
    query,
  });

  const pageData = response.data?.[0];

  return {
    success: response.success,
    message: response.message,
    data: pageData?.entries ?? [],
    totalCount: pageData?.total_count ?? 0,
    page: pageData?.page ?? 1,
    limit: pageData?.limit ?? 10,
    error: response.error ?? null,
  };
};
