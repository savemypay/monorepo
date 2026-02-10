"use client";

import { useAuth } from '@/app/context/AuthContext';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function SavedDealsPage() {
  const { user, openLoginModal } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full"><Heart size={32} className="text-red-400" /></div>
        <h2 className="text-xl font-bold">Login to View Favorites</h2>
        <button onClick={openLoginModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Login Now</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Saved Deals</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p>You havent saved any deals yet.</p>
      </div>
    </div>
  );
}