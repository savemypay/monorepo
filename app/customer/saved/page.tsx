import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SavedDealsPageClient from "./SavedDealsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Saved Deals | SaveMyPay",
  description:
    "Access your saved group-buy opportunities and quickly join high-value pools before they close.",
  path: "/customer/saved",
});

export default function SavedDealsPage() {
  return <SavedDealsPageClient />;
}
