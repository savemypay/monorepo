const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

type JoinResponse = {
  success: boolean;
  message?: string;
};

type CustomerInterestPayload = {
  name: string;
  email: string;
  phone_number: string;
};

type VendorInterestPayload = {
  name: string;
  email: string;
  phone_number: string;
  category: string;
  comments?: string;
};

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

async function postInterest<TPayload>(endpoint: string, payload: TPayload): Promise<JoinResponse> {
  const response = await fetch(`${resolveBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Submission failed";

    throw new Error(message);
  }

  return data as JoinResponse;
}

export function submitCustomer(data: CustomerInterestPayload) {
  return postInterest("/api/v1/customer/interest", data);
}

export function submitVendor(data: VendorInterestPayload) {
  return postInterest("/api/v1/vendors/interest", data);
}
