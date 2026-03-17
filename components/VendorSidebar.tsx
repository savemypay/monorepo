"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, IndianRupeeIcon, X, User } from "lucide-react";
import Image from "next/image";

// --- Configuration ---
const sidebarItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My Deals", href: "/my-deals", icon: ShoppingBag },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Earnings", href: "/earnings", icon: IndianRupeeIcon },
  { label: "Profile", href: "/profile", icon: User },
];

// --- Types ---
interface SidebarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

interface SidebarContentProps {
  pathname: string;
  closeMobileMenu: () => void;
}

// --- 1. Sub-Component (Defined OUTSIDE the main component) ---
function SidebarContent({ pathname, closeMobileMenu }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center h-20">
        <div>
          <a href="#" className="inline-flex items-center gap-2.75 text-white no-underline font-extrabold text-2xl">
          <Image src="/assets/logo.svg" alt="logo" height={80} width={180}/>
        </a>
        </div>
        {/* Close Button (Visible on Mobile Only) */}
        <button
          onClick={closeMobileMenu} 
          className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full absolute top-1 right-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isRoot = item.href === "/";
          const isActive = isRoot ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu} // Close drawer on click (mobile UX)
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#E7F6F6] text-[#1CA7A6]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[#E7F6F6]">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-[#1CA7A6] text-sm">Need Help?</h4>
          <p className="text-xs text-[#1CA7A6] mt-1">Contact platform support for assistance.</p>
        </div>
      </div>
    </div>
  );
}

// --- 2. Main Component ---
export default function VendorSidebar({ isOpen, closeMobileMenu }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* A. Desktop Sidebar (Static) */}
      <aside className="hidden md:flex w-64 flex-col h-screen fixed left-0 top-0 z-30 bg-white">
        <SidebarContent pathname={pathname} closeMobileMenu={closeMobileMenu} />
      </aside>

      {/* B. Mobile Sidebar (Drawer) */}
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} closeMobileMenu={closeMobileMenu} />
      </div>
    </>
  );
}
