"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAudit } from "@/hooks/use-audits";

export default function AuditConnectPage() {
  const params = useParams<{ auditId: string }>();
  const { data: audit, isLoading } = useAudit(params.auditId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="text-sm text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  if (!audit) return null;

  const platforms = audit.selectedPlatforms || [];
  const hasMeta = platforms.includes("META");
  const hasTikTok = platforms.includes("TIKTOK");
  const hasGoogle = platforms.includes("GOOGLE");

  // Determine platform name for the description text
  let platformName = "your Advertising";
  if (hasMeta && !hasTikTok && !hasGoogle) platformName = "your Meta Advertising";
  if (!hasMeta && hasTikTok && !hasGoogle) platformName = "your TikTok Advertising";
  if (!hasMeta && !hasTikTok && hasGoogle) platformName = "your Google Ads";

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
            Connect {platformName} account to start the automated audit. 
            We will analyze your campaigns, creatives, and performance data.
          </p>

          <div className="mt-10 grid gap-4">
            {hasMeta && (
              <button
                onClick={() => {
                  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  window.location.href = `${apiBase}/api/platform-connections/meta/connect?auditId=${params.auditId}`;
                }}
                className="flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Connect with Meta
              </button>
            )}

            {hasTikTok && (
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
            )}

            {hasGoogle && (
              <button
                onClick={() => {
                  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  window.location.href = `${apiBase}/api/platform-connections/google/connect?auditId=${params.auditId}`;
                }}
                className="flex items-center justify-center gap-3 rounded-xl border border-[#e5ddd0] bg-white px-6 py-4 text-lg font-bold text-[#171717] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-gray-50"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Google Ads
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
