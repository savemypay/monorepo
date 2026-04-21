import { authenticatedJsonRequest } from "@/lib/api/authenticatedRequest";

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

  const data = await authenticatedJsonRequest<PaymentInitiationData[]>(resolveTokenPaymentEndpoint(adId), {
    accessToken,
    method: "POST",
    headers: {
      "Idempotency-Key": payload.idempotencyKey,
    },
    fallbackError: "Failed to initiate payment",
  });

  const paymentRecord = Array.isArray(data) ? data[0] : null;
  if (!paymentRecord) {
    throw new Error("Payment initiation returned empty data");
  }

  return paymentRecord;
}
