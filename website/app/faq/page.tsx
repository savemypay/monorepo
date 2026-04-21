import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import FAQ from "@/components/Home/FAQ";

export const metadata: Metadata = buildMetadata({
  title: "FAQ | SaveMyPay",
  description:
    "Read SaveMyPay frequently asked questions about group buying deals, token payments, vendor participation, and platform workflows.",
  path: "/faq",
  keywords: [
    "SaveMyPay FAQ",
    "group buying FAQ",
    "bulk deal questions",
    "token payment FAQ",
    "vendor platform FAQ",
  ],
});

export default function FaqPage() {
  return <FAQ />;
}
