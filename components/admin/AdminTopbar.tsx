"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, UserRound } from "lucide-react";
import {
  ADMIN_COOKIE,
  clearAdminAuth,
} from "@/lib/admin/auth";

type AdminTopbarProps = {
  onOpenSidebar?: () => void;
};

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = `${ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    clearAdminAuth();
    router.replace("/login");
  };

  return (
    <header className="admin-panel mb-6 px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Link href="/" aria-label="Open dashboard home" className="inline-flex items-center">
              <Image src="/logo.svg" alt="SaveMyPay" height={34} width={132} className="h-auto w-[150px]" />
            </Link>
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open navigation"
              title="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate-800 transition hover:bg-slate-50"
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="">
            <p className="text-lg font-bold uppercase tracking-[0.1em] text-accent hidden md:block">Operations Center</p>
            {/* <h1 className="mt-1 text-2xl font-extrabold text-brand">{title}</h1> */}
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/profile"
            aria-label="Open profile"
            title="Profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate-800 transition hover:bg-[#FFF4D6] group hover:border-[#D9A304]"
          >
            <UserRound size={18} className="group-hover:text-[#D9A304]"/>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate-800 transition hover:bg-red-50 group hover:border-red-500"
          >
            <LogOut size={18} className="group-hover:text-red-500"/>
          </button>
        </div>
      </div>
    </header>
  );
}
