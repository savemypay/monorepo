import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import CustomerNavbar from "@/components/CustomerNavbar";

export const metadata: Metadata = buildMetadata({
  title: "Login | SaveMyPay",
  description:
    "Sign in to SaveMyPay with secure OTP verification to manage deals, saved pools, and purchases.",
  path: "/login",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(2,132,199,0.08),_transparent_50%)]">
        {children}
      </main>
    </div>
  );
}
