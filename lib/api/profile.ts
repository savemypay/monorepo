import { apiRequest } from "@/lib/api/client";

export interface VendorProfileDetails {
  id: number;
  email: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  category: string | null;
  name: string | null;
}

export interface VendorProfileResponse {
  success: boolean;
  message: string;
  error: string | null;
  data: VendorProfileDetails[];
}

export const getVendorProfile = async (): Promise<VendorProfileResponse> => {
  return apiRequest<VendorProfileResponse>("/api/v1/profile", {
    method: "GET",
  });
};

export interface UpdateVendorProfilePayload {
  email: string;
  phone_number: string;
  name: string;
}

export interface UpdateVendorProfileResponse {
  success: boolean;
  message: string;
  error: string | null;
  data: VendorProfileDetails[];
}

export const updateVendorProfile = async (
  payload: UpdateVendorProfilePayload
): Promise<UpdateVendorProfileResponse> => {
  return apiRequest<UpdateVendorProfileResponse>("/api/v1/auth/vendor/profile", {
    method: "PATCH",
    body: payload,
  });
};
