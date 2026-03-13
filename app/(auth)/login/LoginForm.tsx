"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/lib/admin/api";
import { ADMIN_COOKIE, buildAdminProfile, persistAdminAuth } from "@/lib/admin/auth";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedIdentifier = form.identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    if (!trimmedIdentifier || !form.password.trim()) {
      setError("Username or email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const loginData = await adminLogin({
        username: isEmail ? undefined : trimmedIdentifier,
        email: isEmail ? trimmedIdentifier : undefined,
        password: form.password,
      });

      const username = isEmail ? trimmedIdentifier.split("@")[0] : trimmedIdentifier;
      const email = isEmail ? trimmedIdentifier : "";

      persistAdminAuth(
        buildAdminProfile({
          username,
          email,
          role: loginData.role,
        }),
        {
          accessToken: loginData.access_token,
          refreshToken: loginData.refresh_token,
          tokenType: loginData.token_type,
          role: loginData.role,
          userId: loginData.user_id,
          username,
          email,
        }
      );

      document.cookie = `${ADMIN_COOKIE}=1; Path=/; Max-Age=28800; SameSite=Lax`;
      router.replace(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Admin login failed");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 w-full border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" aria-label="Open SaveMyPay home" className="inline-flex items-center">
              <Image src="/logo.svg" alt="SaveMyPay" height={40} width={140} className="h-auto w-[140px]" />
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-3xl border border-line bg-panel p-8 shadow-[0_18px_45px_rgba(24,33,47,0.08)] sm:p-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand">Admin Login</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Sign in to approve deals, manage vendors and customers, monitor payments, and review marketplace risk.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Username or Email</span>
              <input
                value={form.identifier}
                onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
                className="mt-2 h-12 w-full rounded-2xl border border-line bg-white px-4 outline-none focus:border-brand"
                placeholder="admin_smp or admin@smp.com"
                type="text"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Password</span>
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 h-12 w-full rounded-2xl border border-line bg-white px-4 outline-none focus:border-brand"
                placeholder="Enter password"
                type="password"
              />
            </label>

            {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
