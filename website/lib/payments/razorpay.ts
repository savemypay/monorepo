export type RazorpayCheckoutResult =
  | { status: "success"; paymentId: string }
  | { status: "failed" | "dismissed"; message: string; paymentId?: string };

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      payment_id?: string;
      order_id?: string;
    };
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<void> | null = null;

export function buildIdempotencyKey(adId: number) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${adId}-${crypto.randomUUID()}`;
  }
  return `${adId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Razorpay is only available in browser context");
  }

  if (window.Razorpay) {
    return;
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout script")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export type OpenRazorpayCheckoutParams = {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  name?: string;
  themeColor?: string;
};

export async function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams
): Promise<RazorpayCheckoutResult> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout could not be initialized");
  }

  const RazorpayCheckout = window.Razorpay;

  return new Promise<RazorpayCheckoutResult>((resolve) => {
    let settled = false;

    const settle = (payload: RazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(payload);
    };

    const checkout = new RazorpayCheckout({
      key: params.key,
      amount: params.amount,
      currency: params.currency || "INR",
      name: params.name || "SaveMyPay",
      description: params.description,
      order_id: params.orderId,
      prefill: params.prefill,
      notes: params.notes,
      theme: {
        color: params.themeColor || "#2563eb",
      },
      handler: (response) => {
        settle({
          status: "success",
          paymentId: response.razorpay_payment_id,
        });
      },
      modal: {
        ondismiss: () => {
          settle({
            status: "dismissed",
            message: "Payment cancelled before completion.",
          });
        },
      },
    });

    checkout.on("payment.failed", (response) => {
      const code = response.error?.code ? `[${response.error.code}] ` : "";
      const description = response.error?.description || "Payment failed. Please try again.";
      const reason = response.error?.reason ? ` (${response.error.reason})` : "";
      settle({
        status: "failed",
        message: `${code}${description}${reason}`,
        paymentId: response.error?.metadata?.payment_id,
      });
    });

    checkout.open();
  });
}
