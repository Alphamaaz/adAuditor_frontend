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
            This is the OAuth workflow placeholder. We will add Meta, Google,
            and TikTok connection buttons here once each platform app setup and
            credentials are ready.
          </p>
        </div>
      </main>
    </div>
  );
}
