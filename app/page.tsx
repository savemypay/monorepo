import Benefits from "@/components/Home/Benfits";
import FooterSection from "@/components/Home/Footer";
import HowItWorks from "@/components/Home/HowItWorks";
import ImpactSection from "@/components/Home/Impact";
import Partner from "@/components/Home/Partner";
import Video from "@/components/Home/Video";
import Web3Gateway from "@/components/Home/Web3Gateway";
import Categories from "@/components/Home/categories";
import Hero from "@/components/Home/hero";
import Navbar from "@/components/Home/navbar";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "SaveMyPay | Power in Numbers, Savings in Bulk",
  description:
    "Join curated group deals on SaveMyPay and access exclusive pricing from verified vendors with transparent progress and timelines.",
  path: "/",
});

export default function Home() {
  return (
    <div className="w-full">
      <Navbar/>
      <Hero/>
      <Video/>
      <Categories/>
      <HowItWorks/>
      <Web3Gateway/>
      <ImpactSection/>
      <Benefits/>
      <Partner/>
      <FooterSection/>
    </div>
  );
}
