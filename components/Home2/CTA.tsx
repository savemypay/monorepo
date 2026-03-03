"use client";

import { useState } from "react";
import { JoinDialog } from "@/components/ui/join-dialog";

type DialogType = "customer" | "vendor" | null;

export default function CTA() {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  return (
    <section className="relative overflow-hidden text-center px-6 py-12 md:py-20 bg-[#0C111A]">
      {/* Subtle background glow for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-300 h-125 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <h2 className="relative text-white font-bold text-[28px] md:text-[36px] lg:text-[48px] mb-4">
        Ready to{" "}
        <span className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent">
          Start Saving?
        </span>
      </h2>
      <p className="relative text-[#7A8CA3] text-base md:text-lg leading-tight max-w-[440px] mx-auto mb-7">
        Join thousands of smart salaried professionals.
      </p>
      <button
        type="button"
        onClick={() => setDialogType("customer")}
        className="relative inline-flex items-center justify-center gap-2 px-[30px] py-[13px] rounded-[9px] font-bold text-base text-[#0f2347] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
      >
        Start Saving Now
      </button>
      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />
    </section>
  );
}
