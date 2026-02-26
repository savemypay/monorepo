"use client";

import { FOOTER_COLUMNS } from "./data";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const socialLinks = [
  {
    id: 1,
    name: "X (Twitter)",
    icon: "/assets/X.svg",
    link: "https://x.com/Savemypay_xyz",
  },
  {
    id: 2,
    name: "Instagram",
    icon: "/assets/instagram.svg",
    link: "https://www.instagram.com/savemypay",
  },
  {
    id: 3,
    name: "YouTube",
    icon: "/assets/youtube.svg",
    link: "https://www.youtube.com/@savemypay",
  },
];

function smoothScroll(id: string, offset = 68) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

export default function Footer() {
  return (
    <footer className="bg-[#0f2347] px-6 pt-12 md:pt-17 pb-7 border-t border-[rgba(232,168,48,0.12)]">
      <div className="max-w-300 mx-auto grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-7 md:gap-11 pb-13 border-b border-white/7">
        <div className="col-span-2 lg:col-span-1">
          <a
            href="#"
            className="inline-flex items-center gap-3 text-white no-underline font-extrabold text-[30px]"
          >
            {/* <span className="w-9 h-9 rounded-full border-2 border-[#e8a830] bg-[linear-gradient(135deg,#e8a830,#6ec6c0)] flex items-center justify-center text-[18px]">
              💰
            </span>
            SaveMyPay */}
            <Image src="/assets/logo.png" alt="logo" height={60} width={180}/>
            
          </a>
          <p className="text-sm leading-[1.7] text-white/55 mt-3 max-w-67.5">
            Transforming how salaried professionals make high-value purchases through the
            collective buying power of our community.
          </p>
        </div>
        {/* <div className="col-span-2 lg:col-span-1">
          <h5 className="text-[#e8a830] uppercase tracking-[1.2px] text-[12px] font-bold mb-3">
            Address
          </h5>
          <div className="space-y-3 text-sm text-white/55">
            <p className="flex items-start gap-2.5 leading-[1.6]">
              <MapPin size={16} className="mt-0.5 text-[#e8a830] shrink-0" />
              Plot No. 255, 3rd Floor, Botanical Garden Rd, Kondapur, Sri Ramnagar - Block B, Telangana 500084
            </p>
            <a
              href="mailto:support@savemypay.xyz"
              className="flex items-center gap-2.5 hover:text-[#e8a830] transition-colors"
            >
              <Mail size={16} className="text-[#e8a830] shrink-0" />
              support@savemypay.xyz
            </a>
            <a
              href="tel:+919000000000"
              className="flex items-center gap-2.5 hover:text-[#e8a830] transition-colors"
            >
              <Phone size={16} className="text-[#e8a830] shrink-0" />
              +91 90000 00000
            </a>
          </div>
        </div> */}

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
                  const isHashLink = link.href.startsWith("#");
                  if (!isHashLink) return;

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
        <div className="col-span-2 lg:col-span-1">
          <h5 className="text-[#e8a830] uppercase tracking-[1.2px] text-[12px] font-bold mb-3">
            Contact US
          </h5>
          {/* Email */}
          <div className="mt-4">
            <a
              href="mailto:support@savemypay.xyz"
              className="flex items-center gap-2.5 text-white/55 hover:text-[#e8a830] transition-colors font-medium text-md"
            >
              <Mail size={16} className="text-[#e8a830] shrink-0" />
              support@savemypay.xyz
            </a>
          </div>
          {/* Social Links */}
          <div className="mt-4">
          <h5 className="text-[#e8a830] uppercase tracking-[1.2px] text-[12px] font-bold mb-3">
            Social
          </h5>
          <div className="flex items-center gap-4">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={item.name}
                className="group inline-flex items-center justify-center"
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain opacity-80 transition-opacity group-hover:opacity-100 hover:scale-120"
                />
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-300 mx-auto pt-6 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-white/55">© 2026 SaveMyPay. All rights reserved.</p>
        {/* <div className="flex items-center gap-5">
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Privacy
          </a>
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Terms
          </a>
          <a href="#" className="text-[12px] text-white/45 no-underline hover:text-[#e8a830] transition-colors">
            Cookies
          </a>
        </div> */}
      </div>
    </footer>
  );
}
