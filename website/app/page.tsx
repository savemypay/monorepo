import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Home2 from "@/components/Home";

export const metadata: Metadata = buildMetadata({
  title: "SaveMyPay | India's First Collective Buying Platform for Professionals",
  description:
    "Join curated group deals on SaveMyPay and access exclusive pricing from verified vendors with transparent progress and timelines.",
  path: "/",
});

export default function Home() {
  return (
    <div className="w-full">
      <Home2/>
    </div>
  );
}
