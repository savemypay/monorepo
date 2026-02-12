"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, Smartphone, Store } from 'lucide-react';
import { sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth';
import { useVendorStore } from '@/lib/store/authStore';

export default function VendorLoginPage() {
  const router = useRouter();
  const { setAuth } = useVendorStore();

  // --- State ---
  // Steps: Input -> OTP (Registration removed)
  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Refs for Focus Management ---
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Handlers ---

  // 1. Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendLoginOtp({ phone_number: cleanPhone });
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP & Direct Login
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyLoginOtp({ 
        phone_number: phone, 
        code: enteredOtp 
      });

      const authData = response.data?.[0]; 

      if (!authData || !authData.vendor) {
        throw new Error("Invalid response from server");
      }
      setAuth(authData.access_token, authData.refresh_token, authData.vendor);
      router.push('/'); 

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      otpRefs.current[0]?.focus();
      setOtp(['', '', '', '', '', '']); // Clear OTP on fail
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP Helpers ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && index === 5) handleVerifyOtp();
  };
  
  return(
  <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE: The Form (Mobile: Full Width, Desktop: 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative">
        
        {/* Logo Area */}
        <div className="absolute top-8 left-8 sm:left-12">
           <div className="flex items-center gap-2 text-blue-700 font-bold text-xl">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
               <Store size={18} />
             </div>
             <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900">
            Save<span className="text-blue-600">My</span>Pay
          </span>
           </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          
          {/* Header Transition */}
          <div className="mb-8">
            {step === 'otp' && (
              <button 
                onClick={() => setStep('input')}
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors"
              >
                <ArrowLeft size={16} /> Change number
              </button>
            )}
            
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 'input' ? 'Welcome Back' : 'Verify Account'}
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 'input' 
                ? 'Enter your mobile number to access your vendor dashboard.' 
                : `We sent a 6-digit code to +91 ${phone}`}
            </p>
          </div>

          {/* --- STEP 1: PHONE INPUT --- */}
          {step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Smartphone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="98765 43210"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Continue <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* --- STEP 2: OTP INPUT --- */}
          {step === 'otp' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between gap-2 sm:gap-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                      ${digit 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm' 
                        : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                      }
                    `}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <ShieldCheck size={18} /> Verify & Login
                  </>
                )}
              </button>

              <div className="text-center">
                <button className="text-sm text-gray-500 hover:text-gray-900 font-medium underline-offset-4 hover:underline">
                  Resend code in 0:30
                </button>
              </div>
            </div>
          )}

          {/* Footer Terms */}
          <div className="mt-12 text-center">
             <p className="text-xs text-gray-400">
               By continuing, you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Branding / Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        
        {/* Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20" />

        {/* Content */}
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
             <Store size={32} className="text-blue-300" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Grow your business with the power of Group Buying.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Manage your deals, track earnings, and connect with thousands of local customers in real-time.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-400 border-2 border-slate-800" />
              ))}
            </div>
            <p className="text-sm font-medium text-blue-200">Trusted by 2,000+ Vendors</p>
          </div>
        </div>
      </div>

    </div>
  )
}