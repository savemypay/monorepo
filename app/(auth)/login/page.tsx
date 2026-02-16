"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldCheck, Store, ArrowRight } from 'lucide-react';
import { sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth';
import { useVendorStore } from '@/lib/store/authStore';

export default function VendorLoginPage() {
  const router = useRouter();
  const { setAuth } = useVendorStore();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resend Timer State
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // --- Refs ---
  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmail = inputValue.includes('@')

  const inputLabel = isEmail ? "email" : "mobile number"

  // Auto-focus & Timer Logic
  useEffect(() => {
    if (step === 'input') inputRef.current?.focus();
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
      // Start Timer
      setTimer(30);
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // --- Helpers ---
  const validateInput = (value: string) => {
    const cleanValue = value.replace(/\s+/g, '');          // removing leading spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; 
    
    if (emailRegex.test(value)) return { type: 'email', value: value };
    if (phoneRegex.test(cleanValue)) return { type: 'phone', value: cleanValue };
    return null;
  };

  // 1. Send OTP
  const handleSendOtp = async () => {
    const valid = validateInput(inputValue);
    
    if (!valid) {
      setError("Please enter a valid email or 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setOtp(['', '', '', '', '', ''])
    setError(null);

    try {
      await sendLoginOtp({
        email: valid.type === 'email' ? valid.value : undefined,
        phone_number: valid.type === 'phone' ? valid.value : undefined,
      });
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const valid = validateInput(inputValue);
      if (!valid) throw new Error("Invalid input type");

      const response = await verifyLoginOtp({
        email: valid.type === 'email' ? valid.value : undefined,
        phone_number: valid.type === 'phone' ? valid.value : undefined,
        code: enteredOtp
      });

      const authData = response.data?.[0]; 

      if (!authData || !authData.vendor) {
        throw new Error("Invalid response from server");
      }
      
      // Save and Redirect
      setAuth(authData.access_token, authData.refresh_token, authData.vendor);
      router.push('/'); 

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      otpRefs.current[0]?.focus();
      setOtp(['', '', '', '', '', '']); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP Logic ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    // Take only the last char
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Auto-advance
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: move back if empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    // Enter: Submit if valid
    if (e.key === 'Enter') {
        if (index === 5 || otp.every(d => d !== '')) {
            handleVerifyOtp();
        }
    }
  };

  //Handle Paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Focus last filled index
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
      
      // Auto-submit if full
      if (pastedData.length === 6) {
        // You might want to wait a tick or just let user click verify
        handleVerifyOtp(); 
      }
    }
  };
  
  return(
  <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* LEFT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-12">
           <div className="flex items-center gap-2 text-blue-700">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
               <Store size={18} />
             </div>
             <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Save<span className="text-blue-600">My</span>Pay
             </span>
           </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            {step === 'otp' && (
              <button 
                onClick={() => { setStep('input'); setError(null); }}
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors font-medium"
              >
                <ArrowLeft size={16} /> Change {isEmail ? "email": "number"}
              </button>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-3">
              {step === 'input' ? 'Login/signup' : 'Verify Account'}
            </h1>
            <p className="text-gray-500 text-lg">
              {step === 'input' 
                ? 'Enter your email or mobile number to access your dashboard.' 
                : <span>
                    Enter the code sent to your {inputLabel} <br/> 
                    <span className="font-semibold text-gray-800">{inputValue}</span>
                  </span>}
            </p>
          </div>

          {/* --- STEP 1: PHONE INPUT --- */}
          {step === 'input' && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
  
              <div className="relative group mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setError(null); }}
                  className="peer w-full border border-gray-300 rounded-xl px-4 py-4 text-lg text-gray-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all placeholder-transparent bg-gray-50 focus:bg-white"
                  placeholder="Mobile Number"
                  id="mobileInput"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
                <label 
                  htmlFor="mobileInput"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all 
                             peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white font-medium pointer-events-none"
                >
                  Mobile Number or Email
                </label>
              </div>
  
              {error && (
                  <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
              )}
  
              <button 
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                        Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>

              <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
                  By continuing, you agree to our <a href="#" className="text-gray-600 hover:underline">Terms of Service</a> & <a href="#" className="text-gray-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}

          {/* --- STEP 2: OTP INPUT --- */}
          {step === 'otp' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                      ${digit 
                        ? 'border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm' 
                        : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50'
                      }
                    `}
                  />
                ))}
              </div>

              {error && (
                  <div className="text-center p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
              )}

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <ShieldCheck size={20} /> Verify & Login
                  </>
                )}
              </button>

              <div className="text-center">
                <button 
                    disabled={!canResend || isLoading}
                    onClick={canResend ? handleSendOtp : undefined}
                    className={`text-sm font-medium transition-colors ${
                        canResend 
                        ? 'text-blue-600 hover:underline cursor-pointer' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {canResend ? "Resend Verification Code" : `Resend code in 0:${timer.toString().padStart(2, '0')}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20" />

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
             <Store size={32} className="text-blue-300" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Grow your business with the power of Group Buying.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Manage your deals, track earnings, and connect with thousands of local customers in real-time.
          </p>

          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-400 border-2 border-slate-800" />
              ))}
            </div>
            <p className="text-sm font-medium text-blue-200">Trusted by 2,000+ Vendors</p>
          </div>
        </div>
      </div>

    </div>
  )
}