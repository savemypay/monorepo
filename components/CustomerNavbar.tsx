"use client";

import Link from "next/link";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  Heart,
  History,
  Gift,
  Users,
  Wallet,
  CreditCard,
  Ticket,
  HelpCircle,
  Star,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { getProfile, type Profile } from "@/lib/api/profile";
import { unbindNotificationInstallation } from "@/lib/api/notifications";
import { registerBrowserPushToken } from "@/lib/notifications/firebase";
import { getStoredInstallationId } from "@/lib/notifications/installation";
import Image from "next/image";
import {
  CUSTOMER_ACCOUNT_SECTIONS,
  customerAccountHref,
  type CustomerAccountIconKey,
} from "@/lib/customer-account";

const ICON_MAP: Record<CustomerAccountIconKey, LucideIcon> = {
  settings: Settings,
  orders: ShoppingBag,
  heart: Heart,
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

function isActivePath(pathname: string, targetPath: string) {
  if (targetPath === "/customer/my-orders") {
    return pathname === "/customer/my-orders" || pathname === "/customer/my-deals";
  }
  return pathname === targetPath;
}

function formatInr(value: number) {
  return `₹${(Number.isFinite(value) ? value : 0).toLocaleString("en-IN")}`;
}

export default function CustomerNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user, accessToken, isAuthenticated, logout } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasSession = Boolean(isAuthenticated && accessToken);
  const profileName =
    profile?.name || user?.name || (profile?.id || user?.id ? `User #${profile?.id || user?.id}` : "User");
  const profileContact =
    profile?.email || profile?.phone_number || user?.email || user?.phone_number || "No contact added";
  const profileInitial = (
    profile?.email?.[0] ||
    profile?.name?.[0] ||
    // profile?.phone_number?.[0] ||
    user?.email?.[0] ||
    user?.name?.[0] ||
    // user?.phone_number?.[0] ||
    "U"
  ).toUpperCase();

  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!hasSession || !accessToken) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await getProfile(accessToken);
        if (isMounted) {
          setProfile(response);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    // const loadEarnings = async () => {
    //   try {
    //     const summary = await getCustomerEarnings(accessToken);
    //     if (isMounted) {
    //       setEarnings(summary);
    //     }
    //   } catch {
    //     if (isMounted) {
    //       setEarnings({ total_cashback: 0, total_rewards: 0 });
    //     }
    //   }
    // };

    void loadProfile();
    // void loadEarnings();

    return () => {
      isMounted = false;
    };
  }, [hasSession, accessToken]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = searchInput.trim();
    const params = new URLSearchParams(pathname === "/customer" ? searchParams.toString() : "");

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.push(queryString ? `/customer?${queryString}` : "/customer");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    try {
      const installationId = getStoredInstallationId();
      if (installationId && accessToken) {
        await unbindNotificationInstallation(installationId, accessToken);
      }
      await registerBrowserPushToken(undefined, { forceSync: true }).catch(() => null);
    } catch {
      // Logout should still succeed even if unbind fails.
    } finally {
      logout();
      router.push("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/customer" className="inline-flex items-center gap-2.75 text-white no-underline font-extrabold text-2xl">
            <Image src="/assets/logo.svg" alt="logo" height={80} width={180} />
          </Link>

          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex justify-between items-center px-4 py-2 border border-gray-300 rounded-full w-full max-w-sm bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="block w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Search deals..."
                aria-label="Search deals"
              />
              <button type="submit" className="pl-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {hasSession ? (
              <>
                {/* <Link
                  href="/customer/my-orders"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <ShoppingBag size={22} />
                </Link> */}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={isProfileOpen}
                    className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#163B63] text-white text-sm font-semibold flex items-center justify-center">
                      {profileInitial}
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs text-gray-500">My Account</p>
                      <p className="max-w-[110px] truncate text-sm font-semibold text-gray-900">{profileName}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-90 max-h-[75vh] overflow-y-auto bg-white rounded-2xl shadow-[0_18px_40px_rgba(15,35,71,0.12)] border border-gray-100 py-2 z-50">
                      <div className="px-5 pt-4 pb-3">
                        <p className="text-[20px] leading-tight font-bold text-gray-900 truncate">{profileName}</p>
                        <p className="mt-1 text-xs text-gray-500 truncate">{profileContact}</p>

                        {/* <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-gray-100 px-3 py-3">
                            <p className="text-sm text-gray-700">Total Cashback</p>
                            <p className="text-xl font-bold text-gray-900">{formatInr(earnings.total_cashback)}</p>
                          </div>
                          <div className="rounded-xl bg-gray-100 px-3 py-3">
                            <p className="text-sm text-gray-700">Total Rewards</p>
                            <p className="text-xl font-bold text-gray-900">{formatInr(0)}</p>
                          </div>
                        </div> */}
                      </div>
                      {CUSTOMER_ACCOUNT_SECTIONS.map((section) => (
                        <div key={section.title} className="border-t border-gray-100 pt-2 pb-1">
                          <p className="px-5 pb-1 text-sm font-semibold text-gray-600">{section.title}</p>

                          {section.items.map((item) => {
                            const Icon = ICON_MAP[item.icon];
                            const href = customerAccountHref(item.slug);
                            const isActive = isActivePath(pathname, href);

                            return (
                              <Link
                                key={item.slug}
                                href={href}
                                onClick={() => setIsProfileOpen(false)}
                                className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${
                                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                                }`}
                              >
                                <Icon size={18} className={isActive ? "text-blue-700" : "text-gray-700"} />
                                <span className="text-sm font-medium text-gray-900 truncate">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ))}

                      <div className="border-t border-gray-100 px-2 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#122E4E] text-white px-6 py-2 rounded-full font-medium text-base hover:bg-[#163B63] transition-all shadow-md active:scale-95"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden gap-4">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white border-b border-gray-100 shadow-xl z-50">
          <div className="p-4 pb-8 space-y-4">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none focus-within:ring-2 focus-within:ring-[#122E4E]"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search deals..."
                className="w-full outline-none bg-transparent"
                aria-label="Search deals"
              />
              <button type="submit" className="text-gray-400 hover:text-[#122E4E] transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {hasSession ? (
              <div className="space-y-2 pt-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
                  <p className="text-xs text-gray-600">Hello,</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{profileName}</p>
                  <p className="text-xs text-gray-600 truncate">{profileContact}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">
                      <p className="text-xs text-gray-600">Total Cashback</p>
                      <p className="text-base font-bold text-gray-900">{formatInr(earnings.total_cashback)}</p>
                    </div> */}
                    <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">
                      <p className="text-xs text-gray-600">Total Rewards</p>
                      <p className="text-base font-bold text-gray-900">{formatInr(0)}</p>
                    </div>
                  </div>
                </div>

                {CUSTOMER_ACCOUNT_SECTIONS.map((section) => (
                  <div key={section.title} className="rounded-xl border border-gray-100 overflow-hidden">
                    <p className="px-3 py-2 text-xs font-semibold bg-gray-50 text-gray-600">{section.title}</p>

                    {section.items.map((item) => {
                      const Icon = ICON_MAP[item.icon];
                      const href = customerAccountHref(item.slug);
                      const isActive = isActivePath(pathname, href);

                      return (
                        <Link
                          key={item.slug}
                          href={href}
                          onClick={closeMenus}
                          className={`flex items-center justify-between px-3 py-3 text-sm font-medium ${
                            isActive ? "bg-blue-50 text-blue-700" : "text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 px-3 py-3 rounded-xl text-red-600 border border-red-100 hover:bg-red-50 font-medium"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 pb-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-6 py-4 text-center text-sm transition-all active:scale-95 bg-[#122E4E] text-white rounded-xl font-bold shadow-md"
                >
                  Login / Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
