// "use client";

// import Link from "next/link";
// import { 
//   ArrowLeft, 
//   Clock, 
//   Users, 
//   Tag, 
//   CheckCircle, 
//   Calendar, 
//   AlertCircle 
// } from "lucide-react";

// // Mock Data for a single pool (In real app, fetch using params.id)
// const poolData = {
//   id: "1",
//   name: "2024 SUV Model X Batch",
//   description: "Exclusive bulk deal for the new Model X. Includes 3-year free service warranty and premium interior package. Valid only for verified buyers.",
//   status: "Active",
//   target: 10,
//   current: 7,
//   discount: "15%",
//   vendorOffer: "20%",
//   price: "$45,000",
//   originalPrice: "$52,000",
//   endsIn: "2 Days 5 Hours",
//   startDate: "Oct 20, 2024",
//   endDate: "Oct 27, 2024",
//   customers: [
//     { id: "TKN-101", name: "Rahul Sharma", phone: "+91 98765 43210", date: "Oct 21, 2024", status: "Verified" },
//     { id: "TKN-102", name: "Priya Patel", phone: "+91 98765 12345", date: "Oct 22, 2024", status: "Pending" },
//     { id: "TKN-103", name: "Amit Singh", phone: "+91 98765 67890", date: "Oct 22, 2024", status: "Pending" },
//     { id: "TKN-104", name: "Sneha Gupta", phone: "+91 98765 11223", date: "Oct 23, 2024", status: "Verified" },
//     { id: "TKN-105", name: "Vikram Malhotra", phone: "+91 98765 99887", date: "Oct 23, 2024", status: "Pending" },
//     { id: "TKN-106", name: "Anjali Rao", phone: "+91 98765 44556", date: "Oct 24, 2024", status: "Pending" },
//     { id: "TKN-107", name: "Rohit Verma", phone: "+91 98765 77665", date: "Oct 24, 2024", status: "Verified" },
//   ]
// };

// export default function PoolDetailsPage({ params }: { params: { id: string } }) {
//   // Calculate progress percentage
//   const progress = (poolData.current / poolData.target) * 100;

//   return (
//     <div className="space-y-8 max-w-6xl mx-auto">
      
//       {/* Back Navigation */}
//       <Link 
//         href="/my-deals" 
//         className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
//       >
//         <ArrowLeft size={16} className="mr-2" /> Back to My Pools
//       </Link>

//       {/* Header Section */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
//         <div className="flex flex-col md:flex-row justify-between items-start gap-6">
//           <div className="space-y-2">
//             <div className="flex items-center gap-3">
//               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
//                 {poolData.status}
//               </span>
//               <span className="text-gray-400 text-xs font-mono">ID: #{poolData.id}</span>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">{poolData.name}</h1>
//             <p className="text-gray-500 max-w-2xl">{poolData.description}</p>
//           </div>
          
//           <div className="bg-blue-50 px-6 py-4 rounded-xl text-center min-w-[150px]">
//             <p className="text-blue-600 text-xs font-bold uppercase mb-1">Time Remaining</p>
//             <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xl">
//               <Clock size={20} />
//               {poolData.endsIn}
//             </div>
//           </div>
//         </div>

//         {/* Key Metrics Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
//           <div>
//             <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Target Volume</p>
//             <p className="text-2xl font-bold text-gray-800">{poolData.target} Units</p>
//           </div>
//           <div>
//             <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Customer Discount</p>
//             <div className="flex items-center gap-2">
//               <Tag size={18} className="text-green-600" />
//               <p className="text-2xl font-bold text-green-600">{poolData.discount} OFF</p>
//             </div>
//           </div>
//           <div>
//             <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Deal Price</p>
//             <p className="text-2xl font-bold text-gray-800">{poolData.price} <span className="text-sm text-gray-400 line-through font-normal">{poolData.originalPrice}</span></p>
//           </div>
//           <div>
//             <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Potential Revenue</p>
//             <p className="text-2xl font-bold text-blue-600">$315,000</p>
//           </div>
//         </div>
//       </div>

//       {/* Progress Section */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
//         <h3 className="font-bold text-lg text-gray-800 mb-6">Pool Status</h3>
        
//         <div className="relative mb-8">
//           <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
//             <span>{poolData.current} Customers Joined</span>
//             <span>Goal: {poolData.target}</span>
//           </div>
//           <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
//             <div 
//               className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
//               style={{ width: `${progress}%` }}
//             >
//             </div>
//           </div>
//           {/* Milestone Markers */}
//           <div className="absolute top-8 left-0 text-xs text-gray-400">0</div>
//           <div className="absolute top-8 right-0 text-xs text-gray-400">{poolData.target}</div>
//         </div>

//         <div className="flex gap-6 text-sm">
//           <div className="flex items-center gap-2 text-gray-600">
//             <Calendar size={16} />
//             Started: <span className="font-medium text-gray-900">{poolData.startDate}</span>
//           </div>
//           <div className="flex items-center gap-2 text-gray-600">
//             <AlertCircle size={16} />
//             Ends: <span className="font-medium text-gray-900">{poolData.endDate}</span>
//           </div>
//         </div>
//       </div>

//       {/* Customer List Table */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
//           <h3 className="font-bold text-lg text-gray-800">Joined Customers ({poolData.customers.length})</h3>
//           <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Download CSV</button>
//         </div>
        
//         <table className="w-full text-left text-sm">
//           <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
//             <tr>
//               <th className="px-6 py-4">Customer Name</th>
//               <th className="px-6 py-4">Token ID</th>
//               <th className="px-6 py-4">Date Joined</th>
//               <th className="px-6 py-4">Phone</th>
//               <th className="px-6 py-4">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {poolData.customers.map((customer) => (
//               <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
//                     {customer.name.charAt(0)}
//                   </div>
//                   {customer.name}
//                 </td>
//                 <td className="px-6 py-4 font-mono text-gray-500">{customer.id}</td>
//                 <td className="px-6 py-4 text-gray-600">{customer.date}</td>
//                 <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
//                 <td className="px-6 py-4">
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
//                     customer.status === 'Verified' 
//                       ? 'bg-green-50 text-green-700 border-green-100' 
//                       : 'bg-yellow-50 text-yellow-700 border-yellow-100'
//                   }`}>
//                     {customer.status === 'Verified' && <CheckCircle size={12} />}
//                     {customer.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }

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
  CheckCircle,
  Users
} from "lucide-react";
import { useVendorStore } from "@/lib/store/authStore";
import { Deal, getMaxDiscount, getTimeLeft } from "@/lib/dealHelpers"; // Ensure this path is correct

export default function PoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Auth Store
  const vendorId = useVendorStore(state => state.vendor?.id);
  const accessToken = useVendorStore(state => state.accessToken);

  // State
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId || !accessToken) return;

    const fetchDealDetails = async () => {
      try {
        setLoading(true);
        // 1. Fetch ALL deals (since we don't have a single deal API)
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
          // 2. Client-side Filter: Find the specific deal by ID
          // Note: Ensure types match (string vs number)
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
              {deal.original_price > 0 && (
                 <span className="text-sm text-gray-400 line-through font-normal ml-2">
                   ₹{deal.original_price.toLocaleString()}
                 </span>
              )}
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
              {/* Optional: Shine effect */}
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

      {/* Customer List (Mocked/Empty State) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Joined Customers</h3>
          {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50" disabled>
            Download CSV
          </button> */}
        </div>
        
        <div className="p-12 text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Customer Data Not Available</h3>
          <p className="text-sm max-w-xs mx-auto">
            Please check back later.
          </p>
        </div>
      </div>

    </div>
  );
}