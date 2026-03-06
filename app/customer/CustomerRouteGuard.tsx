"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export default function CustomerRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, hasHydrated } = useAuthStore();

  const isPublicRoute =
    pathname === "/customer" || pathname.startsWith("/customer/deals/");
  const isAuthorized = Boolean(user && accessToken);

  useEffect(() => {
    if (isPublicRoute || !hasHydrated || isAuthorized) return;

    const redirectPath = pathname || "/customer";
    router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }, [isPublicRoute, hasHydrated, isAuthorized, pathname, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!hasHydrated || !isAuthorized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
