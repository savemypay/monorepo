"use client";

import { useAuthStore } from '@/lib/store/authStore'; // Updated Import
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function SavedDealsPage() {
  // Use Store hook
  const { user, openLoginModal } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-red-50 p-6 rounded-full">
          <Heart size={48} className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Login to View Favorites</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            Save deals to your watchlist and track them easily by logging in.
          </p>
        </div>
        <button 
          onClick={openLoginModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Deals</h1>
      
      {/* Empty State / Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 py-6 text-center">
         <div className="flex flex-col items-center justify-center space-y-4">
           <Heart size={48} className="text-gray-300" />
           <div>
             <p className="text-gray-900 font-medium">You haven&apos;t saved any deals yet.</p>
             <Link href="/customer" className="inline-block text-blue-600 font-bold hover:underline mt-2">
               Explore Pools
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}