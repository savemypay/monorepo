"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface DealCardProps {
  id: number | string;
  title: string;
  image: string;
  discount: string;
  price: string;
  joined: number;
  target: number;
  endsIn: string;
}

export default function DealCard({
  id,
  title,
  image,
  discount,
  price,
  joined,
  target,
  endsIn,
}: DealCardProps) {
  const { user, openLoginModal } = useAuth();

  const progress = Math.min((joined / target) * 100, 100);
  const isFillingFast = progress >= 70;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) openLoginModal();
    else alert("Added to favorites!");
  };

  return (
    <Link
      href={`/customer/deals/${id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md z-10">
          {discount} OFF
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:bg-white transition-all z-10"
        >
          <Heart size={18} />
        </button>

        {/* Timer Badge */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10 border border-white/10">
          <Clock size={12} className="text-blue-400" />
          <span className="font-medium">{endsIn} left</span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-blue-500" />
                <span className="text-gray-700">{joined}/{target}</span> joined
              </span>
              {isFillingFast && (
                <span className="text-orange-600 font-bold animate-pulse text-[10px] uppercase tracking-wide">🔥 Filling fast</span>
              )}
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFillingFast ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end pt-4 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Group Price</p>
            <p className="text-xl font-extrabold text-gray-900">{price}</p>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}