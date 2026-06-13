"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCreateAuditSetup } from "@/hooks/use-audits";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { getErrorMessage } from "@/lib/api";
import type { AuditContextInput, DataSource, Platform } from "@/lib/audits";
import { DashboardShell } from "../../_components/DashboardShell";

const PLATFORM_OPTIONS: Array<{
  id: Platform;
  label: string;
  mark: string;
  cls: string;
  description: string;
}> = [
  {
    id: "META",
    label: "Meta Ads",
    mark: "Mt",
    cls: "meta",
    description: "Campaigns, ad sets, ads, audiences, pixel events.",
  },
  {
    id: "GOOGLE",
    label: "Google Ads",
    mark: "Gg",
    cls: "google",
    description: "Search, Shopping, PMax, keywords, search terms.",
  },
  {
    id: "TIKTOK",
    label: "TikTok Ads",
    mark: "Tk",
    cls: "tiktok",
    description: "Campaigns, ad groups, creatives, audiences, pixel events.",
  },
];

const DATA_SOURCE_OPTIONS: Array<{
  id: DataSource;
  label: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    id: "OAUTH",
    label: "Connect ad account",
    description: "One-click, secure OAuth connection. We pull the freshest data automatically — no exports to wrangle.",
    recommended: true,
  },
  {
    id: "MANUAL_UPLOAD",
    label: "Upload CSV files",
    description: "Drop in exported reports from each platform. Good when you'd rather not connect an account.",
  },
];

const BUSINESS_TYPES = ["eCommerce", "Lead Gen", "App Install", "Local", "B2B SaaS", "Other"];

const AUDIT_FOCUS_OPTIONS: Array<{
  id: NonNullable<AuditContextInput["auditFocus"]>;
  label: string;
}> = [
  { id: "diagnose_performance", label: "Diagnose performance" },
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
  const { data: profile } = useBusinessProfile();
  const createAudit = useCreateAuditSetup();

  const [accountName, setAccountName] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("OAUTH");

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

  const canSubmit = useMemo(
    () =>
      accountName.trim().length > 0 &&
      selectedPlatforms.length > 0 &&
      businessType.length > 0,
    [accountName, selectedPlatforms, businessType]
  );

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((current) => (current.includes(platform) ? [] : [platform]));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Enter an account name, pick a platform, and select your business type.");
      return;
    }

    const context: AuditContextInput = {
      businessType,
      monthlyBudget: parseNum(monthlyBudget),
      targetCpa: parseNum(targetCpa),
      targetRoas: parseNum(targetRoas),
      brandTerms: brandTerms.trim() || null,
      auditFocus,
      auditFocusOther: auditFocus === "other" ? auditFocusOther.trim() || null : null,
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

  return (
    <DashboardShell active="" section="New Audit">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Set up a new audit</div>
          <h1 className="page-h1">
            Create a new <span className="em">audit</span>.
          </h1>
          <p className="page-h1-sub">
            Name the account, pick a platform, give us a little context, then connect or upload your
            data. Takes about a minute.
          </p>
        </div>
        <div className="page-head-actions">
          <Link href="/dashboard" className="btn btn-ghost">Cancel</Link>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* Account name */}
        <div className="form-section">
          <div className="form-section-h">Audit name</div>
          <div className="form-section-s">A clear label helps you find this audit later.</div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Account name <span className="req">*</span></label>
            <input
              className="field-input"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Brand X — Production"
            />
          </div>
        </div>

        {/* Platforms */}
        <div className="form-section">
          <div className="form-section-h">Platform <span className="req">*</span></div>
          <div className="form-section-s">Select the ad platform to analyze for this audit.</div>
          <div className="choice-grid cols-3">
            {PLATFORM_OPTIONS.map((platform) => {
              const active = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`choice ${active ? "selected" : ""}`}
                >
                  <div className={`choice-mark plat-mark ${platform.cls}`}>{platform.mark}</div>
                  <div className="choice-body">
                    <div className="choice-title">{platform.label}</div>
                    <div className="choice-sub">{platform.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit context */}
        <div className="form-section">
          <div className="form-section-h">Business context</div>
          <div className="form-section-s">
            A few details help the engine judge whether your performance is good for your business.
            Only business type is required — the rest sharpen the report.
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label">Business type <span className="req">*</span></label>
              <div className="select-wrap">
                <select
                  className="field-select"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="">Select one…</option>
                  {BUSINESS_TYPES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Monthly ad budget <span style={{ color: "var(--hint)", fontWeight: 400 }}>(optional)</span></label>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Audit focus <span style={{ color: "var(--hint)", fontWeight: 400 }}>(optional)</span></label>
            <div className="choice-grid cols-3" style={{ gap: 10 }}>
              {AUDIT_FOCUS_OPTIONS.map((option) => {
                const active = auditFocus === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAuditFocus(option.id)}
                    className={`choice ${active ? "selected" : ""}`}
                    style={{ padding: "11px 14px" }}
                  >
                    <div className="choice-body">
                      <div className="choice-title" style={{ fontSize: 13 }}>{option.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {auditFocus === "other" && (
              <input
                className="field-input"
                style={{ marginTop: 10 }}
                type="text"
                maxLength={240}
                placeholder="What should the audit prioritize?"
                value={auditFocusOther}
                onChange={(e) => setAuditFocusOther(e.target.value)}
              />
            )}
            <p style={{ fontSize: 11.5, color: "var(--hint)", marginTop: 8 }}>
              This guides prioritization only. The audit still scans the whole account for hidden problems.
            </p>
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label">Target CPA <span style={{ color: "var(--hint)", fontWeight: 400 }}>(optional)</span></label>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="e.g. 25"
                value={targetCpa}
                onChange={(e) => setTargetCpa(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Target ROAS <span style={{ color: "var(--hint)", fontWeight: 400 }}>(optional)</span></label>
              <input
                className="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 3.0"
                value={targetRoas}
                onChange={(e) => setTargetRoas(e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Brand / product search terms <span style={{ color: "var(--hint)", fontWeight: 400 }}>(optional, Google audits)</span></label>
            <input
              className="field-input"
              type="text"
              maxLength={300}
              placeholder="e.g. Acme, Acme Shoes, AcmePro"
              value={brandTerms}
              onChange={(e) => setBrandTerms(e.target.value)}
            />
            <p style={{ fontSize: 11.5, color: "var(--hint)", marginTop: 8, lineHeight: 1.55 }}>
              The words people search when they already know you. Comma-separated. Lets the audit
              separate cheap brand search from real non-brand demand.
            </p>
          </div>
        </div>

        {/* Data source */}
        <div className="form-section">
          <div className="form-section-h">How should we get your data?</div>
          <div className="form-section-s">Connect your account for the smoothest experience, or upload CSV exports.</div>
          <div className="choice-grid cols-2">
            {DATA_SOURCE_OPTIONS.map((option) => {
              const active = dataSource === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDataSource(option.id)}
                  className={`choice ${active ? "selected" : ""}`}
                >
                  <div className="opt-check" />
                  <div className="choice-body">
                    <div className="choice-title">
                      {option.label}
                      {option.recommended && <span className="rec-badge">Recommended</span>}
                    </div>
                    <div className="choice-sub">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="form-actions">
          <Link href="/dashboard" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || createAudit.isPending}>
            {createAudit.isPending ? "Creating audit…" : "Continue →"}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
