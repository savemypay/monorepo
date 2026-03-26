import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "My Deals | SaveMyPay",
  description:
    "Review the group deals you joined on SaveMyPay and monitor your purchase progress from one dashboard.",
  path: "/customer/my-deals",
});

export default function MyDealsPage() {
  redirect("/customer/my-orders");
}
