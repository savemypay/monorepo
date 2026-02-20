"use client";

import { useState } from "react";
import { JoinDialog } from "@/components/ui/join-dialog";
import Image from "next/image";

type Particle = {
  id: number;
  size: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
};

const PARTICLE_COLORS = ["rgba(232,168,48,.2)", "rgba(110,198,192,.18)", "rgba(240,136,62,.15)"];
const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

const PARTICLES: Particle[] = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  size: 4 + ((index * 3) % 10),
  left: (index * 37) % 100,
  color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  duration: 7 + ((index * 5) % 12),
  delay: (index * 0.6) % 10,
}));

type DialogType = "customer" | "vendor" | null;

export default function Hero() {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center px-6 pt-[110px] pb-20 bg-[linear-gradient(140deg,#0f2347_0%,#1b3a6b_50%,#1a3a5c_100%)]">
      <div className="absolute -top-[200px] -right-[200px] w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.18)_0%,transparent_65%)] animate-[home2-breathe_7s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(110,198,192,0.12)_0%,transparent_65%)] animate-[home2-breathe_9s_ease-in-out_infinite_reverse]" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="absolute rounded-full animate-[home2-rise_linear_infinite]"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              background: particle.color,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-[2] w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-18 items-center">
        {/* left Section */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[rgba(232,168,48,0.12)] border border-[rgba(232,168,48,0.3)] text-[#f5c96a] px-[14px] py-[5px] rounded-[20px] text-[13px] font-semibold tracking-[0.4px] mb-[22px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#e8a830] animate-[home2-blink_1.5s_infinite]" />
            India&apos;s Collective Buying Platform
          </div>
          <h1 className="text-[36px] md:text-[52px] lg:text-[72px] leading-tight font-extrabold text-white mb-[22px]">
            Buy Together.
            <br />
            <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent">
              Save Big.
            </em>
            <br />
            The Smarter Way.
          </h1>
          <p className="text-lg text-white/78 max-w-[480px] leading-tight mb-[38px]">
            Join forces with thousands of smart buyers and unlock corporate-level discounts on
            insurance, property, cars and more - powered by collective buying strength.
          </p>
          <div className="flex flex-wrap max-sm:flex-col gap-[14px]">
            <button
              type="button"
              onClick={() => setDialogType("customer")}
              className="inline-flex items-center justify-center gap-2 px-[30px] py-[13px] rounded-[9px] font-bold text-[15px] text-[#0f2347] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
            >
              Start Saving Now →
            </button>
            <button
              type="button"
              onClick={() => setDialogType("vendor")}
              className="inline-flex items-center justify-center gap-2 px-[30px] py-[13px] rounded-[9px] font-semibold text-[15px] text-white border-[1.5px] border-white/22 hover:border-[#6ec6c0] hover:text-[#6ec6c0] hover:bg-[rgba(110,198,192,0.07)] transition-all"
            >
              Partner With Us
            </button>
          </div>
        </div>
        {/* Right Section */}
        <div
          className={`hidden w-full h-full lg:block relative`}
          data-reveal
        >
          {/* Custom generated collective buying concept image */}
          <Image
            src="/assets/Website_Hero_Image.png"
            alt="Collective Buying"
            fill
            className="w-full h-full object-cover transition-transform"
          />
        </div>
      </div>
      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />

      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            fill="#F9F7F3"
            d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
