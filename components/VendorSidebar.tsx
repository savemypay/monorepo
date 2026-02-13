"use client"; // Required for hooks like usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, DollarSign, LogOut } from "lucide-react";

const sidebarItems = [
  { label: "Overview", href: "/vendor", icon: LayoutDashboard },
  { label: "My Deals", href: "/vendor/my-deals", icon: ShoppingBag },
  { label: "Leads", href: "/vendor/leads", icon: Users },
  { label: "Earnings", href: "/vendor/earnings", icon: DollarSign },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen fixed left-0 top-0 z-10">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-700">
          Save<span className="text-slate-800">My</span>Pay
        </h1>
        <p className="text-xs text-gray-400 mt-1">Vendor Portal</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 text-red-500 px-4 py-3 text-sm font-medium hover:bg-red-50 rounded-lg w-full transition-colors">
            <LogOut size={20} /> Logout
        </button>
        <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 text-sm">Need Help?</h4>
        <p className="text-xs text-blue-600 mt-1">Contact platform support for deal disputes.</p>
        </div>
        </div>
    </aside>
  );
}