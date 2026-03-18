"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { AuthData, sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user, accessToken, isAuthenticated, hasHydrated } = useAuthStore();
  const redirectUrl = searchParams.get('redirect') || '/customer';
  const safeRedirectUrl = redirectUrl === '/login' ? '/customer' : redirectUrl;

  // State
  const [step, setStep] = useState<'input' | 'otp' | 'name'>('input');
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  
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

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated || (user && accessToken)) {
      router.replace(safeRedirectUrl);
    }
  }, [hasHydrated, isAuthenticated, user, accessToken, router, safeRedirectUrl]);

  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;

    const timerId = window.setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [step, resendTimer]);

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


  // Step 1: Send OTP
  const handleSendOtp = async (isResend = false) => {
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
      if (isResend) {
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
      setResendTimer(30);
    } catch (err: unknown) {
      const fallbackMessage = isResend ? "Failed to resend OTP. Please try again." : "Failed to send OTP. Please try again.";
      const message = err instanceof Error ? err.message : fallbackMessage;
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
        if (!authData.is_new_user) {
             // User exists and has flag -> Login immediately
             setAuth(authData.access_token, authData.refresh_token, authData.user);
             router.push(safeRedirectUrl);
        } else {
             // User is new -> Go to Name step
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
      router.push(safeRedirectUrl);

    } catch {
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
      setOtp(['', '', '', '', '', '']); //Clear OTP
      // We keep inputValue so user doesn't have to retype entirely if they just made a typo
    } 
    else if (step === 'name') {
      // If going back from name, we assume they might want to re-verify or change user
      setStep('otp'); 
      //We don't clear OTP here as they might just want to check it
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
      
      // Auto-submit if 6 digits pasted? 
      // Usually better to let user review, or verify if length is 6.
      if (pastedData.length === 6) {
          // You could call handleVerifyOtp() here via timeout or effect, 
          // but manual click is safer for UX.
          otpRefs.current[5]?.focus();
      }
    }
  };

  const currentStep = step === 'input' ? 0 : step === 'otp' ? 1 : 2;
  const stepItems = ['Identity', 'Verification', 'Profile'];

  if (!hasHydrated || isAuthenticated || (user && accessToken)) {
    return (
      <div className="w-full max-w-2xl min-h-[580px] rounded-3xl border border-slate-200 bg-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg overflow-hidden">
      <div className="flex justify-center items-center">
        <section className="w-full p-5 sm:p-7 md:p-8 min-h-[500px] md:min-h-[580px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>

          <div className="mt-5 mb-8">
            <div className="flex items-center gap-2">
              {stepItems.map((item, index) => (
                <div key={item} className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`h-8 w-8 shrink-0 rounded-full border text-xs font-bold flex items-center justify-center ${
                      index <= currentStep
                        ? "border-[#E8F0F8] bg-[#163B63] text-white"
                        : "border-[#7A8CA3] bg-white text-[#7A8CA3]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className={`hidden sm:block text-xs font-medium truncate ${index <= currentStep ? "text-[#163B63]" : "text-slate-400"}`}>
                    {item}
                  </p>
                  {index < stepItems.length - 1 && <div className={`h-px flex-1 ${index < currentStep ? "bg-[#163B63]" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          {step === 'input' && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-150">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#163B63]">Login or Signup</h1>
              <p className="mt-2 text-sm text-[#7A8CA3]">
                We will send an otp to verify
              </p>

              <div className="mt-7">
                <label htmlFor="mobileInput" className="text-sm font-semibold text-[#122E4E]">
                  Mobile number or email
                </label>
                <input
                  ref={inputRef}
                  id="mobileInput"
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="w-full mt-2 rounded-xl border border-[#7A8CA3] px-4 py-3.5 text-[#122E4E] outline-none transition-all focus:border-[#122E4E] focus:ring-2 focus:ring-blue-100"
                  placeholder="name@example.com or 9876543210"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-auto pt-8">
                <button
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#163B63] py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-[#122E4E] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Continue with OTP'}
                </button>
                <p className="mt-4 text-center text-xs text-slate-500">
                  By continuing, you agree to our{" "}
                  <a href="#" className="font-medium text-[#163B63]">Terms</a> and{" "}
                  <a href="#" className="font-medium text-[#163B63]">Privacy Policy</a>.
                </p>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-150">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#163B63]">Verify your account</h1>
              <p className="mt-2 text-sm text-[#7A8CA3]">
                Enter the 6-digit OTP sent to <span className="font-semibold text-[#122E4E]">{inputValue}</span>.
              </p>

              <div className="mt-6 mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="truncate text-sm text-[#7A8CA3] max-w-[210px]">Code sent to {inputValue}</span>
                <button
                  onClick={handleBack}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#163B63] hover:underline"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className={`h-12 sm:h-14 rounded-xl border text-center text-lg sm:text-xl font-bold outline-none transition-all ${
                      digit
                        ? "border-[#163B63] bg-blue-50 text-[#163B63]"
                        : "border-slate-300 text-[#163B63] focus:border-[#163B63] focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                {resendTimer > 0 ? (
                  <p>
                    Didn&apos;t receive the code? Resend available in{" "}
                    <span className="font-semibold text-slate-700">{String(resendTimer).padStart(2, '0')}s</span>.
                  </p>
                ) : (
                  <button
                    onClick={() => handleSendOtp(true)}
                    disabled={isLoading}
                    className="font-semibold text-[#163B63] hover:underline disabled:text-slate-400 disabled:no-underline"
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full mt-auto rounded-xl bg-[#163B63] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#122E4E] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Verify and continue'}
              </button>
            </div>
          )}

          {step === 'name' && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-150">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#163B63]">Set up your profile</h1>
              <p className="mt-2 text-sm text-[#7A8CA3]">
                Add your full name to personalize your account and order updates.
              </p>

              <div className="mt-7 space-y-2">
                <label htmlFor="nameInput" className="text-sm font-semibold text-[#122E4E]">
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="nameInput"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
                  className="w-full mt-2 rounded-xl border border-[#7A8CA3] px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-[#122E4E] focus:ring-2 focus:ring-[#E8F0F8]"
                  placeholder="Your full name"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleFinalSubmit}
                disabled={isLoading || name.trim().length < 2}
                className="w-full mt-auto rounded-xl bg-[#163B63] py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-[#122E4E] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Finish sign in'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
