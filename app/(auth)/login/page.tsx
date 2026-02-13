"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit2, Loader2} from 'lucide-react';
import { AuthData, useAuthStore } from '@/lib/store/authStore';
import { sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth';
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const redirectUrl = searchParams.get('redirect') || '/customer';

  // State
  const [step, setStep] = useState<'input' | 'otp' | 'name'>('input');
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Temporary storage for auth token before name is entered
  const [tempAuthData, setTempAuthData] = useState<AuthData | null>(null);

  // Focus Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus logic
  useEffect(() => {
    if (step === 'input') inputRef.current?.focus();
    if (step === 'otp') otpRefs.current[0]?.focus();
    if (step === 'name') nameRef.current?.focus();
  }, [step]);

  // --- Validation ---
  const validateInput = (value: string) => {
    // Sanitize spaces for phone check
    const cleanValue = value.replace(/\s+/g, ''); 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Allow 10 digits
    const phoneRegex = /^[0-9]{10}$/; 
    
    if (emailRegex.test(value)) return { type: 'email', value: value };
    if (phoneRegex.test(cleanValue)) return { type: 'phone', value: cleanValue };
    return null;
  };

  // --- Handlers ---

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    const valid = validateInput(inputValue);
    
    if (!valid) {
      setError("Please enter a valid email or 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendLoginOtp({
        email: valid.type === 'email' ? valid.value : undefined,
        phone_number: valid.type === 'phone' ? valid.value : undefined,
      });
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message :"Failed to send OTP. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
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

      if (authData) {
        setTempAuthData(authData);
        // Test Case: Check if user already has a name from backend
        if (authData.user.name && authData.user.name.length > 1) {
             // User exists and has name -> Login immediately
             setAuth(authData.access_token, authData.refresh_token, authData.user);
             router.push(redirectUrl);
        } else {
             // User is new or missing name -> Go to Name step
             setStep('name');
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      // UX Decision: Don't clear OTP immediately on error, let user correct it.
      // But focus the first box for easy overwrite if they want
      otpRefs.current[0]?.focus(); 
      otpRefs.current[0]?.select(); // Select text so typing replaces it
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Final Submit
  const handleFinalSubmit = async () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Please enter your full name (minimum 2 chars)");
      return;
    }

    if (!tempAuthData) {
      setError("Session expired. Please restart.");
      setStep('input');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create final user object
      const finalUser = { ...tempAuthData.user, name: cleanName };
      
      // Save to global store
      setAuth(
        tempAuthData.access_token,
        tempAuthData.refresh_token,
        finalUser
      );

      // Redirect
      router.push(redirectUrl);

    } catch (err) {
      setError("Failed to complete login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP Specific Interactions (Senior Dev Touch) ---

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    // Take only the last character entered to allow easier corrections
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError(null); // Clear error on typing
    
    // Auto-advance focus
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // If current box is empty, move back and delete previous
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && index === 5) handleVerifyOtp();
  };

  const handleBack = () => {
    setError(null); // Always clear errors on navigation

    if (step === 'input') {
      router.back();
    } 
    else if (step === 'otp') {
      setStep('input');
      setOtp(['', '', '', '', '', '']); // Requirement: Clear OTP
      // We keep inputValue so user doesn't have to retype entirely if they just made a typo
    } 
    else if (step === 'name') {
      // If going back from name, we assume they might want to re-verify or change user
      setStep('otp'); 
      // Note: We don't clear OTP here as they might just want to check it
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Focus the box after the last pasted digit
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
      
      // Optional: Auto-submit if 6 digits pasted? 
      // Usually better to let user review, or verify if length is 6.
      if (pastedData.length === 6) {
          // You could call handleVerifyOtp() here via timeout or effect, 
          // but manual click is safer for UX.
          otpRefs.current[5]?.focus();
      }
    }
  };

  return (
      <div className="bg-white w-full max-w-md md:rounded-3xl md:shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        
        {/* Header Back Button */}
        <div className="p-6">
          <button 
            onClick={handleBack}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full -ml-2 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
  
        <div className="px-8 pb-10 flex-1 flex flex-col">
          
          {/* --- STEP 1: INPUT --- */}
          {step === 'input' && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Login or signup</h1>
              <p className="text-gray-500 text-sm mb-10">We will send an OTP to verify</p>
  
              {/* Floating Label Input */}
              <div className="relative group mb-8">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                     setInputValue(e.target.value);
                     setError(null);
                  }}
                  className="peer w-full border border-gray-300 rounded-lg px-4 py-3.5 text-gray-900 outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-transparent"
                  placeholder="Mobile Number"
                  id="mobileInput"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
                <label 
                  htmlFor="mobileInput"
                  className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all 
                             peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 font-medium pointer-events-none"
                >
                  Enter mobile number or email
                </label>
              </div>
  
              {error && (
                  <div className="mb-4 -mt-4 p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
              )}
  
              {/* Social Login / Divider */}
              <div className="mt-2 space-y-6">
                   <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                  </div>
  
                  <button className="w-full flex items-center justify-center gap-3 border border-gray-200 p-3 rounded-full hover:bg-gray-50 transition-all">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <FcGoogle size={24} />
                      </div>
                      <span className="font-semibold text-gray-700">Continue with Google</span>
                  </button>
              </div>
  
              {/* Footer */}
              <div className="mt-auto space-y-6">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By continuing, you agree to SaveMyPay&apos;s <a href="#" className="text-blue-600 font-semibold">terms & conditions</a> and <a href="#" className="text-blue-600 font-semibold">privacy policy</a>
                </p>
                <button 
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full bg-[#0037C5] hover:bg-[#002b99] text-white py-3.5 rounded-lg font-bold text-lg shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
                </button>
              </div>
            </div>
          )}
  
          {/* --- STEP 2: OTP --- */}
          {step === 'otp' && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Enter OTP</h1>
              <div className="flex items-center justify-between mb-10 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                 <span className="truncate max-w-[150px]">Sent to {inputValue}</span>
                 <button 
                  onClick={handleBack} 
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1 shrink-0"
                 >
                    <Edit2 size={14} /> Edit Number
                 </button>
              </div>
  
              <div className="flex justify-between gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" 
                    maxLength={1} 
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste} // Added Paste Support
                    className={`w-12 h-12 sm:w-14 sm:h-14 border rounded-lg text-center text-xl font-bold outline-none transition-all
                      ${digit ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-800 focus:border-blue-600'}
                    `}
                  />
                ))}
              </div>
  
              <div className="flex justify-between items-center mb-8">
                 <button className="text-xs text-gray-500 font-medium hover:text-gray-800 transition-colors">
                   Haven&apos;t received the OTP? Resend in 12s
                 </button>
              </div>
  
              {error && (
                  <div className="mb-4 text-center p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
              )}
  
              <button 
                 onClick={handleVerifyOtp}
                 disabled={isLoading || otp.some(d => !d)}
                 className="w-full bg-[#0037C5] hover:bg-[#002b99] disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-lg font-bold text-lg shadow-blue-200 transition-all flex items-center justify-center mt-auto"
              >
                 {isLoading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
              </button>
            </div>
          )}
  
          {/* --- STEP 3: NAME --- */}
          {step === 'name' && (
             <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
               <h1 className="text-3xl font-extrabold text-slate-900 mb-2">What&apos;s your name?</h1>
               <p className="text-gray-500 text-sm mb-10">Help us personalize your experience</p>
  
               <div className="relative group mb-8">
                 <input
                   ref={nameRef}
                   type="text"
                   value={name}
                   onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                   }}
                   className="peer w-full border border-gray-300 rounded-lg px-4 py-3.5 text-gray-900 outline-none focus:border-blue-600 transition-colors bg-transparent placeholder-transparent"
                   placeholder="Full Name"
                   id="nameInput"
                   onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
                 />
                 <label 
                   htmlFor="nameInput"
                   className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all 
                              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                              peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600 font-medium pointer-events-none"
                 >
                   Full Name
                 </label>
               </div>
  
               {error && (
                  <div className="mb-4 -mt-4 p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
               )}
  
               <div className="mt-auto">
                 <button 
                   onClick={handleFinalSubmit}
                   disabled={isLoading || name.trim().length < 2}
                   className="w-full bg-[#0037C5] hover:bg-[#002b99] text-white py-3.5 rounded-lg font-bold text-lg shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex items-center justify-center"
                 >
                   {isLoading ? <Loader2 className="animate-spin" /> : "Finish & Login"}
                 </button>
               </div>
             </div>
          )}
  
        </div>
      </div>
  );
}