export interface LoginParams {
    email?: string;
    phone_number?: string;
  }
  
  export interface VerifyParams {
    email?: string;
    phone_number?: string;
    code: string;
  }

  interface AuthData {
    identifier: string;
    access_token: string;
    access_token_expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    token_type: string;
    user: {
      id: number;
      email: string | null;
      phone_number: string;
      is_active: boolean;
    };
  }
  
  // Update the AuthResponse interface
  interface AuthResponse {
    success: boolean;
    message: string;
    data: AuthData[]; // It's an array of AuthData
    error: any;
  }
  
  //Set Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // 3. Helper function to handle fetch requests
  const handleRequest = async (endpoint: string, payload: object) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
  
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network error");
    }
  };
  
  //API FUNCTIONS
  
  export const sendLoginOtp = async (params: LoginParams): Promise<AuthResponse> => {
    // Ensure strict validation before sending
    if (!params.email && !params.phone_number) {
      throw new Error("Email or Phone Number is required");
    }
    return handleRequest("/api/v1/auth/customer/login", params);
  };
  
  export const verifyLoginOtp = async (params: VerifyParams): Promise<AuthResponse> => {
    if (!params.code) {
      throw new Error("OTP Code is required");
    }
    return handleRequest("/api/v1/auth/customer/verify", params);
  };