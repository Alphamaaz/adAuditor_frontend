"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useVerifyEmail, useResendOtp } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const verify = useVerifyEmail();
  const resend = useResendOtp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verify.mutate(
      { email, otp },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const handleResend = () => {
    setError("");
    setResendMessage("");
    resend.mutate(
      { email },
      {
        onSuccess: (data) => setResendMessage(data.message),
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm">
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f7f4]">
          <svg
            className="h-6 w-6 text-[#1f4d3a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-[#171717]">
          Verify your email
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-[#374151]">
            {email || "your email"}
          </span>
          . Enter it below to activate your account.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!emailFromQuery && (
            <div>
              <label className="block text-sm font-medium text-[#374151]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              required
              maxLength={6}
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-center text-2xl font-semibold tracking-[0.5em] text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <button
            type="submit"
            disabled={verify.isPending || otp.length < 6}
            className="mt-2 w-full rounded-md bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
          >
            {verify.isPending ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resend.isPending || !email}
            className="font-medium text-[#1f4d3a] hover:underline disabled:opacity-50"
          >
            {resend.isPending ? "Sending…" : "Resend code"}
          </button>
          <Link href="/login" className="text-[#6b7280] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
