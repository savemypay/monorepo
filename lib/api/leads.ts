
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

// --- Helper ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const handleRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  queryParams?: Record<string, string | number | undefined>
): Promise<T> => {
  try {
    // 1. Get Token from LocalStorage
    let token = "";
    if (typeof window !== "undefined") {
      const storageData = localStorage.getItem("vendor-storage");
      if (storageData) {
        token = JSON.parse(storageData).state?.accessToken || "";
      }
    }

    // 2. Build URL with Query Params
    let url = `${API_BASE_URL}${endpoint}`;
    if (queryParams) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      if (searchParams.toString()) url += `?${searchParams.toString()}`;
    }

    // 3. Fetch
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    // 4. Handle Response
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API Error ${response.status}: Not JSON`);
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");

    return data as T;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Network Error");
  }
};

// --- Exported Functions ---

/**
 * Fetch Leads (optionally filtered by ad_id)
 */
export const getLeads = async (ad_id?: string | number): Promise<LeadsResponse> => {
  // If ad_id is present, pass it as query param
  const params = ad_id ? { ad_id } : undefined;
  return handleRequest<LeadsResponse>("/api/v1/payments/paid-users", "GET", params);
};