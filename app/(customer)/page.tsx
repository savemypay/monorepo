"use client";

import DealCard from '@/components/DealCard';

const activeDeals = [
  { id: 1, title: "2024 Tesla Model Y", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800", discount: "15%", price: "$42,000", joined: 7, target: 10, endsIn: "2 days" },
  { id: 2, title: "iPhone 16 Pro Max", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800", discount: "20%", price: "$999", joined: 45, target: 50, endsIn: "5 hours" },
  { id: 3, title: "Luxury Maldives Trip", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=800", discount: "30%", price: "$2,500", joined: 2, target: 5, endsIn: "1 week" },
];

export default function CustomerHomePage() {
  return (
    <div className="space-y-8">
       <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Unlock Bulk Discounts.</h1>
          <p className="text-blue-100 text-lg max-w-xl">Join forces with other buyers to save big on premium products.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {activeDeals.map((deal) => (
           <DealCard key={deal.id} {...deal} />
         ))}
       </div>
    </div>
  );
}


