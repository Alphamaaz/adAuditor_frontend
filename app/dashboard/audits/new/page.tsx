"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCreateAuditSetup } from "@/hooks/use-audits";
import { getErrorMessage } from "@/lib/api";
import type { DataSource, Platform } from "@/lib/audits";

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

export default function NewAuditPage() {
  const { data: auth } = useCurrentUser();
  const createAudit = useCreateAuditSetup();
  const [accountName, setAccountName] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("MANUAL_UPLOAD");
  const [error, setError] = useState("");

  const orgName = auth?.organizations[0]?.name;
  const canSubmit = useMemo(
    () => accountName.trim().length > 0 && selectedPlatforms.length > 0,
    [accountName, selectedPlatforms]
  );

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Enter an account name and select at least one platform.");
      return;
    }

    try {
      await createAudit.mutateAsync({
        accountName: accountName.trim(),
        selectedPlatforms,
        dataSource,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

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

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6b7280]">{orgName}</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#171717]">
            Create a new audit
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Select the ad platforms to audit, name the account, and choose how
            data will enter the audit pipeline. Both upload and OAuth paths use
            the same normalized audit engine.
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
              For multi-platform audits, separate platform records are created
              using this name.
            </p>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#171717]">
                Platforms
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Select one or more platforms for this audit.
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
