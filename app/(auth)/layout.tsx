"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      {/* <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-10">
        <Link href="/customer" className="flex items-center gap-1.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Save<span className="text-blue-600">My</span>Pay
          </span>
        </Link>
      </header> */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}