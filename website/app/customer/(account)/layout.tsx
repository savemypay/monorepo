import type { Metadata } from "next";
import AccountPortalLayout from "@/components/customer/AccountPortalLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Customer Account | SaveMyPay",
  description: "Manage your orders, rewards, referrals, and account settings in your SaveMyPay dashboard.",
  path: "/customer/profile-settings",
  robots: {
    index: false,
    follow: false,
  },
});

export default function CustomerAccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountPortalLayout>{children}</AccountPortalLayout>;
}
