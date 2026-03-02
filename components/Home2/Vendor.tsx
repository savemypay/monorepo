"use client";

import { useState } from "react";
import { VENDOR_PERKS } from "./data";
import { JoinDialog } from "@/components/ui/join-dialog";
import Image from "next/image";

const REVEAL =""
  //"opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

type DialogType = "customer" | "vendor" | null;

export default function Vendor() {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  return (
    <section id="partner" className="px-6 py-12 md:py-24 bg-[#f5f4f6]">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 items-start mt-4">
          <div>
            {/* <span className={`inline-block bg-[#fdf3dc] text-[#e8a830] px-4 py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`} data-reveal>
              For Vendors
            </span> */}
            <h2 className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight font-medium mb-4 ${REVEAL}`} data-reveal style={{ transitionDelay: "100ms" }}>
              Vendors, <em className="not-italic text-[#1b3a6b]"> Get Ready for Guaranteed Bulk Buyers </em>
            </h2>
            <p className={`text-base md:text-lg text-[#7A8CA3] max-w-135 ${REVEAL}`} data-reveal style={{ transitionDelay: "200ms" }}>
              Move inventory faster, cut marketing costs, and connect with pre-qualified buyers
              ready to purchase in volume.
            </p>

            <div className="flex flex-col gap-4 mt-7">
              {VENDOR_PERKS.map((item, index) => (
                <article
                  key={item.title}
                  className={`flex items-start gap-4 bg-white rounded-[11px] p-4.5 border border-[#e0e8f0] hover:border-[#e8a830] hover:shadow-[0_4px_16px_rgba(232,168,48,0.12)] transition-all ${REVEAL}`}
                  data-reveal
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-[26px] shrink-0">
                    <Image src={item.icon} alt={item.title} width={30} height={30}/>
                  </div>
                  <div>
                    <h5 className="text-lg md:text-xl font-bold text-[#1b3a6b] mb-1">{item.title}</h5>
                    <p className="text-sm md:text-base text-[#5a7090] leading-normal">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside
            className={`relative bg-[#0C111A] rounded-[20px] p-10 text-center border border-[rgba(232,168,48,0.15)] shadow-[0_20px_60px_rgba(15,35,71,0.15)] ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            {/* Subtle background glow for depth */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-50 h-125 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

            <h3 className="text-[26px] font-extrabold text-white mb-3">Ready to Grow With Us?</h3>
            <p className="text-base leading-[1.65] text-white/48 mb-7">
              Join our growing network of verified vendors and start receiving pre-qualified bulk
              orders from thousands of salaried professionals today.
            </p>
            <button
              type="button"
              onClick={() => setDialogType("vendor")}
              className="inline-flex w-full items-center justify-center gap-2 px-7.5 py-3 rounded-[9px] font-bold text-base text-[#0f2347] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
            >
              Become a Partner Vendor
            </button>
            <p className="text-[12px] mt-4 mb-0 text-white/28">
              Free to join · No setup fees · Cancel anytime
            </p>
          </aside>
        </div>
      </div>
      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />
    </section>
  );
}
