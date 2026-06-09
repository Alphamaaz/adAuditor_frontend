"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCreateAuditSetup } from "@/hooks/use-audits";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { getErrorMessage } from "@/lib/api";
import type { AuditContextInput, DataSource, Platform } from "@/lib/audits";

const PLATFORM_OPTIONS: Array<{
  id: Platform;
  label: string;
  description: string;
}> = [
  {
    id: "META",
    label: "Meta Ads",
    description: "Campaigns, ad sets, ads, audiences, pixel events.",
  },
  {
    id: "GOOGLE",
    label: "Google Ads",
    description: "Search, Shopping, PMax, keywords, search terms.",
  },
  {
    id: "TIKTOK",
    label: "TikTok Ads",
    description: "Campaigns, ad groups, creatives, audiences, pixel events.",
  },
];

const DATA_SOURCE_OPTIONS: Array<{
  id: DataSource;
  label: string;
  description: string;
}> = [
  {
    id: "MANUAL_UPLOAD",
    label: "Upload CSV files",
    description: "Use exported reports while OAuth approvals are being completed.",
  },
  {
    id: "OAUTH",
    label: "Connect ad account",
    description: "Use OAuth/API connection when platform app approval is available.",
  },
];

const BUSINESS_TYPES = [
  "eCommerce",
  "Lead Gen",
  "App Install",
  "Local",
  "B2B SaaS",
  "Other",
];

const AUDIT_FOCUS_OPTIONS: Array<{
  id: NonNullable<AuditContextInput["auditFocus"]>;
  label: string;
}> = [
  { id: "diagnose_performance", label: "Diagnose account performance" },
  { id: "lower_cpa", label: "Lower CPA" },
  { id: "improve_ctr", label: "Improve CTR" },
  { id: "increase_roas", label: "Increase ROAS" },
  { id: "more_leads", label: "More leads" },
  { id: "other", label: "Other" },
];

function parseNum(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) || n <= 0 ? null : n;
}

export default function NewAuditPage() {
  const { data: auth, isLoading: authLoading } = useCurrentUser();
  const { data: profile } = useBusinessProfile();
  const createAudit = useCreateAuditSetup();

  const [accountName, setAccountName] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("MANUAL_UPLOAD");

  // Audit context (replaces the long /onboarding profile).
  const [businessType, setBusinessType] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [targetCpa, setTargetCpa] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [brandTerms, setBrandTerms] = useState("");
  const [auditFocus, setAuditFocus] =
    useState<NonNullable<AuditContextInput["auditFocus"]>>("diagnose_performance");
  const [auditFocusOther, setAuditFocusOther] = useState("");

  const [error, setError] = useState("");

  // Prefill context from any existing business profile so returning users
  // don't retype. New users see empty fields — no onboarding wall.
  useEffect(() => {
    const a = profile?.answers?.sectionA;
    if (!a) return;
    if (a.businessType) setBusinessType(a.businessType);
    if (a.monthlyBudget != null) setMonthlyBudget(String(a.monthlyBudget));
    if (a.targetCpa != null) setTargetCpa(String(a.targetCpa));
    if (a.targetRoas != null) setTargetRoas(String(a.targetRoas));
    const extra = a as { brandTerms?: string | null };
    if (extra.brandTerms) setBrandTerms(extra.brandTerms);
  }, [profile]);

  const orgName = auth?.organizations[0]?.name;
  const canSubmit = useMemo(
    () =>
      accountName.trim().length > 0 &&
      selectedPlatforms.length > 0 &&
      businessType.length > 0,
    [accountName, selectedPlatforms, businessType]
  );

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform) ? [] : [platform]
    );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError(
        "Enter an account name, pick a platform, and select your business type."
      );
      return;
    }

    const context: AuditContextInput = {
      businessType,
      monthlyBudget: parseNum(monthlyBudget),
      targetCpa: parseNum(targetCpa),
      targetRoas: parseNum(targetRoas),
      brandTerms: brandTerms.trim() || null,
      auditFocus,
      auditFocusOther:
        auditFocus === "other" ? auditFocusOther.trim() || null : null,
    };

    try {
      await createAudit.mutateAsync({
        accountName: accountName.trim(),
        selectedPlatforms,
        dataSource,
        context,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <p className="text-sm text-[#6b7280]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            Ad Adviser
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6b7280]">{orgName}</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#171717]">
            Create a new audit
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Name the account, pick a platform, give us a little context, then
            connect or upload your data. Takes about a minute.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <label className="block text-sm font-semibold text-[#374151]">
              Account name
            </label>
            <input
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="Brand X"
              className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
            />
            <p className="mt-2 text-xs text-[#9ca3af]">
              This name will be used to identify the platform record.
            </p>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#171717]">Platforms</h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Select a platform for this audit.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {PLATFORM_OPTIONS.map((platform) => {
                const active = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      active
                        ? "border-[#1f4d3a] bg-[#eff7f1]"
                        : "border-[#e5ddd0] bg-white hover:border-[#1f4d3a]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#171717]">
                      {platform.label}
                    </span>
                    <span className="mt-2 block text-sm leading-5 text-[#6b7280]">
                      {platform.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Audit context — replaces the long onboarding profile */}
          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#171717]">
                Audit context
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                A few details help the engine judge whether your performance is
                good for your business. Only business type is required — the
                rest sharpen the report.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Business type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                  >
                    <option value="">Select one…</option>
                    {BUSINESS_TYPES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Monthly ad budget ($){" "}
                    <span className="text-xs font-normal text-[#9ca3af]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151]">
                  Audit focus{" "}
                  <span className="text-xs font-normal text-[#9ca3af]">
                    (optional)
                  </span>
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {AUDIT_FOCUS_OPTIONS.map((option) => {
                    const active = auditFocus === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAuditFocus(option.id)}
                        className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "border-[#1f4d3a] bg-[#eff7f1] text-[#1f4d3a]"
                            : "border-[#d1cac0] bg-[#faf9f7] text-[#374151] hover:border-[#1f4d3a]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {auditFocus === "other" && (
                  <input
                    type="text"
                    maxLength={240}
                    placeholder="What should the audit prioritize?"
                    value={auditFocusOther}
                    onChange={(e) => setAuditFocusOther(e.target.value)}
                    className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                  />
                )}
                <p className="mt-1 text-xs text-[#9ca3af]">
                  This guides prioritization only. The audit still scans the
                  whole account for hidden problems.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Target CPA ($){" "}
                    <span className="text-xs font-normal text-[#9ca3af]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={targetCpa}
                    onChange={(e) => setTargetCpa(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Target ROAS{" "}
                    <span className="text-xs font-normal text-[#9ca3af]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 3.0"
                    value={targetRoas}
                    onChange={(e) => setTargetRoas(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151]">
                  Your brand / product search terms{" "}
                  <span className="text-xs font-normal text-[#9ca3af]">
                    (optional, Google audits)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="e.g. Acme, Acme Shoes, AcmePro"
                  value={brandTerms}
                  onChange={(e) => setBrandTerms(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                />
                <p className="mt-1 text-xs text-[#9ca3af]">
                  The words people search when they already know you (brand
                  name, product names). Comma-separated. Lets the audit separate
                  cheap brand search from real non-brand demand — and catch when
                  they&apos;re mixed and inflating your reported ROAS.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#171717]">
                Data source
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Start with CSV upload now, or create an OAuth connection flow
                when platform approval is ready.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {DATA_SOURCE_OPTIONS.map((option) => {
                const active = dataSource === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDataSource(option.id)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      active
                        ? "border-[#1f4d3a] bg-[#eff7f1]"
                        : "border-[#e5ddd0] bg-white hover:border-[#1f4d3a]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#171717]">
                      {option.label}
                    </span>
                    <span className="mt-2 block text-sm leading-5 text-[#6b7280]">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="rounded-md border border-[#d1cac0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || createAudit.isPending}
              className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createAudit.isPending ? "Creating audit..." : "Continue"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
