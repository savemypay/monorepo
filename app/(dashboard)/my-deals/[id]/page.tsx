"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  Tag, 
  Calendar, 
  AlertCircle,
  Loader2,
  Users,
  Download,
  User,
  Mail,
  Smartphone,
  CheckCircle
} from "lucide-react";
import { useVendorStore } from "@/lib/store/authStore";
import { Deal, getMaxDiscount, getTimeLeft } from "@/lib/dealHelpers";
import { Lead } from "@/lib/api/leads";

export default function PoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Auth Store
  const vendorId = useVendorStore(state => state.vendor?.id);
  const accessToken = useVendorStore(state => state.accessToken);

  // State
  const [deal, setDeal] = useState<Deal | null>(null);
  const [customerlist,setCustomerList] = useState<Lead[] | []>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    if (!vendorId || !accessToken) return;

    const fetchDealDetails = async () => {
      try {
        setLoading(true);
        // Fetch ALL deals
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/ads?vendor_id=${vendorId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });

        if (!res.ok) throw new Error("Failed to fetch deals");

        const json = await res.json();
        
        if (json.success) {
          // Client-side Filter: Find the specific deal by ID
          const foundDeal = json.data.find((d: Deal) => String(d.id) === id);
          
          if (foundDeal) {
            setDeal(foundDeal);
          } else {
            setError("Deal not found");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading the deal.");
      } finally {
        setLoading(false);
      }
    };

    fetchDealDetails();
  }, [id, vendorId, accessToken]);

  useEffect(() => {
    if (!id || !accessToken) return;

    const fetchCustomerList = async () => {
      try {
        setCustomersLoading(true);
        // Fetch ALL deals
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments/paid-users?ad_id=${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });

        if (!res.ok) throw new Error("Failed to fetch deals");

        const json = await res.json();
        
        if (json.success) {          
          setCustomerList(json.data)
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading the deal.");
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomerList();
  }, [id,accessToken]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-400">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
        <p>Loading deal details...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !deal) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 inline-block">
          <AlertCircle size={40} className="mx-auto mb-2" />
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error || "Deal not found"}</p>
          <Link href="/my-deals" className="text-sm underline mt-4 block">Return to My Deals</Link>
        </div>
      </div>
    );
  }

  // --- Calculations ---
  const progress = deal.total_qty > 0 
    ? Math.min((deal.slots_sold / deal.total_qty) * 100, 100) 
    : 0;
  
  // Format Date Helpers
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatDateTime = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: '2-digit', minute:'2-digit' });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* Back Navigation */}
      <Link 
        href="/my-deals" 
        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to My deals
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${deal.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
              `}>
                {deal.status}
              </span>
              <span className="text-gray-400 text-xs font-mono">ID: #{deal.id}</span>
              <span className="text-gray-400 text-xs">• {deal.category}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed">{deal.description}</p>
          </div>
          
          <div className="bg-blue-50 px-6 py-4 rounded-xl text-center min-w-[160px] border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-1">Time Remaining</p>
            <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xl">
              <Clock size={20} />
              {getTimeLeft(deal.valid_to)}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Target Volume</p>
            <p className="text-2xl font-bold text-gray-800">{deal.total_qty} <span className="text-sm font-normal text-gray-500">Units</span></p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-green-700 text-xs font-semibold uppercase mb-1">Max Discount</p>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-green-600" />
              <p className="text-2xl font-bold text-green-700">{getMaxDiscount(deal.tiers)} OFF</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Token Amount</p>
            <p className="text-2xl font-bold text-gray-800">
              ₹{deal.token_amount.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-600 text-xs font-semibold uppercase mb-1">Revenue So Far</p>
            <p className="text-2xl font-bold text-blue-700">₹{(deal.slots_sold * deal.token_amount).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Pool Status</h3>
        
        <div className="relative mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>{deal.slots_sold} Customers Joined</span>
            <span>Goal: {deal.total_qty}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
              {/*Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-mono">
            <span>0</span>
            <span>{deal.total_qty}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Calendar size={16} className="text-gray-400" />
            Started: <span className="font-medium text-gray-900">{formatDate(deal.valid_from)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <AlertCircle size={16} className="text-gray-400" />
            Ends: <span className="font-medium text-gray-900">{formatDate(deal.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
             <h3 className="font-bold text-lg text-gray-800">Joined Customers</h3>
             <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
               {customerlist?.length}
             </span>
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-white border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
        
        {/* Table Content */}
        {customersLoading ? (
            <div className="p-12 flex justify-center text-gray-400">
                <Loader2 className="animate-spin" />
            </div>
        ) : customerlist?.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <Users size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No customers have joined yet.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Amount(₹)</th>
                      <th className="px-6 py-4">Date Joined</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerlist.map((cust) => (
                      <tr key={cust.payment_id} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. Customer Column (Smart Fallback) */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center shrink-0 border border-white shadow-sm">
                                    <User size={14} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {cust.user_name || "Guest User"}
                                    </p>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        {cust.user_email ? (
                                            <><Mail size={10} /> {cust.user_email}</>
                                        ) : (
                                            <><Smartphone size={10} /> {cust.user_phone_number}</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* 2. Order ID */}
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                            {cust.order_id.substring(0, 12)}...
                        </td>

                        {/* 3. Amount */}
                        <td className="px-6 py-4 font-medium text-gray-800">
                            {cust.amount}
                        </td>

                        {/* 4. Date */}
                        <td className="px-6 py-4 text-gray-600">
                            {formatDateTime(cust.created_at)}
                        </td>

                        {/* 5. Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize
                            ${cust.status === 'succeeded' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'}
                          `}>
                            {cust.status === 'succeeded' && <CheckCircle size={12} />}
                            {cust.status}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        )}
      </div>

    </div>
  );
}