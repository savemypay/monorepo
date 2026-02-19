"use client";

import { FOOTER_COLUMNS } from "./data";

function smoothScroll(id: string, offset = 68) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

export default function Home2Footer() {
  return (
    <footer className="bg-[#0f2347] px-6 pt-12 md:pt-17 pb-7 border-t border-[rgba(232,168,48,0.12)]">
      <div className="max-w-300 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-11 pb-13 border-b border-white/7">
        <div>
          <a
            href="#"
            className="inline-flex items-center gap-3 text-white no-underline font-extrabold text-[30px]"
          >
            <span className="w-9 h-9 rounded-full border-2 border-[#e8a830] bg-[linear-gradient(135deg,#e8a830,#6ec6c0)] flex items-center justify-center text-[18px]">
              💰
            </span>
            SaveMyPay
          </a>
          <p className="text-sm leading-[1.7] text-white/55 mt-3 max-w-67.5">
            Transforming how salaried professionals make high-value purchases through the
            collective buying power of our community.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h5 className="text-[#e8a830] uppercase tracking-[1.2px] text-[12px] font-bold mb-3">
              {column.title}
            </h5>
            {column.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  const isPlatformHashLink =
                    column.title === "Platform" && link.href.startsWith("#");
                  if (!isPlatformHashLink) return;

                  const targetId = link.href.replace("#", "");
                  const target = document.getElementById(targetId);
                  if (!target) return;

                  e.preventDefault();
                  smoothScroll(targetId);
                }}
                className="block text-sm no-underline text-white/55 mb-2 hover:text-[#e8a830] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="max-w-300 mx-auto pt-6 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-white/55">© 2026 SaveMyPay. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Privacy
          </a>
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Terms
          </a>
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
