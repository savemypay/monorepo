"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { JoinDialog } from "../ui/join-dialog";
import { NAV_LINKS } from "./data";
import Image from "next/image";

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
const CUSTOMER_PORTAL_PATH = "/customer";
const VENDOR_PORTAL_URL = "https://vendor-silk.vercel.app/";

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function Navbar() {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        setIsPortalMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsPortalMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSectionClick = (sectionHref: string) => {
    smoothScroll(sectionHref.replace("#", ""));
    closeMenus();
  };

  const vendorIsExternal = isExternalUrl(VENDOR_PORTAL_URL);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] backdrop-blur-2xl bg-[#f5f4f6] border-b border-[rgba(232,168,48,0.18)]">
      <div className="max-w-[1200px] mx-auto h-14 md:h-20 px-6 flex items-center justify-between">
        <a href="#" className="inline-flex items-center gap-2.75 text-white no-underline font-extrabold text-2xl">
          {/* <span className="w-9 h-9 rounded-full border-2 border-[#e8a830] bg-[linear-gradient(135deg,#e8a830,#6ec6c0)] flex items-center justify-center text-lg">
            💰
          </span>
          SaveMyPay */}
          <Image src="/assets/logo.svg" alt="logo" height={80} width={180}/>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick(item.href);
              }}
              className="text-base font-semibold text-[#1b3a6b] hover:text-[#e8a830] transition-colors"
            >
              {item.label}
            </a>
          ))}
          {/* <div className="relative" ref={portalRef}>
            <button
              type="button"
              onClick={() => setIsPortalMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-white/75 hover:text-[#e8a830] transition-colors"
            >
              Access
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isPortalMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isPortalMenuOpen && (
              <div className="absolute right-0 mt-3 w-52 rounded-xl border border-[rgba(232,168,48,0.25)] bg-[#102748] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.35)]">
                <Link
                  href={CUSTOMER_PORTAL_PATH}
                  onClick={closeMenus}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-[#e8a830] transition-colors"
                >
                  Buyer Dashboard
                </Link>
                <a
                  href={VENDOR_PORTAL_URL}
                  onClick={closeMenus}
                  target={vendorIsExternal ? "_blank" : undefined}
                  rel={vendorIsExternal ? "noreferrer noopener" : undefined}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-[#e8a830] transition-colors"
                >
                  Partner Console
                </a>
              </div>
            )}
          </div> */}
          <button
            type="button"
            onClick={() => setDialogType("customer")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[9px] font-bold text-[15px] text-[#0f2347] bg-[linear-gradient(135deg,#F2B705,#D9A304)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,168,48,0.4)] transition-all"
          >
            Start Saving
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center text-[#0f2347] hover:text-[#e8a830] transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(232,168,48,0.18)] bg-white">
          <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-2">
            {NAV_LINKS.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleSectionClick(item.href)}
                className="block w-full text-left rounded-lg px-2 py-2 text-sm font-semibold text-[#0f2347] hover:text-[#e8a830] hover:bg-white/5 transition-colors"
              >
                {item.label}
              </button>
            ))}

            <div className="my-2 h-px bg-white/10" />

            {/* <Link
              href={CUSTOMER_PORTAL_PATH}
              onClick={closeMenus}
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-white/80 hover:text-[#e8a830] hover:bg-white/5 transition-colors"
            >
              Buyer Dashboard
            </Link>
            <a
              href={VENDOR_PORTAL_URL}
              onClick={closeMenus}
              target={vendorIsExternal ? "_blank" : undefined}
              rel={vendorIsExternal ? "noreferrer noopener" : undefined}
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-white/80 hover:text-[#e8a830] hover:bg-white/5 transition-colors"
            >
              Partner Console
            </a> */}

            <button
              type="button"
              onClick={() => {
                setDialogType("customer");
                closeMenus();
              }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 px-5 py-2 rounded-[9px] font-bold text-sm text-[#0f2347] bg-[linear-gradient(135deg,#e8a830,#f5c96a)]"
            >
              Start Saving
            </button>
          </div>
        </div>
      )}
      <JoinDialog type={dialogType} open={!!dialogType} onOpenChange={() => setDialogType(null)} />
    </nav>
  );
}
