import { apiRequest } from "@/lib/api/client";

export interface LoginParams {
  email?: string;
  phone_number?: string;
}

export interface VerifyParams {
  email?: string;
  phone_number?: string;
  code: string;
}

export interface VendorProfile {
  id: number;
  email: string | null;
  phone_number: string;
  is_active: boolean;
}

export interface VendorAuthPayload {
  identifier: string;
  access_token: string;
  access_token_expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  role: 'vendor'; 
  user_id: string;   
  vendor_id: string; 
  user: null; 
  vendor: VendorProfile;
}

// Generic Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  error: string | null;
  data: T;
}

// Specific Response Types
// 1. Login/Send OTP usually returns empty data or just success message
export type SendOtpResponse = ApiResponse<unknown>; 

// 2. Verify OTP returns the Auth Payload Array
export type VendorVerifyResponse = ApiResponse<VendorAuthPayload[]>;

export const sendLoginOtp = async (params: LoginParams): Promise<SendOtpResponse> => {
  if (!params.email && !params.phone_number) {
    throw new Error("Email or Phone Number is required");
  }
  return apiRequest<SendOtpResponse>("/api/v1/auth/vendor/login", {
    method: "POST",
    auth: false,
    body: params,
  });
};

export const verifyLoginOtp = async (params: VerifyParams): Promise<VendorVerifyResponse> => {
  if (!params.code) {
    throw new Error("OTP Code is required");
  }
  return apiRequest<VendorVerifyResponse>("/api/v1/auth/vendor/verify", {
    method: "POST",
    auth: false,
    body: params,
  });
};
