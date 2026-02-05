"use client"

import { useState } from "react";
import SavingsCard from "./savingsCard";
import { JoinDialog } from "../ui/join-dialog";

type DialogType = "customer" | "vendor" | null;


export default function Hero() {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[var(--primary)] to-[#1A1F3D] overflow-hidden hero-bg">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 pt-24 md:pt-32 min-h-screen grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight">
            Buy Together. Save Big.
            <span className="block text-[var(--accent)]">
              The Smarter Way to Shop
            </span>
          </h1>

          <p className="mt-6 text-white/80 max-w-lg">
            Join forces with other buyers to unlock massive discounts on everything from insurance to cars. Collective buying power means better deals for everyone.
          </p>

          {/* <div className="mt-10 flex gap-6 flex-wrap">
            <a
              href="#join"
              className="
                w-full sm:w-auto text-center
                relative overflow-hidden
                px-8 py-4 rounded-full
                bg-gradient-to-br from-[var(--accent)] to-[#00FFF0]
                text-[var(--primary)] font-semibold
                shadow-lg shadow-[rgba(0,229,200,0.4)]
                transition-all duration-300 ease-out

                hover:-translate-y-1 hover:scale-105
                hover:shadow-xl hover:shadow-[rgba(0,229,200,0.6)]

                active:scale-95
              "
            >
              Start Saving Now
            </a>
            <a
              href="#vendor"
              className="
                w-full sm:w-auto text-center px-8 py-4 rounded-full
                border-2 border-white text-white font-semibold
                transition-all duration-300 ease-out

                hover:bg-white hover:text-[var(--primary)]
                hover:-translate-y-1 hover:scale-105
                hover:shadow-xl

                active:scale-95
              "
            >
              Partner With Us
            </a>
          </div> */}
          <div className="mt-10 flex gap-6 flex-wrap">
              <button
                onClick={() => setDialogType("customer")}
                className="
                w-full sm:w-auto text-center
                relative overflow-hidden
                px-8 py-4 rounded-full
                bg-gradient-to-br from-[var(--accent)] to-[#00FFF0]
                text-[var(--primary)] font-semibold
                shadow-lg shadow-[rgba(0,229,200,0.4)]
                transition-all duration-300 ease-out

                hover:-translate-y-1 hover:scale-105
                hover:shadow-xl hover:shadow-[rgba(0,229,200,0.6)]

                active:scale-95
              "
              >
                Start Saving Now
              </button>

              <button
                onClick={() => setDialogType("vendor")}
                className="
                w-full sm:w-auto text-center px-8 py-4 rounded-full
                border-2 border-white text-white font-semibold
                transition-all duration-300 ease-out

                hover:bg-white hover:text-[var(--primary)]
                hover:-translate-y-1 hover:scale-105
                hover:shadow-xl

                active:scale-95
              "
              >
                Partner With Us
              </button>
            </div>
        </div>

        {/* RIGHT */}
          <div className="text-white text-center">
            <SavingsCard/>
        </div>
      </div>
      {/* DIALOG */}
      <JoinDialog
        type={dialogType}
        open={!!dialogType}
        onOpenChange={() => setDialogType(null)}
      />
    </section>
  );
}
