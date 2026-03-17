'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Store 
} from 'lucide-react';
import Link from 'next/link';
import { useVendorStore } from '@/lib/store/authStore';
import { getVendorProfile, type VendorProfileDetails } from '@/lib/api/profile';

import { Menu } from 'lucide-react'; // Import Menu Icon
import Image from 'next/image';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function VendorNavbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { vendor, logout } = useVendorStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);
  const [profile, setProfile] = useState<VendorProfileDetails | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await getVendorProfile();
        if (isMounted && response.success) {
          setProfile(response.data?.[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // 1. Clear Zustand state & localStorage
    document.cookie = "vendor_authenticated=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace('/login'); // 2. Redirect
  };

  // Safe fallbacks if data is missing
  const ownerName = profile?.name || vendor?.owner_name || "Vendor";
  const businessName = profile?.category || vendor?.business_name || "My Business";
  const contactInfo = profile?.phone_number || profile?.email || vendor?.phone_number || vendor?.email || "No contact info";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 px-4 sm:px-8 flex items-center justify-between shadow-sm">
      
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <div className='block md:hidden'>
          <a href="#" className="inline-flex items-center gap-2.75 text-white no-underline font-extrabold text-2xl">
          <Image src="/assets/logo.svg" alt="logo" height={80} width={180}/>
        </a>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Profile Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-lg transition-all focus:outline-none border border-transparent hover:border-gray-200"
          >
            {/* Avatar */}
            <div className="h-9 w-9 bg-[#E7F6F6] text-[#1CA7A6] rounded-full flex items-center justify-center border border-[#168F8E] shadow-sm">
              <User size={18} />
            </div>
            
            {/* Text Info (Hidden on small mobile) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-none">{ownerName}</p>
              <p className="text-xs text-gray-500 mt-1">{businessName}</p>
            </div>

            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-gray-100 mb-2 bg-gray-50/50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Welcome</p>
                <p className="font-medium text-gray-900 truncate text-sm mt-1">{contactInfo}</p>
              </div>

              <div className="px-1 space-y-1">
                <Link 
                  href="/profile" 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                >
                  <User size={16} /> My Profile
                </Link>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                  <Store size={16} /> Business Details
                </button>
              </div>

              <div className="mt-2 border-t border-gray-100 pt-2 px-1">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsSignoutOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {isSignoutOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="p-6 space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Confirm Sign Out</h4>
              <p className="text-sm text-gray-600">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setIsSignoutOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
