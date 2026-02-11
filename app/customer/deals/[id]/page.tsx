"use client";

import { useState } from 'react';
import Link from "next/link";
import { useParams } from "next/navigation"; // 1. Import useParams
import { 
  ArrowLeft, 
  Clock, 
  Tag, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  ShieldCheck
} from "lucide-react";
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/app/context/AuthContext';

export default function DealDetailsPage() {
  // 2. Get the ID directly using the hook
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user, openLoginModal } = useAuth();
  const [isPayOpen, setIsPayOpen] = useState(false);

  // Mock Data
  const deal = {
    id: id,
    title: "2024 Tesla Model Y Long Range",
    description: "Exclusive bulk deal for the new Model Y. Includes 1-year free Supercharging and premium interior package. We need 10 confirmed buyers to activate this deal with the local dealership.",
    status: "Active",
    target: 10,
    current: 7,
    discount: "15%",
    price: "$42,000",
    originalPrice: "$49,500",
    tokenAmount: "$500.00",
    endsIn: "2 Days 5 Hours",
    startDate: "Oct 20, 2024",
    endDate: "Oct 27, 2024",
    participants: [
      { id: "U-101", name: "Rahul S.", date: "Oct 21", status: "Verified" },
      { id: "U-102", name: "Priya P.", date: "Oct 22", status: "Verified" },
      { id: "U-103", name: "Amit K.", date: "Oct 22", status: "Pending" },
      { id: "U-104", name: "Sneha G.", date: "Oct 23", status: "Verified" },
      { id: "U-105", name: "Vikram M.", date: "Oct 23", status: "Pending" },
    ]
  };

  const progress = (deal.current / deal.target) * 100;

  const handleAction = () => {
    if (!user) openLoginModal();
    else setIsPayOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Back Navigation */}
      <Link 
        href="/customer" 
        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to All Deals
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {deal.status}
              </span>
              <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                <ShieldCheck size={14} className="text-blue-500" /> Verified Vendor
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{deal.title}</h1>
            <p className="text-gray-500 leading-relaxed text-lg max-w-3xl">{deal.description}</p>
          </div>
          
          <div className="bg-blue-50 px-8 py-6 rounded-2xl text-center min-w-[180px] border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-2">Offer Ends In</p>
            <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-2xl">
              <Clock size={24} />
              {deal.endsIn}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10 pt-10 border-t border-gray-100">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Target Goal</p>
            <p className="text-3xl font-bold text-gray-800">{deal.target} <span className="text-lg text-gray-400 font-medium">Buyers</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Your Discount</p>
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-green-600" />
              <p className="text-3xl font-bold text-green-600">{deal.discount}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Deal Price</p>
            <p className="text-3xl font-bold text-gray-800">{deal.price}</p>
            <p className="text-sm text-gray-400 line-through font-medium">{deal.originalPrice}</p>
          </div>
          
          {/* Action Button Integrated into Grid */}
          <div className="flex flex-col justify-end">
             <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Token Advance</p>
             <p className="text-2xl font-bold text-blue-600 mb-3">{deal.tokenAmount}</p>
             <button 
                onClick={handleAction}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
             >
                {user ? 'Pay Token Now' : 'Login to Join'} 
             </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Pool Progress</h3>
        
        <div className="relative mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>{deal.current} Joined</span>
            <span>Goal: {deal.target}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
        </div>

        <div className="flex gap-8 text-sm border-t border-gray-50 pt-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} className="text-gray-400" />
            Started: <span className="font-medium text-gray-900">{deal.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle size={18} className="text-gray-400" />
            Ends: <span className="font-medium text-gray-900">{deal.endDate}</span>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Who is Joining? ({deal.participants.length})</h3>
          <span className="text-xs text-gray-500">Real-time updates</span>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Date Joined</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deal.participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {participant.name.charAt(0)}
                  </div>
                  {participant.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{participant.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    participant.status === 'Verified' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                    {participant.status === 'Verified' && <CheckCircle size={12} />}
                    {participant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentModal 
        isOpen={isPayOpen} 
        onClose={() => setIsPayOpen(false)} 
        amount={deal.tokenAmount} 
        dealTitle={deal.title} 
      />

    </div>
  );
}