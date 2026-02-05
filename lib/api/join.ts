
const BASE_API = process.env.NEXT_PUBLIC_API_BASE_URL

export async function submitCustomer(data: {
    name: string;
    email: string;
    phone_number: string;
  }) {
    const res = await fetch(`${BASE_API}/api/v1/interest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      throw new Error("Customer submission failed");
    }
  
    return res.json(); // { success: true, message?: string }
  }
  
  export async function submitVendor(data: {
    name: string;
    email: string;
    phone_number: string;
    category: string;
    comments?: string;
  }) {
    const res = await fetch(`${BASE_API}/api/v1/vendors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      throw new Error("Vendor submission failed");
    }
  
    return res.json();
  }
  