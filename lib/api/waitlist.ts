const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_WAITLIST_API_KEY;

export interface WaitlistJoinResponse {
  status: number;
  msg: string;
  content: [];
}

// Join waitlist
export async function joinWaitlist(email: string): Promise<WaitlistJoinResponse> {
  const response = await fetch(`${API_BASE}/depinfi/user/email/waitlist/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY || "",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to join waitlist");
  }

  return await response.json();
}
