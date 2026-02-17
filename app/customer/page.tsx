import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import CustomerDealsClient from "./CustomerDealsClient";

export const metadata: Metadata = buildMetadata({
  title: "Active Deals | SaveMyPay Customer Marketplace",
  description:
    "Browse live group-buying pools on SaveMyPay, track participation, and join verified deals before they close.",
  path: "/customer",
});

export default function CustomerPublicDeals() {
  return (
    <CustomerDealsClient />
  );
}
