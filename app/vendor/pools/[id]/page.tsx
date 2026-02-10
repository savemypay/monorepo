"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Tag, 
  CheckCircle, 
  Calendar, 
  AlertCircle 
} from "lucide-react";

// Mock Data for a single pool (In real app, fetch using params.id)
const poolData = {
  id: "1",
  name: "2024 SUV Model X Batch",
  description: "Exclusive bulk deal for the new Model X. Includes 3-year free service warranty and premium interior package. Valid only for verified buyers.",
  status: "Active",
  target: 10,
  current: 7,
  discount: "15%",
  vendorOffer: "20%",
  price: "$45,000",
  originalPrice: "$52,000",
  endsIn: "2 Days 5 Hours",
  startDate: "Oct 20, 2024",
  endDate: "Oct 27, 2024",
  customers: [
    { id: "TKN-101", name: "Rahul Sharma", phone: "+91 98765 43210", date: "Oct 21, 2024", status: "Verified" },
    { id: "TKN-102", name: "Priya Patel", phone: "+91 98765 12345", date: "Oct 22, 2024", status: "Pending" },
    { id: "TKN-103", name: "Amit Singh", phone: "+91 98765 67890", date: "Oct 22, 2024", status: "Pending" },
    { id: "TKN-104", name: "Sneha Gupta", phone: "+91 98765 11223", date: "Oct 23, 2024", status: "Verified" },
    { id: "TKN-105", name: "Vikram Malhotra", phone: "+91 98765 99887", date: "Oct 23, 2024", status: "Pending" },
    { id: "TKN-106", name: "Anjali Rao", phone: "+91 98765 44556", date: "Oct 24, 2024", status: "Pending" },
    { id: "TKN-107", name: "Rohit Verma", phone: "+91 98765 77665", date: "Oct 24, 2024", status: "Verified" },
  ]
};

export default function PoolDetailsPage({ params }: { params: { id: string } }) {
  // Calculate progress percentage
  const progress = (poolData.current / poolData.target) * 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Back Navigation */}
      <Link 
        href="/vendor/pools" 
        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to My Pools
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {poolData.status}
              </span>
              <span className="text-gray-400 text-xs font-mono">ID: #{poolData.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{poolData.name}</h1>
            <p className="text-gray-500 max-w-2xl">{poolData.description}</p>
          </div>
          
          <div className="bg-blue-50 px-6 py-4 rounded-xl text-center min-w-[150px]">
            <p className="text-blue-600 text-xs font-bold uppercase mb-1">Time Remaining</p>
            <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xl">
              <Clock size={20} />
              {poolData.endsIn}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Target Volume</p>
            <p className="text-2xl font-bold text-gray-800">{poolData.target} Units</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Customer Discount</p>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-green-600" />
              <p className="text-2xl font-bold text-green-600">{poolData.discount} OFF</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Deal Price</p>
            <p className="text-2xl font-bold text-gray-800">{poolData.price} <span className="text-sm text-gray-400 line-through font-normal">{poolData.originalPrice}</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Potential Revenue</p>
            <p className="text-2xl font-bold text-blue-600">$315,000</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Pool Status</h3>
        
        <div className="relative mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>{poolData.current} Customers Joined</span>
            <span>Goal: {poolData.target}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
          {/* Milestone Markers */}
          <div className="absolute top-8 left-0 text-xs text-gray-400">0</div>
          <div className="absolute top-8 right-0 text-xs text-gray-400">{poolData.target}</div>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            Started: <span className="font-medium text-gray-900">{poolData.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle size={16} />
            Ends: <span className="font-medium text-gray-900">{poolData.endDate}</span>
          </div>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Joined Customers ({poolData.customers.length})</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Download CSV</button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Token ID</th>
              <th className="px-6 py-4">Date Joined</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {poolData.customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {customer.name.charAt(0)}
                  </div>
                  {customer.name}
                </td>
                <td className="px-6 py-4 font-mono text-gray-500">{customer.id}</td>
                <td className="px-6 py-4 text-gray-600">{customer.date}</td>
                <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    customer.status === 'Verified' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                    {customer.status === 'Verified' && <CheckCircle size={12} />}
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}