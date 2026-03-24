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

export interface CreateDealMultipartPayload {
  title: string;
  product_name: string;
  category: string;
  original_price: number;
  total_qty: number;
  tiers: CreateDealTier[];
  images: File[];
  description: string;
  terms: string;
  valid_from: string;
  valid_to: string;
  vendor_id: number;
  token_amount: number;
}

export const getVendorDeals = async (
  vendorId: number,
  status?: string
): Promise<ApiResponse<Deal[]>> => {
  return apiRequest<ApiResponse<Deal[]>>("/api/v1/ads", {
    method: "GET",
    query: { vendor_id: vendorId, status },
  });
};

export const createDealWithImages = async (
  payload: CreateDealMultipartPayload
): Promise<ApiResponse<Deal>> => {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("product_name", payload.product_name);
  formData.append("category", payload.category);
  formData.append("original_price", String(payload.original_price));
  formData.append("total_qty", String(payload.total_qty));
  formData.append("tiers", JSON.stringify(payload.tiers));
  formData.append("description", payload.description);
  formData.append("terms", payload.terms);
  formData.append("valid_from", payload.valid_from);
  formData.append("valid_to", payload.valid_to);
  formData.append("vendor_id", String(payload.vendor_id));
  formData.append("token_amount", String(payload.token_amount));

  payload.images.forEach((image) => {
    formData.append("images", image);
  });

  return apiRequest<ApiResponse<Deal>>("/api/v1/ads/with-images", {
    method: "POST",
    body: formData,
  });
};

export const getDealById = async (adId: string | number): Promise<ApiResponse<Deal[]>> => {
  return apiRequest<ApiResponse<Deal[]>>(`/api/v1/ads/${adId}`, {
    method: "GET",
  });
};
