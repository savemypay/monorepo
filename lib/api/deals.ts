import { apiRequest } from "@/lib/api/client";
import type { Deal } from "@/lib/dealHelpers";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  error: string | null;
  data: T;
}

export interface CreateDealTier {
  seq: number;
  qty: number;
  discount_pct: number;
  label: string;
}

export interface CreateDealPayload {
  title: string;
  product_name: string;
  category: string;
  original_price: number;
  total_qty: number;
  tiers: CreateDealTier[];
  images: string[];
  description: string;
  terms: string;
  valid_from: string;
  valid_to: string;
  vendor_id: number;
  token_amount: number;
}

export const getVendorDeals = async (vendorId: number): Promise<ApiResponse<Deal[]>> => {
  return apiRequest<ApiResponse<Deal[]>>("/api/v1/ads", {
    method: "GET",
    query: { vendor_id: vendorId },
  });
};

export const createDeal = async (
  payload: CreateDealPayload
): Promise<ApiResponse<Deal>> => {
  return apiRequest<ApiResponse<Deal>>("/api/v1/ads", {
    method: "POST",
    body: payload,
  });
};
