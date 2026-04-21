import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Login | SaveMyPay",
  description:
    "Sign in to SaveMyPay with OTP to join group deals, track orders, and manage your saved offers.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-5xl h-[580px] rounded-3xl border border-slate-200 bg-white" />}>
      <LoginPageClient />
    </Suspense>
  );
}
