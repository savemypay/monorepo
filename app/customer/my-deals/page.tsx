import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import MyDealsPageClient from "./MyDealsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "My Deals | SaveMyPay",
  description:
    "Review the group deals you joined on SaveMyPay and monitor your purchase progress from one dashboard.",
  path: "/customer/my-deals",
});

export default function MyDealsPage() {
  return <MyDealsPageClient />;
}
