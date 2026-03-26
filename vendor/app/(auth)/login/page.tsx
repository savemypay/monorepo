"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
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
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');

  const inputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmail = inputValue.includes('@');
  const inputLabel = isEmail ? 'email' : 'mobile number';

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect && redirect.startsWith('/')) {
      setRedirectPath(redirect);
    }

    const expired = sessionStorage.getItem('vendor-session-expired');
    if (expired) {
      setSessionNotice('Your session expired. Please login again.');
      sessionStorage.removeItem('vendor-session-expired');
    }
  }, []);

  useEffect(() => {
    if (step === 'input') inputRef.current?.focus();
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
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

  const validateInput = (value: string) => {
    const cleanValue = value.replace(/\s+/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (emailRegex.test(value)) return { type: 'email', value } as const;
    if (phoneRegex.test(cleanValue)) return { type: 'phone', value: cleanValue } as const;
    return null;
  };

  const handleSendOtp = async () => {
    const valid = validateInput(inputValue);

    if (!valid) {
      setError('Please enter a valid email or 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setSessionNotice(null);

    try {
      await sendLoginOtp({
        email: valid.type === 'email' ? valid.value : undefined,
        phone_number: valid.type === 'phone' ? valid.value : undefined,
      });
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSessionNotice(null);

    try {
      const valid = validateInput(inputValue);
      if (!valid) throw new Error('Invalid input type');

      const response = await verifyLoginOtp({
        email: valid.type === 'email' ? valid.value : undefined,
        phone_number: valid.type === 'phone' ? valid.value : undefined,
        code: enteredOtp,
      });

      const authData = response.data?.[0];

      if (!authData || !authData.vendor) {
        throw new Error('Invalid response from server');
      }

      setAuth(authData.access_token, authData.refresh_token, authData.vendor);
      document.cookie = 'vendor_authenticated=1; Path=/; Max-Age=2592000; SameSite=Lax';
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
      otpRefs.current[0]?.focus();
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (e.key === 'Enter') {
      if (index === 5 || otp.every((digit) => digit !== '')) {
        handleVerifyOtp();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();

      if (pastedData.length === 6) {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="relative m-4 flex overflow-hidden rounded-2xl bg-white text-slate-900 shadow-sm">
      <div className="relative flex w-full flex-col justify-center p-8 sm:p-12 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            {step === 'otp' && (
              <button
                onClick={() => {
                  setStep('input');
                  setError(null);
                }}
                className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-[#1E2F46]"
              >
                <ArrowLeft size={16} /> Change {isEmail ? 'email' : 'number'}
              </button>
            )}

            <h1 className="mb-3 text-2xl font-medium text-[#163B63] sm:text-3xl">
              {step === 'input' ? 'Login / Signup' : 'Verify Account'}
            </h1>

            <p className="text-sm text-[#7A8CA3] sm:text-base">
              {step === 'input' ? (
                'Enter your email or mobile number to receive a one-time passcode and access the dashboard.'
              ) : (
                <span>
                  Enter the code sent to your {inputLabel} <br />
                  <span className="font-medium text-[#122E4E]">{inputValue}</span>
                </span>
              )}
            </p>
          </div>

          {step === 'input' && (
            <div className="animate-in slide-in-from-right-4 fade-in flex-1 flex-col duration-300">
              <div className="group relative mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                    setSessionNotice(null);
                  }}
                  className="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-lg text-gray-900 outline-none transition-all placeholder-transparent focus:border-[#122E4E] focus:bg-white focus:ring-4 focus:ring-[#E8F0F8]"
                  placeholder="Mobile Number"
                  id="mobileInput"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
                <label
                  htmlFor="mobileInput"
                  className="pointer-events-none absolute left-4 -top-2.5 bg-white px-1 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-xs peer-focus:text-[#122E4E]"
                >
                  Mobile Number or Email
                </label>
              </div>

              {sessionNotice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <p className="text-sm font-medium text-amber-700">{sessionNotice}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#163B63] py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0C111A] hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                By continuing, you agree to our <a href="#" className="text-gray-600 hover:underline">Terms of Service</a> & <a href="#" className="text-gray-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-in slide-in-from-right-4 fade-in space-y-8 duration-500">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className={`h-10 w-10 rounded-lg border-2 text-center text-xl font-semibold outline-none transition-all sm:h-16 sm:w-14 md:rounded-xl md:text-2xl ${
                      digit
                        ? 'border-[#122E4E] bg-blue-50/30 text-[#122E4E] shadow-sm'
                        : 'border-gray-200 bg-white focus:border-[#122E4E] focus:ring-4 focus:ring-blue-50'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="rounded border border-red-100 bg-red-50 p-2 text-center">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#122E4E] py-4 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0C111A]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
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
                    canResend ? 'text-[#122E4E] hover:underline cursor-pointer' : 'cursor-not-allowed text-gray-400'
                  }`}
                >
                  {canResend ? 'Resend Verification Code' : `Resend code in 0:${timer.toString().padStart(2, '0')}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
