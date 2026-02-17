const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const TOKEN_PAYMENT_ENDPOINT_TEMPLATE =
  process.env.NEXT_PUBLIC_TOKEN_PAYMENT_ENDPOINT?.trim() || "/api/v1/payments/token-pay/:ad_id";

export interface InitiateTokenPaymentPayload {
  idempotencyKey: string;
}

export interface PaymentInitiationData {
  id: number;
  provider: string;
  provider_payment_id: string;
  status: string;
  amount: number;
  currency: string;
  idempotency_key: string;
  client_secret: string | null;
  error_code: string | null;
  error_message: string | null;
}

interface InitiateTokenPaymentResponse {
  success: boolean;
  message: string;
  data: PaymentInitiationData[];
  error: string | null;
}

function resolveBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

function resolveTokenPaymentEndpoint(adId: number) {
  const normalizedTemplate = TOKEN_PAYMENT_ENDPOINT_TEMPLATE.replace(/\/+$/, "");
  const encodedAdId = encodeURIComponent(String(adId));

  if (normalizedTemplate.includes(":ad_id")) {
    return normalizedTemplate.replace(":ad_id", encodedAdId);
  }

  if (normalizedTemplate.includes("{ad_id}")) {
    return normalizedTemplate.replace("{ad_id}", encodedAdId);
  }

  return `${normalizedTemplate}/${encodedAdId}`;
}

function extractErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

export async function initiateTokenPayment(
  adId: number,
  payload: InitiateTokenPaymentPayload,
  accessToken: string
): Promise<PaymentInitiationData> {
  if (!adId) {
    throw new Error("adId is required");
  }
  if (!payload.idempotencyKey) {
    throw new Error("Idempotency-Key is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const response = await fetch(`${resolveBaseUrl()}${resolveTokenPaymentEndpoint(adId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Idempotency-Key": payload.idempotencyKey,
      "ngrok-skip-browser-warning": "true",
    },
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Failed to initiate payment"));
  }

  const parsed = data as InitiateTokenPaymentResponse;
  if (!parsed?.success) {
    throw new Error(parsed?.error || parsed?.message || "Payment initiation failed");
  }

  const paymentRecord = Array.isArray(parsed.data) ? parsed.data[0] : null;
  if (!paymentRecord) {
    throw new Error("Payment initiation returned empty data");
  }

  return paymentRecord;
}
