"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function AuditConnectPage() {
  const params = useParams<{ auditId: string }>();

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            AdAuditor Pro
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-lg border border-[#e5ddd0] bg-white p-6">
          <p className="text-sm font-medium text-[#6b7280]">
            Audit ID: {params.auditId}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#171717]">
            Connect ad account
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Connect your Meta Advertising account to start the automated audit. 
            We will analyze your campaigns, creatives, and performance data.
          </p>

          <div className="mt-10 grid gap-4">
            <button
              onClick={() => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                window.location.href = `${apiBase}/api/platform-connections/meta/connect?auditId=${params.auditId}`;
              }}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Connect with Meta
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5ddd0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-[#9ca3af]">Coming Soon</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button disabled className="flex items-center justify-center gap-2 rounded-lg border border-[#e5ddd0] bg-gray-50 px-4 py-3 text-sm font-semibold text-[#9ca3af] opacity-60">
                Google Ads
              </button>
              <button disabled className="flex items-center justify-center gap-2 rounded-lg border border-[#e5ddd0] bg-gray-50 px-4 py-3 text-sm font-semibold text-[#9ca3af] opacity-60">
                TikTok Ads
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
