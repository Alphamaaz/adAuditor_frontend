"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useLogin, useGoogleAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { email, password },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setError("");
      googleAuth.mutate(tokenResponse.access_token, {
        onError: (err) => setError(getErrorMessage(err)),
      });
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  const isGooglePending = googleAuth.isPending;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#171717]">Welcome back</h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Log in to your Ad Adviser account.
        </p>

        {justReset && (
          <div className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            Password reset successfully. Please log in with your new password.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            {error.toLowerCase().includes("verify your email") && (
              <span>
                {" "}
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="font-medium underline"
                >
                  Verify now
                </Link>
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isGooglePending || login.isPending}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-[#d1cac0] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#faf9f7] disabled:opacity-60"
        >
          <GoogleIcon />
          {isGooglePending ? "Signing in…" : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e5ddd0]" />
          <span className="text-xs text-[#9ca3af]">or</span>
          <div className="h-px flex-1 bg-[#e5ddd0]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#374151]">
                Password
              </label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs font-medium text-[#1f4d3a] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending || isGooglePending}
            className="mt-2 w-full rounded-md bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
          >
            {login.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#1f4d3a] hover:underline"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
