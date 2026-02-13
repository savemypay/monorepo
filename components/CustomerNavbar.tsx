"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Heart, ShoppingBag, LogOut, Menu, X, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore"; // Import Store

export default function CustomerNavbar() {
  // Use Zustand Store for everything
  const { user, isAuthenticated, logout, openLoginModal } = useAuthStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. Logo */}
          <Link href="/customer" className="flex-shrink-0 flex items-center gap-1.5 z-50">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Save<span className="text-blue-600">My</span>Pay
            </span>
          </Link>

          {/* 2. Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="relative flex justify-between items-center px-4 py-2 border border-gray-300 rounded-full w-full max-w-sm bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                type="text"
                className="block w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Search deals..."
              />
              <div className="pl-2 pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* 3. Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated && user ? (
              /* LOGGED IN VIEW */
              <>
                <div className="flex items-center gap-2">
                  <Link href="/customer/saved" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Heart size={22} />
                  </Link>
                  <Link href="/customer/my-deals" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <ShoppingBag size={22} />
                  </Link>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                  >
                    {/* <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div> */}
                    <User size={22}/>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || user.phone_number}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/customer/my-deals" className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ShoppingBag size={18} /> My Orders
                        </Link>
                        <Link href="/customer/saved" className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Heart size={18} /> Saved Deals
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* GUEST VIEW */
              <Link 
                href="/login"
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-all shadow-md active:scale-95"
              >
                Login
              </Link>
            )}
          </div>

          {/* 4. Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-40">
          <div className="p-4 space-y-4">
             {/* Mobile Search */}
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
              <input 
                type="text" 
                placeholder="Search deals..." 
                className="w-full outline-none" 
              />
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            
            {isAuthenticated && user ? (
              <div className="space-y-1 pt-2">
                 <div className="px-3 py-2 flex items-center gap-3 mb-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                       {(user.email?.[0] || user.phone_number?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">User #{user.id}</p>
                      <p className="text-xs text-gray-500">{user.email || user.phone_number}</p>
                    </div>
                 </div>
                 <Link href="/customer/my-deals" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">
                   <ShoppingBag size={20} /> My Orders
                 </Link>
                 <Link href="/customer/saved" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">
                   <Heart size={20} /> Favorites
                 </Link>
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
                   <LogOut size={20} /> Logout
                 </button>
              </div>
            ) : (
              <div className="pt-2 pb-2 w-full">
                <Link 
                href="/login"
                className="w-full px-6 py-4 text-sm transition-all active:scale-95 bg-blue-600 text-white rounded-xl font-bold shadow-md"
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