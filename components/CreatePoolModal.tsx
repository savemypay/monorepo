"use client";

import { XCircle } from 'lucide-react';

interface CreatePoolModalProps {
  onClose: () => void;
}

export default function CreatePoolModal({ onClose }: CreatePoolModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Create Group Deal</h3>
            <p className="text-xs text-gray-500">Define your bulk offer parameters</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service Name</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2024 Model Y Standard Range" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="50000" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                  <option>Automotive</option>
                  <option>Real Estate</option>
                  <option>Insurance</option>
                </select>
             </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Pool Constraints</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min. Buyers</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (Days)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="7" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-blue-900">Your Discount Offer (%)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-blue-500" placeholder="20" />
              <span className="font-bold text-gray-600">%</span>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-xs text-blue-800">
               {/* <span>Customer Gets: <strong>15% OFF</strong></span>
               <span>Platform Fee: <strong>5%</strong></span> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">Launch Pool</button>
        </div>
      </div>
    </div>
  );
}