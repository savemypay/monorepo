import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Login | SaveMyPay",
  description:
    "Sign in to SaveMyPay with OTP to join group deals, track orders, and manage your saved offers.",
  path: "/login",
});

export default function LoginPage() {
  return <LoginPageClient />;
}
