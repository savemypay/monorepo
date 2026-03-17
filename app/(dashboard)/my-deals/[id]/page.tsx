"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, Tag, Calendar, AlertCircle, Loader2, Users, Download, 
  User, Mail, Smartphone, CheckCircle
} from "lucide-react";
import { getLeads, Lead } from "@/lib/api/leads";
import { getDealById } from "@/lib/api/deals";
import { Deal, getMaxDiscount, getTimeLeft } from "@/lib/dealHelpers";

// --- 1. Main Component Logic ---
function PoolDetailsContent({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [customerlist, setCustomerList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customersLoading, setCustomersLoading] = useState(true);

  // Fetch Deal
  useEffect(() => {
    if (!dealId) return;
    const fetchDealDetails = async () => {
      try {
        setLoading(true);
        const json = await getDealById(dealId);
        if (json.success) setDeal(json.data?.[0] ?? null);
        if (json.success && (!json.data || json.data.length === 0)) setError("Deal not found");
      } catch (err) {
        console.error(err);
        setError("Error loading deal.");
      } finally {
        setLoading(false);
      }
    };
    fetchDealDetails();
  }, [dealId]);

  // Fetch Customers
  useEffect(() => {
    if (!dealId) return;
    const fetchCustomerList = async () => {
      try {
        setCustomersLoading(true);
        const json = await getLeads(dealId);
        if (json.success) setCustomerList(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomerList();
  }, [dealId]);

  // --- Helpers ---
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: '2-digit', minute:'2-digit' });

  // --- Render Loading/Error ---
  if (loading) return <div className="h-96 flex flex-col items-center justify-center text-gray-400"><Loader2 className="animate-spin mb-4 text-blue-600" size={40} /><p>Loading details...</p></div>;
  if (error || !deal) return <div className="max-w-4xl mx-auto mt-10 text-center text-red-600"><p>{error || "Deal not found"}</p><Link href="/my-deals" className="underline mt-4 block">Back</Link></div>;

  const progress = deal.total_qty > 0 ? Math.min((deal.slots_sold / deal.total_qty) * 100, 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl pb-20 px-4 md:px-0">
      
      {/* Back Navigation */}
      <Link href="/my-deals" className="inline-flex items-center text-gray-500 hover:text-blue-600 font-medium text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to My deals
      </Link>

      {/* --- SECTION 1: HEADER & METRICS --- */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 md:space-y-4 flex-1 w-full">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide border ${deal.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {deal.status}
                </span>
                <span className="text-gray-400 text-xs font-mono">#{deal.id}</span>
                <span className="text-gray-400 text-xs">• {deal.category}</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{deal.title}</h1>
              <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">{deal.description}</p>
            </div>
            
            {/* Time Left Box */}
            <div className="w-full md:w-auto bg-blue-50 px-5 py-3 md:px-6 md:py-4 rounded-xl text-center border border-blue-100 flex md:block justify-between items-center">
              <p className="text-blue-600 text-[10px] md:text-xs font-bold uppercase md:mb-1">Time Remaining</p>
              <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-lg md:text-xl">
                <Clock size={18} className="md:w-5 md:h-5" />
                {getTimeLeft(deal.valid_to)}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100">
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Target</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800">{deal.total_qty} <span className="text-xs font-normal text-gray-500">Units</span></p>
            </div>
            <div className="p-3 md:p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-green-700 text-[10px] md:text-xs font-semibold uppercase mb-1">Discount</p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Tag size={16} className="text-green-600 md:w-[18px]" />
                <p className="text-lg md:text-2xl font-bold text-green-700">{getMaxDiscount(deal.tiers)} OFF</p>
              </div>
            </div>
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Token Amt</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800">₹{deal.token_amount.toLocaleString()}</p>
            </div>
            <div className="p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-600 text-[10px] md:text-xs font-semibold uppercase mb-1">Revenue</p>
              <p className="text-lg md:text-2xl font-bold text-blue-700">₹{(deal.slots_sold * deal.token_amount).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: PROGRESS --- */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-5 md:p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-4 md:mb-6">Pool Status</h3>
        
        <div className="relative mb-6 md:mb-8">
          <div className="flex justify-between text-xs md:text-sm font-medium text-gray-600 mb-2">
            <span>{deal.slots_sold} Sold</span>
            <span>Goal: {deal.total_qty}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
            <div className="bg-blue-600 h-3 md:h-4 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full sm:w-auto">
            <Calendar size={14} className="text-gray-400" />
            Started: <span className="font-medium text-gray-900">{formatDate(deal.valid_from)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full sm:w-auto">
            <AlertCircle size={14} className="text-gray-400" />
            Ends: <span className="font-medium text-gray-900">{formatDate(deal.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: CUSTOMER LIST --- */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
             <h3 className="font-bold text-lg text-gray-800">Joined Customers</h3>
             <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{customerlist?.length}</span>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm text-blue-600 bg-white border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            <Download size={16} /> Export CSV
          </button>
        </div>
        
        {/* Content */}
        {customersLoading ? (
            <div className="p-12 flex justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : customerlist?.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <Users size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No customers have joined yet.</p>
            </div>
        ) : (
            <>
              {/* DESKTOP: Table View */}
              <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerlist.map((cust) => (
                        <tr key={cust.payment_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100"><User size={14} /></div>
                                  <div>
                                      <p className="font-medium text-gray-900">{cust.user_name || "Guest User"}</p>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                          {cust.user_email ? <><Mail size={10} /> {cust.user_email}</> : <><Smartphone size={10} /> {cust.user_phone_number}</>}
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-500 text-xs">{cust.order_id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-medium text-gray-800">₹{cust.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDateTime(cust.created_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cust.status === 'succeeded' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                              {cust.status === 'succeeded' && <CheckCircle size={12} />}{cust.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>

              {/* MOBILE: Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {customerlist.map((cust) => (
                  <div key={cust.payment_id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><User size={16} /></div>
                          <div>
                              <p className="font-semibold text-gray-900">{cust.user_name || "Guest User"}</p>
                              <p className="text-xs text-gray-400 font-mono">#{cust.order_id.substring(0, 8)}</p>
                          </div>
                       </div>
                       <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${cust.status === 'succeeded' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                         {cust.status}
                       </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                           <span className="text-gray-400 uppercase text-[10px] font-bold">Amount</span>
                           <span className="font-semibold text-gray-900">₹{cust.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-gray-400 uppercase text-[10px] font-bold">Date</span>
                           <span>{formatDate(cust.created_at)}</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
        )}
      </div>

    </div>
  );
}

// --- 2. Default Export ---
export default function PoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [dealId, setDealId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setDealId(p.id));
  }, [params]);

  if (!dealId) return <div className="h-96 flex flex-col items-center justify-center text-gray-400"><Loader2 className="animate-spin mb-4 text-blue-600" size={40} /><p>Loading details...</p></div>;

  return <PoolDetailsContent dealId={dealId} />;
}
