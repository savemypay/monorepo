"use client"

import { useState } from "react";
import { JoinDialog } from "../ui/join-dialog";

const benefits = [
    {
      icon: "🚀",
      title: "Move Stock Faster",
      desc: "Clear inventory quickly with guaranteed bulk orders.",
    },
    {
      icon: "📈",
      title: "Predictable Revenue",
      desc: "Large-volume purchases reduce uncertainty and risk.",
    },
    {
      icon: "💡",
      title: "Lower Marketing Costs",
      desc: "We bring motivated buyers directly to you.",
    },
  ]

type DialogType = "customer" | "vendor" | null;
  
export default function Partner() {
  const [dialogType, setDialogType] = useState<DialogType>(null);

    return (
      <section
        id="partner"
        className="
          relative py-12 md:py-24
          bg-gradient-to-br from-[var(--secondary)] to-[#FF8A5B]
          text-white overflow-hidden
        "
      >
        {/* animated wave background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="
              absolute bottom-0 left-0 right-0 h-28
              bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 120%22%3E%3Cpath d=%22M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.83c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35A600.21 600.21 0 00321.39 56.44z%22 fill=%22%23ffffff%22 opacity=%220.15%22/%3E%3C/svg%3E')]
              bg-repeat-x animate-wave
            "
          />
        </div>
  
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  
          {/* header */}
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Become a Vendor Partner
          </h2>
  
          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
            Move inventory faster, reduce marketing costs, and connect with
            pre-qualified buyers ready to purchase in bulk.
          </p>
  
          {/* benefits */}
          <div
            className=" grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left mb-14">
            {benefits.map((b, i) => (
              <div
              key={i}
              className="
                relative overflow-hidden group p-6 rounded-xl bg-white/15 backdrop-blur border border-white/20
                transition-all duration-500 ease-out
                hover:-translate-y-2 hover:bg-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]
              ">
            
                {/* shimmer */}
                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-r from-transparent via-white/25 to-transparent
                    -translate-x-full
                    group-hover:translate-x-full
                    transition-transform duration-700 ease-in-out
                    pointer-events-none
                  "
                />

                <div className="relative z-10">
                  <h4 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2">
                    {b.icon} {b.title}
                  </h4>
                  <p className="text-white/90 text-sm md:text-lg">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
  
          {/* CTA */}
          <button
            onClick={() => setDialogType("vendor")}
            className="inline-block px-10 py-5 rounded-full font-bold bg-white text-[var(--secondary)]
              transition-all duration-300 ease-out
              hover:bg-[var(--primary)] hover:text-white
              hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]
            ">
          Join Our Vendor Network
          </button>
  
        </div>
        <JoinDialog
        type="vendor"
        open={!!dialogType}
        onOpenChange={() => setDialogType(null)}
      />
      </section>
    );
  }
  