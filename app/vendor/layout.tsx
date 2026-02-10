import VendorSidebar from "@/components/VendorSidebar";
import React from "react";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* 1. Fixed Sidebar */}
      <VendorSidebar/>

      {/* 2. Main Content Wrapper */}
      {/* ml-64 pushes content to the right of the fixed sidebar */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        
        {/* Sticky Header (Optional, but good for UX) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
           <h2 className="text-xl font-bold text-gray-800">Vendor Dashboard</h2>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8">
            {children}
        </div>
        
      </main>
    </div>
  );
}