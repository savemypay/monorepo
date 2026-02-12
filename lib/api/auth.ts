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


// --- 2. API CONFIGURATION ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Generic Helper function to handle fetch requests with Type Safety
 * @template T - The expected response type
 */
const handleRequest = async <T>(endpoint: string, payload: object): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Try to parse JSON. If server returns 500 HTML, this might fail, so we catch it.
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      // Use the server's error message if available
      throw new Error(data.message || data.error || "Something went wrong");
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
};


export const sendLoginOtp = async (params: LoginParams): Promise<SendOtpResponse> => {
  if (!params.email && !params.phone_number) {
    throw new Error("Email or Phone Number is required");
  }
  // Passing <SendOtpResponse> ensures the return type matches the interface
  return handleRequest<SendOtpResponse>("/api/v1/auth/vendor/login", params);
};

export const verifyLoginOtp = async (params: VerifyParams): Promise<VendorVerifyResponse> => {
  if (!params.code) {
    throw new Error("OTP Code is required");
  }
  // Passing <VendorVerifyResponse> ensures we get strict typing on the result
  return handleRequest<VendorVerifyResponse>("/api/v1/auth/vendor/verify", params);
};