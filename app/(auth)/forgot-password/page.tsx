"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForgotPassword } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [error, setError] = useState("");

  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    forgotPassword.mutate(
      { email },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#171717]">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Enter your email and we&apos;ll send you a 6-digit reset code.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <button
            type="submit"
            disabled={forgotPassword.isPending}
            className="mt-2 w-full rounded-md bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
          >
            {forgotPassword.isPending ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1f4d3a] hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
