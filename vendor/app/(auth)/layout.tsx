"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Navbar */}
      <nav className="h-20 flex items-center w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link href="/" aria-label="Go to homepage" className="inline-flex items-center gap-3">
            <Image src="/assets/logo.svg" alt="Company logo" height={80} width={180} />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}