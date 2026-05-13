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
                window.location.href = `${apiBase}/api/platform-connections/tiktok/connect?auditId=${params.auditId}`;
              }}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#000000] px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1 .01 2.62.02 5.24.02 7.86 0 2.45-1.02 4.96-2.9 6.55-1.59 1.34-3.77 1.95-5.86 1.83-2.31-.13-4.59-1.41-5.78-3.41-1.39-2.35-1.35-5.54.4-7.7 1.14-1.41 2.92-2.36 4.74-2.43V12.3c-1 .07-2.01.53-2.67 1.3-.87 1.03-.94 2.58-.33 3.75.5 1 1.6 1.74 2.74 1.81 1.2.06 2.45-.4 3.19-1.36.63-.82.72-1.92.71-2.91-.01-2.92-.02-5.84-.03-8.76v-.12c-.01-1.33-.02-2.65-.03-3.98l.13-.02z" />
              </svg>
              Connect with TikTok
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5ddd0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-[#9ca3af]">More platforms coming soon</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button disabled className="flex items-center justify-center gap-2 rounded-lg border border-[#e5ddd0] bg-gray-50 px-4 py-3 text-sm font-semibold text-[#9ca3af] opacity-60">
                Google Ads (Waitlist)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
