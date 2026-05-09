"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignup } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [error, setError] = useState("");

  const signup = useSignup();

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signup.mutate(
      {
        name: form.name || undefined,
        email: form.email,
        password: form.password,
        organizationName: form.organizationName || undefined,
      },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#171717]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Start auditing your ad accounts in minutes.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Jane Smith"
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Work email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              required
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">
              Organization name
            </label>
            <input
              type="text"
              value={form.organizationName}
              onChange={set("organizationName")}
              placeholder="My Agency"
              className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
          </div>

          <button
            type="submit"
            disabled={signup.isPending}
            className="mt-2 w-full rounded-md bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
          >
            {signup.isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1f4d3a] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
