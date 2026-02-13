"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Download, Check, Loader2, AlertCircle } from 'lucide-react';
import { getLeads, Lead } from '@/lib/api/leads';

function LeadsContent() {
  const searchParams = useSearchParams();
  const adIdFromUrl = searchParams.get('ad_id'); // Get ?ad_id=123 from URL if present

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pass ad_id if it exists in URL, otherwise fetches all
        const response = await getLeads(adIdFromUrl || 2);
        
        if (response.success) {
          setLeads(response.data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adIdFromUrl]);

  // --- Helpers ---
  const getStatusStyle = (status: string) => {
    // Map your API status strings to colors
    switch (status.toLowerCase()) {
      case 'success':
      case 'purchased': return 'bg-green-100 text-green-700';
      case 'verified': return 'bg-blue-50 text-blue-700';
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Client-side Filter by Token ID or Name
  const filteredLeads = leads.filter(lead => 
    String(lead.payment_id).includes(searchTerm) || 
    lead.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Leads</h1>
          <p className="text-sm text-gray-500">
            {adIdFromUrl ? `Showing leads for Deal #${adIdFromUrl}` : "Manage all customer tokens here."}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-900 shrink-0">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Token ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Deal Interest</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.payment_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-blue-600">
                        #{lead.payment_id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {lead.user_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {/* Fallback if ad title is missing */}
                        {lead.ad?.title || "Deal #" + (lead.deal_ref || "N/A")}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {lead.user_phone_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 capitalize ${getStatusStyle(lead.status)}`}>
                          {lead.status.toLowerCase() === 'success' && <Check size={12} />}
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Only show verify button if status is 'pending' (example logic) */}
                        {lead.status.toLowerCase() === 'pending' && (
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense because we use useSearchParams
export default function LeadsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}