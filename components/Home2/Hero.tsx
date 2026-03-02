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
    <section className="relative mt-14 md:mt-20 min-h-[calc(100svh-4rem)] overflow-hidden bg-[#f5f4f6]">
      <div className="absolute -top-[120px] -right-[200px] w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.16)_0%,transparent_70%)] animate-[home2-breathe_7s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[180px] -left-[180px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(110,198,192,0.12)_0%,transparent_70%)] animate-[home2-breathe_9s_ease-in-out_infinite_reverse]" />
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

      <div className="relative z-20 mx-auto min-h-[calc(100svh-5rem)] w-full max-w-300 px-4 sm:px-6 pb-28 sm:pb-32 md:pb-36 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-10">
          <div className="flex flex-col items-center text-center pt-10">
            <h1 className="max-w-5xl text-[48px] md:text-[56px] lg:text-[72px] leading-[1.08] font-extrabold text-[#163B63] mb-1">
              Buy Together.
              <br className="block md:hidden"/>
              <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent ">
                Save Big.
              </em>
            </h1>
            <p className="text-[#1b3a6b] text-lg sm:text-2xl lg:text-3xl font-semibold mb-7">
              Corporate Power for Every Salaried Indian 
            </p>
            <p className="text-base sm:text-lg lg:text-lg max-w-4xl leading-tight mb-7 text-[#7A8CA3]">
              Join thousands of working professionals and unlock huge discounts on insurance, cars, property, gadgets & more - through collective buying. 
            </p>
            <div className="flex w-full max-w-xl flex-col sm:flex-row sm:justify-center gap-3 sm:gap-[14px]">
              <button
                type="button"
                onClick={() => setDialogType("customer")}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-[30px] py-[13px] rounded-[9px] font-bold text-[15px] text-[#163B63] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
              >
                Start Saving Now
              </button>
              <button
                type="button"
                onClick={() => setDialogType("vendor")}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-[30px] py-[13px] rounded-[9px] font-semibold text-[15px] text-[#163B63] border-[1.5px] border-[#163B63] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_#163B6344] transition-all"
              >
                For Vendors
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 md:-bottom-30 2xl:-bottom-10 left-0 right-0 z-2 w-full leading-none pointer-events-none opacity-100 ">
        <Image
          src="/assets/hero-footer6.png"
          width={1820}
          height={320}
          alt=""
          aria-hidden="true"
          className="block w-[90%] h-auto mx-auto"
        />
      </div>

      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />
    </section>
  );
}
