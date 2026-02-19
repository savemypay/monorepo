 "use client";

import { useState } from "react";
import { JoinDialog } from "../ui/join-dialog";
import { NAV_LINKS } from "./data";

function smoothScroll(id: string, offset = 68) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

type DialogType = "customer" | "vendor" | null;

export default function Navbar() {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  return (
    <nav className="fixed top-0 left-0 right-0 z-200 backdrop-blur-2xl bg-[rgba(15,35,71,0.92)] border-b border-[rgba(232,168,48,0.18)]">
      <div className="max-w-[1200px] mx-auto h-20 px-6 flex items-center justify-between">
        <a href="#" className="inline-flex items-center gap-2.75 text-white no-underline font-extrabold text-2xl">
          <span className="w-9 h-9 rounded-full border-2 border-[#e8a830] bg-[linear-gradient(135deg,#e8a830,#6ec6c0)] flex items-center justify-center text-lg">
            💰
          </span>
          SaveMyPay
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                smoothScroll(item.href.replace("#", ""));
              }}
              className="text-base font-semibold text-white/60 hover:text-[#e8a830] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <button
              type="button"
              onClick={() => setDialogType("customer")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[9px] font-bold text-[15px] text-[#0f2347] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
            >
              Start Saving →
            </button>
        </div>
      </div>
      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />
    </nav>
  );
}
