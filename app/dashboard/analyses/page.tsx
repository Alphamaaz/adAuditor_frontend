"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Filter, Plus, Search } from "lucide-react";
import { DashboardShell } from "../_components/DashboardShell";
import { useDashboardAuditData } from "../_components/useDashboardAuditData";
import { getAuditResumePath } from "@/lib/audit-navigation";
import type { Audit, Platform } from "@/lib/audits";

const platformLabel: Record<Platform, string> = {
  META: "Meta Ads",
  GOOGLE: "Google Ads",
  TIKTOK: "TikTok Ads",
};

const formatDate = (value: string | null) => {
  if (!value) return "In progress";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const statusLabel: Record<Audit["status"], string> = {
  DRAFT: "Draft",
  INTAKE_IN_PROGRESS: "Intake",
  WAITING_FOR_DATA: "Waiting for data",
  VALIDATING: "Validating",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Needs attention",
};

export default function AnalysesPage() {
  const { audits, isLoading } = useDashboardAuditData();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"ALL" | Platform>("ALL");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...audits]
      .filter((audit) => platform === "ALL" || audit.selectedPlatforms.includes(platform))
      .filter((audit) => {
        if (!needle) return true;
        return [audit.adAccount?.name, ...audit.selectedPlatforms.map((item) => platformLabel[item])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [audits, platform, query]);

  const completed = audits.filter((audit) => audit.status === "COMPLETED").length;
  const scoredAudits = audits.filter((audit) => typeof audit.healthScore === "number");
  const averageScore = scoredAudits.length
    ? Math.round(
        scoredAudits.reduce((sum, audit) => sum + (audit.healthScore || 0), 0) /
          scoredAudits.length
      )
    : null;

  return (
    <DashboardShell active="analyses" section="Analyses">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Analysis history</div>
          <h1 className="page-h1">All your <span className="em">reports</span>.</h1>
          <p className="page-h1-sub">
            Review every audit in your workspace, reopen unfinished work, or select completed reports for comparison.
          </p>
        </div>
        <div className="page-head-actions">
          <Link href="/dashboard/audits/compare" className="btn btn-ghost">Compare reports</Link>
          <Link href="/dashboard/audits/new" className="btn btn-primary"><Plus size={14} /> New Audit</Link>
        </div>
      </div>

      <div className="analysis-stats">
        <div><FileText size={17} /><span><strong>{audits.length}</strong>Total audits</span></div>
        <div><CalendarDays size={17} /><span><strong>{completed}</strong>Completed</span></div>
        <div><Filter size={17} /><span><strong>{averageScore ?? "-"}</strong>Average score</span></div>
      </div>

      <section className="card analysis-table-card">
        <div className="analysis-toolbar">
          <label className="analysis-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts or platforms" />
          </label>
          <div className="segment-control" role="group" aria-label="Filter by platform">
            {(["ALL", "META", "GOOGLE", "TIKTOK"] as const).map((item) => (
              <button
                type="button"
                key={item}
                className={platform === item ? "active" : ""}
                onClick={() => setPlatform(item)}
              >
                {item === "ALL" ? "All" : item === "META" ? "Meta" : item === "GOOGLE" ? "Google" : "TikTok"}
              </button>
            ))}
          </div>
        </div>

        <div className="analysis-table" role="table" aria-label="Audit history">
          <div className="analysis-row analysis-head" role="row">
            <span>Account</span><span>Platform</span><span>Date</span><span>Status</span><span>Score</span><span />
          </div>
          {isLoading ? (
            <div className="empty-state">Loading audits...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state priority-empty">
              <FileText size={28} />
              <strong>{audits.length ? "No matching audits" : "No audits yet"}</strong>
              <span>{audits.length ? "Change your search or platform filter." : "Your audit history will appear here."}</span>
              {!audits.length && <Link href="/dashboard/audits/new" className="btn btn-primary">Run an audit</Link>}
            </div>
          ) : (
            filtered.map((audit) => (
              <Link className="analysis-row" role="row" href={getAuditResumePath(audit)} key={audit.id}>
                <span className="analysis-account">
                  <span className="analysis-account-mark">{(audit.adAccount?.name || "A").slice(0, 1).toUpperCase()}</span>
                  <span><strong>{audit.adAccount?.name || "Untitled audit"}</strong><small>{audit.id.slice(0, 8)}</small></span>
                </span>
                <span className="analysis-platforms">
                  {audit.selectedPlatforms.length
                    ? audit.selectedPlatforms.map((item) => platformLabel[item]).join(" + ")
                    : "Not selected"}
                </span>
                <span>{formatDate(audit.completedAt || audit.createdAt)}</span>
                <span><span className={`status-badge status-${audit.status.toLowerCase()}`}>{statusLabel[audit.status]}</span></span>
                <span className="analysis-score">{typeof audit.healthScore === "number" ? <><strong>{audit.healthScore}</strong>/100</> : "-"}</span>
                <span className="analysis-open"><ArrowRight size={15} /></span>
              </Link>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
