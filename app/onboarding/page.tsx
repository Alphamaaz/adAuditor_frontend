"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { useUpsertBusinessProfile } from "@/hooks/use-business-profile";
import { getErrorMessage } from "@/lib/api";
import type { BusinessProfileAnswers } from "@/lib/business-profile";
import Link from "next/link";

// ── constants ─────────────────────────────────────────────────────────────────

const GEO_MARKETS = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark",
  "Brazil", "Mexico", "India", "Singapore", "Japan", "South Korea",
  "UAE", "Saudi Arabia", "South Africa", "Philippines", "Indonesia",
  "Malaysia", "Thailand", "Other",
];

const STEPS = [
  { id: 1, label: "Business context" },
  { id: 2, label: "Tracking & attribution" },
  { id: 3, label: "Performance benchmarks" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function parseNum(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) || n <= 0 ? null : n;
}

// ── sub-components ────────────────────────────────────────────────────────────

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#9ca3af]">{children}</p>;
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#374151]">
      {children}
      {optional && <span className="ml-1 text-xs font-normal text-[#9ca3af]">(optional)</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] placeholder-[#9ca3af] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="mt-1.5 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
    />
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt
              ? "border-[#1f4d3a] bg-[#1f4d3a] text-white"
              : "border-[#d1cac0] bg-white text-[#374151] hover:border-[#1f4d3a]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            value.includes(opt)
              ? "border-[#1f4d3a] bg-[#1f4d3a] text-white"
              : "border-[#d1cac0] bg-white text-[#374151] hover:border-[#1f4d3a]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── default state ─────────────────────────────────────────────────────────────

const defaultAnswers = () => ({
  sectionA: {
    businessType: "",
    monthlyBudget: "",
    targetCpa: "",
    targetRoas: "",
    avgOrderValue: "",
    blendedCac: "",
    blendedCacUnknown: false,
    productsServices: "",
    geoMarkets: [] as string[],
    campaignAge: "",
    campaignObjective: [] as string[],
  },
  sectionB: {
    pixelInstalled: "",
    correctConversionEvent: "",
    utmConsistency: "",
    crossReferencesGa4: "",
    serverSideTracking: "",
  },
  sectionC: {
    bestEverCpa: "",
    bestEverRoas: "",
    avgCtr90Days: "",
    avgCpm90Days: "",
    landingPageConversionRate: "",
    historicalSpend: "",
    skipped: false,
  },
});

// ── main component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { data: auth, isLoading } = useCurrentUser();
  const upsert = useUpsertBusinessProfile();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultAnswers);
  const [error, setError] = useState("");

  // Already has a profile → skip to dashboard.
  useEffect(() => {
    if (!isLoading && auth?.hasBusinessProfile) {
      router.replace("/dashboard");
    }
    if (!isLoading && !auth) {
      router.replace("/login");
    }
  }, [isLoading, auth, router]);

  if (isLoading || !auth) return null;

  const setA = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, sectionA: { ...prev.sectionA, [field]: value } }));

  const setB = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, sectionB: { ...prev.sectionB, [field]: value } }));

  const setC = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, sectionC: { ...prev.sectionC, [field]: value } }));

  // ── save ──────────────────────────────────────────────────────────────────

  const save = async (skipSectionC = false) => {
    setError("");
    const payload: BusinessProfileAnswers = {
      sectionA: {
        businessType: form.sectionA.businessType || null,
        monthlyBudget: parseNum(form.sectionA.monthlyBudget),
        targetCpa: parseNum(form.sectionA.targetCpa),
        targetRoas: parseNum(form.sectionA.targetRoas),
        avgOrderValue: parseNum(form.sectionA.avgOrderValue),
        blendedCac: form.sectionA.blendedCacUnknown ? null : parseNum(form.sectionA.blendedCac),
        productsServices: form.sectionA.productsServices || null,
        geoMarkets: form.sectionA.geoMarkets,
        campaignAge: form.sectionA.campaignAge || null,
        campaignObjective: form.sectionA.campaignObjective,
      },
      sectionB: {
        pixelInstalled: form.sectionB.pixelInstalled || null,
        correctConversionEvent: form.sectionB.correctConversionEvent || null,
        utmConsistency: form.sectionB.utmConsistency || null,
        crossReferencesGa4: form.sectionB.crossReferencesGa4 || null,
        serverSideTracking: form.sectionB.serverSideTracking || null,
      },
      sectionC: skipSectionC
        ? {}
        : {
            bestEverCpa: parseNum(form.sectionC.bestEverCpa),
            bestEverRoas: parseNum(form.sectionC.bestEverRoas),
            avgCtr90Days: parseNum(form.sectionC.avgCtr90Days),
            avgCpm90Days: parseNum(form.sectionC.avgCpm90Days),
            landingPageConversionRate: parseNum(form.sectionC.landingPageConversionRate),
            historicalSpend: form.sectionC.historicalSpend || null,
          },
    };

    upsert.mutate(payload, {
      onSuccess: () => router.push("/dashboard"),
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  // ── section A ─────────────────────────────────────────────────────────────

  const SectionA = (
    <div className="space-y-6">
      <div>
        <FieldLabel>A1 — What is your primary business type?</FieldLabel>
        <Hint>Determines which KPIs and benchmarks apply to your account.</Hint>
        <Select
          value={form.sectionA.businessType}
          onChange={(e) => setA("businessType", e.target.value)}
        >
          <option value="">Select one…</option>
          {["eCommerce", "Lead Gen", "App Install", "Local", "B2B SaaS", "Other"].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>
      </div>

      <div>
        <FieldLabel optional>A2 — Monthly ad budget across all platforms ($)</FieldLabel>
        <Hint>Used to detect budget fragmentation and calibrate spend checks.</Hint>
        <Input
          type="number"
          min="0"
          placeholder="e.g. 5000"
          value={form.sectionA.monthlyBudget}
          onChange={(e) => setA("monthlyBudget", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel optional>A3 — Target CPA ($)</FieldLabel>
          <Hint>Core benchmark for flagging underperforming campaigns.</Hint>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 25"
            value={form.sectionA.targetCpa}
            onChange={(e) => setA("targetCpa", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel optional>A4 — Target ROAS</FieldLabel>
          <Hint>e.g. 3.0 means $3 revenue per $1 spent.</Hint>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 3.0"
            value={form.sectionA.targetRoas}
            onChange={(e) => setA("targetRoas", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel optional>A5 — Avg order / lead value ($)</FieldLabel>
          <Hint>Used to calculate true ROAS and LTV efficiency.</Hint>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 75"
            value={form.sectionA.avgOrderValue}
            onChange={(e) => setA("avgOrderValue", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel optional>A6 — Blended CAC ($)</FieldLabel>
          <Hint>Reveals if ads are truly profitable at a business level.</Hint>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 40"
            value={form.sectionA.blendedCacUnknown ? "" : form.sectionA.blendedCac}
            disabled={form.sectionA.blendedCacUnknown}
            onChange={(e) => setA("blendedCac", e.target.value)}
          />
          <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs text-[#6b7280]">
            <input
              type="checkbox"
              checked={form.sectionA.blendedCacUnknown}
              onChange={(e) => setA("blendedCacUnknown", e.target.checked)}
              className="accent-[#1f4d3a]"
            />
            I don&apos;t know my CAC
          </label>
        </div>
      </div>

      <div>
        <FieldLabel optional>A7 — Products or services you&apos;re advertising</FieldLabel>
        <Hint>Helps make recommendations more relevant to your offer.</Hint>
        <Input
          type="text"
          maxLength={300}
          placeholder="e.g. Men's running shoes, SaaS CRM software…"
          value={form.sectionA.productsServices}
          onChange={(e) => setA("productsServices", e.target.value)}
        />
      </div>

      <div>
        <FieldLabel optional>A8 — Geographic markets</FieldLabel>
        <Hint>Flags geo-expansion opportunities and regional inefficiencies.</Hint>
        <MultiSelect
          options={GEO_MARKETS}
          value={form.sectionA.geoMarkets}
          onChange={(v) => setA("geoMarkets", v)}
        />
      </div>

      <div>
        <FieldLabel optional>A9 — How long have these campaigns been running?</FieldLabel>
        <Hint>Helps interpret learning-phase issues vs. chronic problems.</Hint>
        <RadioGroup
          options={["<1 month", "1-3 months", "3-6 months", "6+ months"]}
          value={form.sectionA.campaignAge}
          onChange={(v) => setA("campaignAge", v)}
        />
      </div>

      <div>
        <FieldLabel optional>A10 — Overall campaign objective</FieldLabel>
        <Hint>Ensures the audit uses the correct success metrics.</Hint>
        <MultiSelect
          options={["Sales", "Leads", "Traffic", "Awareness", "App Installs"]}
          value={form.sectionA.campaignObjective}
          onChange={(v) => setA("campaignObjective", v)}
        />
      </div>
    </div>
  );

  // ── section B ─────────────────────────────────────────────────────────────

  const trackingQuestions = [
    {
      key: "pixelInstalled",
      label: "B1 — Is your pixel / conversion tag installed and verified?",
      hint: "One of the most expensive root causes of poor ad performance.",
      options: ["Yes", "No", "Unsure"],
    },
    {
      key: "correctConversionEvent",
      label: "B2 — Are you tracking the correct conversion event for your objective?",
      hint: "Bidding to 'Add to Cart' instead of 'Purchase' wastes budget.",
      options: ["Yes", "No", "Unsure"],
    },
    {
      key: "utmConsistency",
      label: "B3 — Do you use UTM parameters consistently on all ad links?",
      hint: "Required for GA4 / analytics validation of platform data.",
      options: ["Yes", "No", "Inconsistently"],
    },
    {
      key: "crossReferencesGa4",
      label: "B4 — Do you cross-reference platform data with GA4 or a third-party tool?",
      hint: "Identifies attribution inflation in platform reports.",
      options: ["Yes", "No"],
    },
    {
      key: "serverSideTracking",
      label: "B5 — Are you using server-side tracking (CAPI / Enhanced Conversions)?",
      hint: "Critical post-iOS 14 — affects data completeness and optimization quality.",
      options: ["Yes", "No", "In progress"],
    },
  ] as const;

  const SectionB = (
    <div className="space-y-7">
      {trackingQuestions.map((q) => (
        <div key={q.key}>
          <FieldLabel>{q.label}</FieldLabel>
          <Hint>{q.hint}</Hint>
          <RadioGroup
            options={q.options as unknown as string[]}
            value={form.sectionB[q.key]}
            onChange={(v) => setB(q.key, v)}
          />
        </div>
      ))}
    </div>
  );

  // ── section C ─────────────────────────────────────────────────────────────

  const SectionC = (
    <div className="space-y-6">
      <p className="rounded-md bg-[#f0f7ee] px-4 py-3 text-sm text-[#2d6a4f]">
        All fields in this section are optional. Skip any you don&apos;t know — we&apos;ll use
        industry benchmarks instead.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel optional>C1 — Best-ever CPA ($)</FieldLabel>
          <Hint>Helps compare current performance to your past best.</Hint>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 18"
            value={form.sectionC.bestEverCpa}
            onChange={(e) => setC("bestEverCpa", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel optional>C2 — Best-ever ROAS</FieldLabel>
          <Hint>Your peak return on ad spend.</Hint>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 5.2"
            value={form.sectionC.bestEverRoas}
            onChange={(e) => setC("bestEverRoas", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel optional>C3 — Avg CTR last 90 days (%)</FieldLabel>
          <Hint>Baseline for creative performance checks.</Hint>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="e.g. 1.8"
            value={form.sectionC.avgCtr90Days}
            onChange={(e) => setC("avgCtr90Days", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel optional>C4 — Avg CPM last 90 days ($)</FieldLabel>
          <Hint>Baseline for audience efficiency checks.</Hint>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 14"
            value={form.sectionC.avgCpm90Days}
            onChange={(e) => setC("avgCpm90Days", e.target.value)}
          />
        </div>
      </div>

      <div>
        <FieldLabel optional>C5 — Landing page conversion rate from ad traffic (%)</FieldLabel>
        <Hint>Used to identify whether poor results are ad-side or landing-page-side.</Hint>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="e.g. 2.4"
          value={form.sectionC.landingPageConversionRate}
          onChange={(e) => setC("landingPageConversionRate", e.target.value)}
        />
      </div>

      <div>
        <FieldLabel optional>C6 — Roughly how much has been spent on this account historically?</FieldLabel>
        <Hint>Context for interpreting account maturity and benchmark expectations.</Hint>
        <RadioGroup
          options={["<$1K", "$1K-$10K", "$10K-$100K", "$100K+"]}
          value={form.sectionC.historicalSpend}
          onChange={(v) => setC("historicalSpend", v)}
        />
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      {/* Header */}
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-[#171717]">
            AdAuditor Pro
          </Link>
          <span className="text-sm text-[#6b7280]">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-3 flex gap-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    s.id <= step ? "bg-[#1f4d3a]" : "bg-[#e5ddd0]"
                  }`}
                />
                <p
                  className={`mt-1.5 text-xs font-medium ${
                    s.id === step ? "text-[#1f4d3a]" : "text-[#9ca3af]"
                  }`}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#e5ddd0] bg-white p-6 shadow-sm md:p-8">
          {step === 1 && (
            <>
              <h1 className="text-xl font-semibold text-[#171717]">
                Tell us about your business
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">
                This becomes your default audit context — the AI uses it to judge whether
                your ad performance is good or bad for your specific business.
              </p>
              <div className="mt-6">{SectionA}</div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-semibold text-[#171717]">
                Tracking &amp; attribution
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">
                Tracking issues are the #1 source of wasted ad spend. These answers
                feed directly into the audit rule engine.
              </p>
              <div className="mt-6">{SectionB}</div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-semibold text-[#171717]">
                Performance benchmarks
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">
                Comparing current performance to your own historical bests makes
                recommendations much more accurate. Skip anything you don&apos;t know.
              </p>
              <div className="mt-6">{SectionC}</div>
            </>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-md border border-[#d1cac0] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step === 3 && (
                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={upsert.isPending}
                  className="text-sm text-[#6b7280] hover:underline disabled:opacity-50"
                >
                  Skip benchmarks
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-md bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d]"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={upsert.isPending}
                  className="rounded-md bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
                >
                  {upsert.isPending ? "Saving…" : "Save & continue →"}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#9ca3af]">
          You can edit these answers later from your profile settings.
        </p>
      </main>
    </div>
  );
}
