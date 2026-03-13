"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f4f6] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 xl:flex-row">
        <AdminSidebar mobileOpen={isMobileSidebarOpen} onMobileOpenChange={setIsMobileSidebarOpen} />
        <div className="min-w-0 flex-1">
          <AdminTopbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
          <main className="min-h-[calc(100vh-9rem)] rounded-[32px] md:bg-background p-0 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
