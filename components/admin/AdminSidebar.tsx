"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ADMIN_COOKIE, clearAdminAuth } from "@/lib/admin/auth";
import { NAV_ITEMS } from "@/lib/admin/navigation";

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = ["Workspace", "Account"] as const;

  const handleLogout = () => {
    document.cookie = `${ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    clearAdminAuth();
    onNavigate?.();
    router.replace("/login");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-5">
        <Link href="/" onClick={onNavigate} className="inline-flex items-center">
          <Image src="/logo.svg" alt="logo" height={80} width={180} />
        </Link>
        <h2 className="hidden md:block mt-3 text-2xl font-semibold text-brand">Admin Console</h2>
        <p className="hidden md:block mt-2 text-sm leading-6 text-slate-500">
          Marketplace operations, approvals, finance visibility, and business control.
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{group}</p>
              <div className="mt-2 space-y-1.5">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-brand-soft text-brand"
                          : "text-slate-700 hover:bg-brand-soft"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl ${
                          isActive ? "bg-white text-brand" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-line p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <LogOut size={14} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen = false, onMobileOpenChange }: AdminSidebarProps) {
  return (
    <>
      <aside className="hidden xl:block xl:w-[290px] xl:shrink-0">
        <div className="admin-panel sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[310px] border-r border-line bg-panel p-0 sm:max-w-[310px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
