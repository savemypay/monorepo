"use client";

import { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  dealTitle: string;
}

export default function PaymentModal({ isOpen, onClose, amount, dealTitle }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  // Success State
  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-500 mb-6">You have successfully joined the pool for <br/><strong>{dealTitle}</strong>.</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800"
          >
            View My Pass
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Confirm Token Payment</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Lock size={12} /> Secure 256-bit SSL Encrypted
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Amount Display */}
          <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
            <span className="text-sm font-medium text-blue-800">Token Amount</span>
            <span className="text-2xl font-bold text-blue-700">{amount}</span>
          </div>

          {/* Fake Card Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
              <div className="relative flex items-center gap-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono">
                <CreditCard className="text-gray-400 " size={20} />
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  className=""
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                <input type="text" placeholder="123" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center" />
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex justify-center items-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : `Pay ${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
}