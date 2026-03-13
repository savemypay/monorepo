"use client";

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- DUMMY DATA ---

const kpiData = [
  { title: "Total GMV", value: "₹4.2 Cr", trend: "+15.2%", isPositive: true, icon: DollarSign },
  { title: "Platform Revenue", value: "₹8.4L", trend: "+12.5%", isPositive: true, icon: TrendingUp },
  { title: "Active Deal Pools", value: "42", trend: "-2.4%", isPositive: false, icon: ShoppingBag },
  { title: "Active Buyers", value: "1,240", trend: "+28.0%", isPositive: true, icon: Users },
];

const revenueTrendData = [
  { month: 'Oct', gmv: 4500000, revenue: 90000 },
  { month: 'Nov', gmv: 5200000, revenue: 104000 },
  { month: 'Dec', gmv: 4800000, revenue: 96000 },
  { month: 'Jan', gmv: 6100000, revenue: 122000 },
  { month: 'Feb', gmv: 5900000, revenue: 118000 },
  { month: 'Mar', gmv: 7500000, revenue: 150000 },
];

const categoryData = [
  { name: 'Automotive', value: 45 },
  { name: 'Real Estate', value: 25 },
  { name: 'Travel', value: 15 },
  { name: 'Gadgets', value: 10 },
  { name: 'Healthcare', value: 5 },
];

const COLORS = ['#163B63', '#F2B705', '#2DD4BF', '#F43F5E', '#A855F7'];

const expiringDeals = [
  { id: "DL-882", product: "Tesla Model Y Fleet", target: 10, joined: 8, endsIn: "12 Hours", status: "Critical" },
  { id: "DL-885", product: "Maldives Group Package", target: 20, joined: 19, endsIn: "24 Hours", status: "Warning" },
  { id: "DL-890", product: "iPhone 15 Pro Max", target: 50, joined: 22, endsIn: "2 Days", status: "At Risk" },
];

export default function AdminOverview() {
  
  // Formatter for currency in charts
  const formatCurrency = (value: number | string | undefined) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);

    if (numericValue >= 10000000) return `₹${(numericValue / 10000000).toFixed(1)}Cr`;
    if (numericValue >= 100000) return `₹${(numericValue / 100000).toFixed(1)}L`;
    return `₹${numericValue.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what is happening across SaveMyPay today.</p>
      </div>

      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.trend}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main GMV/Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">GMV & Revenue Trend</h3>
            <p className="text-sm text-gray-500">Trailing 6 months performance</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number | string | undefined) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="gmv" name="Gross Volume (GMV)" stroke="#163B63" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Platform Revenue" stroke="#F2B705" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900">GMV by Category</h3>
            <p className="text-sm text-gray-500">Current month distribution</p>
          </div>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | string | undefined) => [`${Number(value ?? 0)}%`, 'Share']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend for Pie */}
            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Actionable Tables Row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Expiring Soon (Action Required)</h3>
            <p className="text-sm text-gray-500">Pools closing within 48 hours that haven&apos;t hit target.</p>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            View All Deals
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold tracking-wide border-b border-gray-100">
                <th className="px-6 py-4">Deal ID & Product</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Time Left</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expiringDeals.map((deal, i) => {
                const progressPct = (deal.joined / deal.target) * 100;
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{deal.product}</div>
                      <div className="text-xs text-gray-500">{deal.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${progressPct >= 80 ? 'bg-green-500' : 'bg-orange-500'}`} 
                            style={{ width: `${progressPct}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{deal.joined}/{deal.target}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Clock size={16} className="text-gray-400" />
                        {deal.endsIn}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        deal.status === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                        deal.status === 'Warning' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-[#163B63] hover:underline">
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
