"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useAudits } from "@/hooks/use-audits";
import {
  getAuditResumeLabel,
  getAuditResumePath,
} from "@/lib/audit-navigation";
import type { Audit, Platform } from "@/lib/audits";
import { UsageBadge } from "@/components/UsageBadge";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";

const statusLabels: Record<Audit["status"], string> = {
  DRAFT: "Draft",
  INTAKE_IN_PROGRESS: "Intake in progress",
  WAITING_FOR_DATA: "Waiting for data",
  VALIDATING: "Validating",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Needs attention",
};

const platformLabels: Record<Platform, string> = {
  META: "Meta",
  GOOGLE: "Google",
  TIKTOK: "TikTok",
};

const formatPlatforms = (platforms: Platform[]) =>
  platforms.map((platform) => platformLabels[platform]).join(", ");

const formatDate = (value: string | null) => {
  if (!value) return "Not completed yet";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getAuditAccountLabel = (audit: Audit | undefined) =>
  audit?.adAccount?.name || "No scored audit yet";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();
  const { data: audits = [] } = useAudits();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !data) {
      router.replace("/login");
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="text-sm text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const { user, organizations } = data;
  const org = organizations[0];
  const totalAudits = audits.length;
  const completedAudits = audits.filter(
    (audit) => audit.status === "COMPLETED"
  ).length;
  const inProgressAudits = audits.filter(
    (audit) => audit.status !== "COMPLETED" && audit.status !== "FAILED"
  ).length;
  const latestScoredAudit = audits.find(
    (audit) => typeof audit.healthScore === "number"
  );
  const dashboardCards = [
    {
      label: "Audit records",
      value: String(totalAudits),
      note:
        totalAudits === 1
          ? "1 audit created in this organization"
          : `${totalAudits} audits created in this organization`,
    },
    {
      label: "Completed reports",
      value: String(completedAudits),
      note:
        inProgressAudits > 0
          ? `${inProgressAudits} still in progress`
          : "No active audits waiting",
    },
    {
      label: "Latest audit score",
      value:
        typeof latestScoredAudit?.healthScore === "number"
          ? `${latestScoredAudit.healthScore}/100`
          : "-",
      note: latestScoredAudit
        ? `${getAuditAccountLabel(latestScoredAudit)} - ${formatDate(
            latestScoredAudit.completedAt
          )}`
        : "Run an audit to generate a score",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            AdAuditor Pro
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6b7280]">
              {user.name || user.email}
            </span>
            <Link
              href="/dashboard/settings"
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
            >
              Settings
            </Link>
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef] disabled:opacity-60"
            >
              {logout.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#171717]">
            Welcome{user.name ? `, ${user.name}` : ""}
          </h1>
          {org && (
            <p className="mt-1 text-sm text-[#6b7280]">
              Organization:{" "}
              <span className="font-medium text-[#374151]">{org.name}</span>
            </p>
          )}
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UsageBadge />
          {dashboardCards.map(({ label, value, note }) => (
            <div
              key={label}
              className="rounded-lg border border-[#e5ddd0] bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#171717]">
                {value}
              </p>
              <p className="mt-1 text-sm text-[#9ca3af]">{note}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <ScoreTrendChart />
        </div>

        <div className="rounded-lg border border-[#d8ecd4] bg-[#f0f7ee] p-6">
          <h2 className="text-base font-semibold text-[#1f4d3a]">
            Start your first audit
          </h2>
          <p className="mt-1 text-sm text-[#4b7a60]">
            Select Meta, Google, or TikTok, choose manual upload or OAuth, and
            create a draft audit.
          </p>
          <Link
            href="/dashboard/audits/new"
            className="mt-4 inline-flex rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d]"
          >
            New audit
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-[#e5ddd0] bg-white">
          <div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-4">
            <p className="text-sm font-semibold text-[#1f2937]">
              Recent audits
            </p>
            {audits.filter((audit) => audit.status === "COMPLETED").length >=
              2 && (
              <Link
                href="/dashboard/audits/compare"
                className="text-xs font-semibold text-[#1f4d3a] hover:underline"
              >
                Compare audits →
              </Link>
            )}
          </div>
          {audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-[#6b7280]">No audits yet.</p>
              <p className="mt-1 text-sm text-[#9ca3af]">
                Your audit history will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ece7df]">
              {audits.slice(0, 5).map((audit) => (
                <Link
                  key={audit.id}
                  href={getAuditResumePath(audit)}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#faf9f7] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">
                  {audit.adAccount?.name || "Audit"}
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {formatPlatforms(audit.selectedPlatforms)} -{" "}
                  {audit.dataSource === "OAUTH"
                    ? "OAuth connection"
                    : "Manual upload"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#f7f4ef] px-3 py-1 text-xs font-semibold text-[#374151]">
                  {statusLabels[audit.status]}
                </span>
                    <span className="text-xs font-semibold text-[#1f4d3a]">
                      {getAuditResumeLabel(audit)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
