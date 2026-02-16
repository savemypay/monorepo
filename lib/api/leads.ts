
import { apiRequest } from "@/lib/api/client";

export interface Lead {
  order_id:string;
  payment_id: number;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  currency: string;
  status: string; // e.g., "pending", "success"
  created_at: string;
  user_email: string;
  user_phone_number: string;
  user_name: string;
  ad?: {
    title?: string; // Assuming 'ad' might have a title
    id?: number;
  };
}

export interface LeadsResponse {
  success: boolean;
  message: string;
  data: Lead[];
  error?: {
    code: string;
    details: string;
  };
}

// --- Exported Functions ---

/**
 * Fetch Leads (optionally filtered by ad_id)
 */
export const getLeads = async (ad_id?: string | number): Promise<LeadsResponse> => {
  const query = ad_id ? { ad_id } : undefined;
  return apiRequest<LeadsResponse>("/api/v1/payments/paid-users", {
    method: "GET",
    query,
  });
};
