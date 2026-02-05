"use client";

import Link from "next/link";
import { useState } from "react";

export function smoothScroll(id: string, offset = 80) {
  const element = document.getElementById(id);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

const navLinks = [
  {id:1, label: "Categories", href: "categories" },
  {id:2, label: "How It Works", href: "how-it-works" },
  {id:3, label: "Impact", href: "impact" },
  {id:4, label: "Partner", href: "partner" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[rgba(10,14,39,0.85)] backdrop-blur-xl border-b border-[rgba(0,229,200,0.3)]">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-white text-xl md:text-3xl font-extrabold tracking-normal">
          Save<span className="text-(--accent) glow-text">My</span>Pay
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-10 text-white font-medium">
          {navLinks.map((item) => (
            <li key={item.label}>
              <Link
                href={`#${item.href}`}
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll(item.href);
                }}
                className="hover:text-[var(--accent)] transition text-lg"
              >
                {item.label}
              </Link>

            </li>
          ))}
        </ul>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[rgba(10,14,39,0.95)] px-6 py-4">
          <ul className="flex flex-col gap-8 text-white">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  href={`#${item.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScroll(item.href);
                    setOpen(false);
                  }}
                  className="hover:text-[var(--accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
