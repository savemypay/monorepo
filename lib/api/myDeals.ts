import { authenticatedJsonRequest } from "@/lib/api/authenticatedRequest";

const MY_ORDERS_ENDPOINT = "/api/v1/customer/purchases";

export interface PurchasedDealOrder {
  payment_id: number;
  order_id: string;
  deal_ref: string;
  customer_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  ad: Record<string, unknown> | null;
  user_email: string;
  user_phone_number: string;
  user_name: string;
}

export async function getMyDeals(accessToken: string): Promise<PurchasedDealOrder[]> {
  const data = await authenticatedJsonRequest<PurchasedDealOrder[]>(MY_ORDERS_ENDPOINT, {
    accessToken,
    method: "GET",
    fallbackError: "Failed to fetch purchased deals",
  });

  return Array.isArray(data) ? data : [];
}
