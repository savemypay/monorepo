"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Gift,
  HelpCircle,
  History,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Ticket,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  CUSTOMER_ACCOUNT_ITEMS,
  CUSTOMER_ACCOUNT_SECTIONS,
  customerAccountHref,
  type CustomerAccountIconKey,
} from "@/lib/customer-account";

const ICON_MAP: Record<CustomerAccountIconKey, LucideIcon> = {
  settings: Settings,
  orders: ShoppingBag,
  earnings: Wallet,
  payments: CreditCard,
  history: History,
  ticket: Ticket,
  gift: Gift,
  users: Users,
  help: HelpCircle,
  star: Star,
  shield: Shield,
};

function titleFromPath(pathname: string) {
  const item = CUSTOMER_ACCOUNT_ITEMS.find((entry) => customerAccountHref(entry.slug) === pathname);
  return item?.label ?? "My Account";
}

export default function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedPath =
    CUSTOMER_ACCOUNT_ITEMS.find((item) => customerAccountHref(item.slug) === pathname)?.slug ?? "profile-settings";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {CUSTOMER_ACCOUNT_SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-slate-100 last:border-b-0">
              <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
                {section.title}
              </p>
              <nav className="py-1.5">
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const href = customerAccountHref(item.slug);
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      className={`mx-2 my-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-[#E8F0F8] text-[#1CA7A6] font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="lg:hidden mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <label htmlFor="account-section-select" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Account Section
          </label>
          <select
            id="account-section-select"
            value={selectedPath}
            onChange={(event) => router.push(customerAccountHref(event.target.value as typeof selectedPath))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
          >
            {CUSTOMER_ACCOUNT_SECTIONS.map((section) => (
              <optgroup key={section.title} label={section.title}>
                {section.items.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{titleFromPath(pathname)}</h1>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
