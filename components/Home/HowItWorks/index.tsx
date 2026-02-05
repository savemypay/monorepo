"use client";
import { useState } from "react";
import Tabs from "./Tabs";
import JourneyHero from "./JourneyHero";
import Timeline from "./Timeline";
import { CUSTOMER_STEPS, VENDOR_STEPS } from "./data";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");

  return (
    <section id="how-it-works" className="py-12 md:py-24 bg-[var(--light)]">
      <div className="max-w-[1400px] mx-auto px-8">

        <header className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--primary)]">
            The Power of Group Buying
          </h2>
          <p className="mt-4 text-[var(--gray)] text-lg md:text-2xl">
            Simple, transparent process that benefits everyone
          </p>
        </header>

        <Tabs active={activeTab} onChange={setActiveTab} />

        <div className="mt-16">
          <JourneyHero type={activeTab} />
          <Timeline
            type={activeTab}
            steps={activeTab === "customer" ? CUSTOMER_STEPS : VENDOR_STEPS}
          />
        </div>

      </div>
    </section>
  );
}
