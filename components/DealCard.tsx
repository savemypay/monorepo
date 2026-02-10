"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Heart } from "lucide-react";
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) openLoginModal();
    else alert("Added to favorites!");
  };

  return (
    <Link
      href={`/deals/${id}`}
      className="group bg-white rounded-2xl border border-gray-200 hover:shadow-lg overflow-hidden
                 flex flex-col md:flex-row"
    >
      {/* IMAGE */}
      <div className="relative md:w-1/3">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />

        {/* Discount */}
        <div className="absolute top-1 left-2 bg-white px-3 py-1 rounded-full text-xs font-bold shadow text-blue-500 z-1000">
          {discount} OFF
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          className="absolute top-1 right-0 bg-white p-2 rounded-full shadow"
        >
          <Heart size={16} />
        </button>

        {/* Time */}
        <div className="absolute bottom-0 left-3 bg-white text-blue-400 text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock size={12} />
          {endsIn} left
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col justify-between md:w-2/3">
        <div>
          <h3 className="font-bold text-lg mb-3">{title}</h3>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {joined}/{target} joined
              </span>
              <span className="text-green-600">Filling fast</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-end pt-4 border-t">
          <div>
            <p className="text-xs text-gray-400">Group Price</p>
            <p className="text-xl font-bold">{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
