"use client";

import CustomerNavbar from "@/components/CustomerNavbar";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "../context/AuthContext";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
        {/* Navbar */}
        <CustomerNavbar />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        
        {/* Auth Modal (Global) */}
        <AuthModal />
        
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SaveMyPay. All rights reserved.
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}