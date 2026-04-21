"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { isAdminSessionExpired } from "@/lib/admin/auth";
import { useAdminAuthStore } from "@/lib/admin/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAdminAuthStore((state) => state.hydrated);
  const session = useAdminAuthStore((state) => state.session);
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!session?.accessToken || isAdminSessionExpired(session)) {
      clearAuth();
      const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirect}`);
    }
  }, [clearAuth, hydrated, pathname, router, session]);

  if (!hydrated || !session?.accessToken || isAdminSessionExpired(session)) {
    return (
      <div className="min-h-screen bg-[#f5f4f6] px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1600px] items-center justify-center rounded-[32px] bg-white text-sm font-medium text-slate-600">
          Checking admin session...
        </div>
      </div>
    );
  }

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
