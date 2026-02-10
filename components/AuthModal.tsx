"use client";

import { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, Smartphone, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth'; 
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const setAuth = useAuthStore(state=>state.setAuth)
  
  // State
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'email' | 'phone' | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isLoginModalOpen) {
      setStep('input');
      setInputValue('');
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  // --- VALIDATION ---
  const validateInput = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; 
    if (emailRegex.test(value)) return 'email';
    if (phoneRegex.test(value)) return 'phone';
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setError(null);
    setInputType(validateInput(val));
  };

  // --- HANDLERS ---

  const handleSendOtp = async () => {
    const type = validateInput(inputValue);
    if (!type) {
      setError("Please enter a valid email address or 10-digit phone number.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Call the API function from auth.ts
      await sendLoginOtp({
        email: type === 'email' ? inputValue : undefined,
        phone_number: type === 'phone' ? inputValue : undefined,
      });

      // 2. Success logic
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Call the API function from auth.ts
      const response = await verifyLoginOtp({
        email: inputType === 'email' ? inputValue : undefined,
        phone_number: inputType === 'phone' ? inputValue : undefined,
        code: enteredOtp
      });

      const authData = response.data[0]

      if(authData){
        //Save to Zustand store
        setAuth(authData.access_token,
          authData.refresh_token,
          authData.user
        )
      }
      
      // 2. Success logic (Use response data if needed, e.g., response.token)
      login(inputValue); 
      closeLoginModal();

    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP HELPERS ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && index === 5) handleVerify();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeLoginModal}></div>
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <button onClick={closeLoginModal} className="absolute top-5 right-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors z-10"><X size={20} /></button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <h3 className="font-bold text-gray-900 text-2xl mb-2">{step === 'input' ? 'Welcome Back' : 'Verify Identity'}</h3>
            <p className="text-gray-500 text-sm">
              {step === 'input' ? 'Enter your details to access exclusive deals.' : <span>Enter the 6-digit code sent to <br/><strong className="text-gray-800">{inputValue}</strong></span>}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 'input' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email or Mobile Number</label>
                <div className="relative group">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600">
                    {inputType === 'email' ? <Mail size={20} /> : <Smartphone size={20} />}
                  </div>
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="name@example.com or 9876543210" 
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
              </div>
              <button onClick={handleSendOtp} disabled={isLoading || !inputValue} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input 
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 bg-white border-2 rounded-xl text-center text-2xl font-bold outline-none transition-all focus:scale-105 ${digit ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-gray-200 text-gray-800 focus:border-blue-500'}`}
                  />
                ))}
              </div>
              <button onClick={handleVerify} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </button>
              <button onClick={() => { setStep('input'); setError(null); }} className="w-full text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">Change {inputType === 'email' ? 'email' : 'number'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}