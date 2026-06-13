"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useAudits, useAudit, useAuditHistory, useAdAccounts } from "@/hooks/use-audits";
import { useMyPlanAndUsage } from "@/hooks/use-plans";
import { getAuditResumePath } from "@/lib/audit-navigation";
import type { Audit, Platform, RuleFinding } from "@/lib/audits";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardTopbar } from "./_components/DashboardTopbar";

const PLATFORM_LABEL: Record<Platform, string> = {
  META: "Meta Ads",
  GOOGLE: "Google Ads",
  TIKTOK: "TikTok Ads",
};

const PLATFORM_MARK: Record<Platform, string> = {
  META: "Mt",
  GOOGLE: "Gg",
  TIKTOK: "Tk",
};

const PLATFORM_CLASS: Record<Platform, string> = {
  META: "meta",
  GOOGLE: "google",
  TIKTOK: "tiktok",
};

const SEVERITY_RANK: Record<RuleFinding["severity"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const SEVERITY_CLASS: Record<RuleFinding["severity"], string> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const SEVERITY_LABEL: Record<RuleFinding["severity"], string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const formatRelativeTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
};

const formatDateLabel = (value: Date) =>
  new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(value);

const statusPill = (score: number) => {
  if (score >= 85) return { cls: "good", label: "Healthy" };
  if (score >= 70) return { cls: "amber", label: "Needs attention" };
  return { cls: "violet", label: "Improving" };
};

const SCORE_CIRCUMFERENCE = 2 * Math.PI * 86;

const activityLabel = (audit: Audit) => {
  const platforms = audit.selectedPlatforms.map((p) => PLATFORM_LABEL[p]).join(" + ");
  switch (audit.status) {
    case "COMPLETED":
      return {
        title: `${platforms || "Audit"} analysis completed`,
        sub:
          typeof audit.healthScore === "number"
            ? `${audit.adAccount?.name || "Account"} · Health score ${audit.healthScore}/100`
            : audit.adAccount?.name || "Account",
        dot: "lime",
      };
    case "PROCESSING":
    case "VALIDATING":
      return {
        title: `${platforms || "Audit"} analysis running`,
        sub: audit.adAccount?.name || "Account",
        dot: "teal",
      };
    case "FAILED":
      return {
        title: `${platforms || "Audit"} analysis needs attention`,
        sub: audit.adAccount?.name || "Account",
        dot: "amber",
      };
    default:
      return {
        title: `${platforms || "Audit"} analysis set up`,
        sub: audit.adAccount?.name || "Account",
        dot: "violet",
      };
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();
  const { data: audits = [] } = useAudits();
  const { data: history = [] } = useAuditHistory({ limit: 10 });
  const { data: planData } = useMyPlanAndUsage();
  const { data: adAccounts = [] } = useAdAccounts();
  const logout = useLogout();

  const completedAudits = useMemo(
    () => audits.filter((audit) => audit.status === "COMPLETED"),
    [audits]
  );

  const latestScored = useMemo(
    () =>
      [...completedAudits]
        .filter((audit) => typeof audit.healthScore === "number")
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.updatedAt).getTime() -
            new Date(a.completedAt || a.updatedAt).getTime()
        )[0],
    [completedAudits]
  );

  const { data: latestAuditDetail } = useAudit(latestScored?.id || "");

  useEffect(() => {
    if (!isLoading && !data) {
      router.replace("/login");
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return (
      <div className="aa-dash">
        <div className="ambient" />
        <div className="app-shell">
          <div className="main">
            <div className="content">
              <p style={{ color: "var(--hint)" }}>Loading your dashboard…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, organizations } = data;
  const org = organizations[0];

  const healthScore = latestScored?.healthScore ?? null;
  const scoreOffset =
    healthScore != null
      ? SCORE_CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, healthScore)) / 100)
      : SCORE_CIRCUMFERENCE;

  const latestHistoryPoint = history[history.length - 1];
  const findingCounts = latestHistoryPoint?.findingCounts;

  const platformsConnected = new Set(adAccounts.map((acc) => acc.platform)).size;

  const platformCards = (["META", "GOOGLE", "TIKTOK"] as Platform[]).map((platform) => {
    const matches = completedAudits
      .filter((audit) => audit.selectedPlatforms.includes(platform) && typeof audit.healthScore === "number")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt).getTime() -
          new Date(a.completedAt || a.updatedAt).getTime()
      );
    return { platform, audit: matches[0] as Audit | undefined };
  });

  const ruleFindings = [...(latestAuditDetail?.ruleFindings || [])].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  );
  const priorities = ruleFindings.slice(0, 5);

  const quickWins = latestAuditDetail?.aiReport?.output?.quickWins?.slice(0, 3) || [];

  const recentActivity = [...audits]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const planLabel = planData?.plan?.name || null;
  const resultsHref = latestScored ? getAuditResumePath(latestScored) : null;

  const opportunity = latestAuditDetail?.aiReport?.output?.opportunitySummary;

  return (
    <div className="aa-dash">
      <div className="ambient" />
      <div className="app-shell">
        <DashboardSidebar
          active="home"
          userName={user.name || ""}
          userEmail={user.email}
          orgName={org?.name}
          planLabel={planLabel}
          resultsHref={resultsHref}
          onLogout={() => logout.mutate()}
          loggingOut={logout.isPending}
        />

        <div className="main">
          <DashboardTopbar section="Dashboard" planLabel={planLabel} />

          <div className="content">
            <div className="page-head">
              <div className="page-head-text">
                <div className="page-eyebrow">Performance intelligence · {formatDateLabel(new Date())}</div>
                <h1 className="page-h1">
                  Welcome back, <span className="em">{user.name?.split(" ")[0] || "there"}</span>.
                </h1>
                <p className="page-h1-sub">
                  {completedAudits.length > 0
                    ? `Across ${audits.length} ${audits.length === 1 ? "analysis" : "analyses"}, AdAdviser is tracking your accounts and surfacing the highest-impact fixes first.`
                    : "Run your first analysis to get a full performance intelligence report — health score, prioritized fixes, and dollar-value opportunities."}
                </p>
              </div>
              <div className="page-head-actions">
                {latestScored?.pdfReports && latestScored.pdfReports.length > 0 && (
                  <Link href={resultsHref || "#"} className="btn btn-ghost">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    View report
                  </Link>
                )}
                <Link href="/dashboard/audits/new" className="btn btn-primary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  New Audit
                </Link>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid-6" style={{ marginBottom: 22 }}>
              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Health score</div>
                  <div className="kpi-icon lime">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.7-7.7 1-1a5.5 5.5 0 0 0 .1-7.7z" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value">
                  {healthScore != null ? healthScore : "—"}
                  {healthScore != null && <sup>/100</sup>}
                </div>
                <div className="kpi-trend">
                  <span className="flat">{latestScored ? formatRelativeTime(latestScored.completedAt) : "No audits yet"}</span>
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Total analyses</div>
                  <div className="kpi-icon violet">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value">{audits.length}</div>
                <div className="kpi-trend">
                  <span className="flat">{completedAudits.length} completed</span>
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Issues detected</div>
                  <div className="kpi-icon amber">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value">{findingCounts ? findingCounts.total : "—"}</div>
                <div className="kpi-trend">
                  <span className="flat">{findingCounts ? "Latest audit" : "Run an audit"}</span>
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Critical issues</div>
                  <div className="kpi-icon coral">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value" style={{ color: findingCounts?.CRITICAL ? "#ff8a8a" : undefined }}>
                  {findingCounts ? findingCounts.CRITICAL : "—"}
                </div>
                <div className="kpi-trend">
                  <span className="flat">{findingCounts ? "Needs review" : "—"}</span>
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Estimated upside</div>
                  <div className="kpi-icon good">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value" style={{ color: "var(--good)", fontSize: 22 }}>
                  {opportunity?.estimatedUpside || opportunity?.estimatedWaste || "—"}
                </div>
                <div className="kpi-trend">
                  <span className="flat">{opportunity ? "From latest report" : "Run an audit"}</span>
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-row">
                  <div className="kpi-label">Platforms</div>
                  <div className="kpi-icon teal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
                    </svg>
                  </div>
                </div>
                <div className="kpi-value">
                  {platformsConnected}
                  <sup>/3</sup>
                </div>
                <div className="kpi-trend">
                  <span className="flat">{platformsConnected > 0 ? "Connected" : "None connected yet"}</span>
                </div>
              </div>
            </div>

            {/* Score + Platforms row */}
            <div className="dash-split-row" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 22 }}>
              <div className="score-card">
                <div className="score-ring">
                  <svg viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#eaff00" />
                        <stop offset=".6" stopColor="#a994ff" />
                        <stop offset="1" stopColor="#7b5ef8" />
                      </linearGradient>
                    </defs>
                    <circle className="track" cx="100" cy="100" r="86" strokeWidth="14" />
                    <circle
                      className="fill"
                      cx="100"
                      cy="100"
                      r="86"
                      strokeWidth="14"
                      strokeDasharray={SCORE_CIRCUMFERENCE}
                      strokeDashoffset={scoreOffset}
                    />
                  </svg>
                  <div className="score-ring-center">
                    <div className="score-num">
                      <span>{healthScore != null ? healthScore : "—"}</span>
                      <small>/100</small>
                    </div>
                    <div className="score-grade">
                      {healthScore != null ? statusPill(healthScore).label : "No audits yet"}
                    </div>
                  </div>
                </div>
                <div className="score-body">
                  <div className="score-status">
                    {healthScore != null ? (
                      <span className={`pill ${statusPill(healthScore).cls}`}>
                        <span className="dot" />
                        {statusPill(healthScore).label}
                      </span>
                    ) : (
                      <span className="pill">
                        <span className="dot" />
                        Not analyzed yet
                      </span>
                    )}
                    {latestScored && (
                      <span className="pill">
                        <span className="mono">Updated {formatRelativeTime(latestScored.completedAt)}</span>
                      </span>
                    )}
                  </div>
                  {latestScored ? (
                    <>
                      <h3 className="score-h">
                        Across <strong>{latestScored.selectedPlatforms.length} connected platform{latestScored.selectedPlatforms.length === 1 ? "" : "s"}</strong>,{" "}
                        {latestScored.adAccount?.name || "your account"} scored <span className="em">{healthScore}/100</span>.
                      </h3>
                      <p className="score-p">
                        {latestAuditDetail?.aiReport?.output?.executiveSummary?.[0] ||
                          "AdAdviser evaluated tracking integrity, campaign structure, audience strategy, creative performance, budget pacing, and attribution to produce this score."}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="score-h">
                        No analyses yet — run your first <span className="em">audit</span> to see your health score.
                      </h3>
                      <p className="score-p">
                        Connect or upload data for Meta, Google, and TikTok and AdAdviser will score your accounts across tracking, structure, audience, creative, budget, and attribution.
                      </p>
                    </>
                  )}
                  <div className="score-legend">
                    <div className="legend-item"><div className="legend-swatch" style={{ background: "var(--good)" }} />90–100 Excellent</div>
                    <div className="legend-item"><div className="legend-swatch" style={{ background: "var(--lime)" }} />75–89 Good</div>
                    <div className="legend-item"><div className="legend-swatch" style={{ background: "var(--amber)" }} />60–74 Fair</div>
                    <div className="legend-item"><div className="legend-swatch" style={{ background: "#ff8a8a" }} />40–59 Poor</div>
                    <div className="legend-item"><div className="legend-swatch" style={{ background: "#7b5ef8" }} />&lt; 40 Critical</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {platformCards.map(({ platform, audit }) => (
                  <div className="plat-card" key={platform}>
                    <div className="plat-row">
                      <div className={`plat-mark ${PLATFORM_CLASS[platform]}`}>{PLATFORM_MARK[platform]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="plat-name">{PLATFORM_LABEL[platform]}</div>
                        <div className="plat-meta">
                          {audit ? `Last analyzed · ${formatRelativeTime(audit.completedAt)}` : "Not analyzed yet"}
                        </div>
                      </div>
                      {audit && typeof audit.healthScore === "number" ? (
                        <span className={`pill ${statusPill(audit.healthScore).cls}`}>
                          <span className="dot" />
                          {statusPill(audit.healthScore).label}
                        </span>
                      ) : (
                        <span className="pill">
                          <span className="dot" />
                          Not connected
                        </span>
                      )}
                    </div>
                    <div className="plat-stats">
                      <div>
                        <div className="plat-score">
                          {audit && typeof audit.healthScore === "number" ? audit.healthScore : "—"}
                          <small>/100</small>
                        </div>
                        <div className="plat-bar">
                          <span style={{ width: `${audit?.healthScore ?? 0}%` }} />
                        </div>
                      </div>
                      {audit ? (
                        <Link href={getAuditResumePath(audit)} className="btn btn-sm btn-ghost">
                          Quick view →
                        </Link>
                      ) : (
                        <Link href="/dashboard/audits/new" className="btn btn-sm btn-ghost">
                          Analyze →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priorities + Activity */}
            <div className="dash-split-row" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, marginBottom: 22 }}>
              <div className="card">
                <div className="card-h">
                  <div>
                    <div className="card-title-lg">Top <span className="em">priorities</span></div>
                    <div className="card-sub">Ordered by severity from your latest audit</div>
                  </div>
                  {resultsHref && (
                    <Link href={resultsHref} className="btn btn-sm btn-ghost">View all {ruleFindings.length}</Link>
                  )}
                </div>
                {priorities.length === 0 ? (
                  <div className="empty-state">
                    {latestScored ? "No findings to show yet." : "Run your first analysis to see prioritized issues here."}
                  </div>
                ) : (
                  <div className="pri-list">
                    {priorities.map((finding, index) => (
                      <div className="pri-item" key={finding.id}>
                        <div className={`pri-rank ${index < 2 ? "top" : ""}`}>{String(index + 1).padStart(2, "0")}</div>
                        <div className="pri-body">
                          <div className="pri-title">{finding.title}</div>
                          <div className="pri-meta">
                            <span className={`sev ${SEVERITY_CLASS[finding.severity]}`}>{SEVERITY_LABEL[finding.severity]}</span>
                            <span className="pill">{finding.category}</span>
                            {finding.estimatedImpact && (
                              <span className="pill"><span className="mono">{finding.estimatedImpact}</span></span>
                            )}
                          </div>
                        </div>
                        {resultsHref && (
                          <div className="pri-actions">
                            <Link href={resultsHref} className="btn btn-sm btn-ghost">Review</Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-h">
                  <div>
                    <div className="card-title-lg">Activity</div>
                    <div className="card-sub">Recent updates</div>
                  </div>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="empty-state">Nothing here yet.</div>
                ) : (
                  <div className="activity">
                    <div className="act-line" />
                    {recentActivity.map((audit) => {
                      const info = activityLabel(audit);
                      return (
                        <div className="act-item" key={audit.id}>
                          <div className={`act-dot ${info.dot}`} />
                          <div>
                            <div className="act-title">{info.title}</div>
                            <div className="act-sub">{info.sub}</div>
                          </div>
                          <div className="act-time">{formatRelativeTime(audit.updatedAt)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick wins */}
            <div className="card-h" style={{ marginBottom: 14, padding: 0 }}>
              <div>
                <div className="card-title-lg">Quick <span className="em">wins</span></div>
                <div className="card-sub">Low-effort, high-impact actions from your latest report</div>
              </div>
              {resultsHref && quickWins.length > 0 && (
                <Link href={resultsHref} className="btn btn-sm btn-ghost">View full report</Link>
              )}
            </div>
            {quickWins.length === 0 ? (
              <div className="card empty-state" style={{ marginBottom: 18 }}>
                {latestScored
                  ? "No quick wins identified in the latest report."
                  : "Run your first analysis to get a list of fast, high-impact fixes."}
              </div>
            ) : (
              <div className="grid-3" style={{ marginBottom: 18 }}>
                {quickWins.map((win) => (
                  <div className="qw-card" key={win.ruleId}>
                    <div className="qw-h">
                      <div className="qw-mark">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <div className="qw-title">{win.title}</div>
                    </div>
                    {win.fixSteps && win.fixSteps.length > 0 && (
                      <div className="qw-desc">{win.fixSteps[0]}</div>
                    )}
                    <div className="qw-foot">
                      <span className="qw-impact">{win.platform ? PLATFORM_LABEL[win.platform] : ""}</span>
                      {resultsHref && <Link href={resultsHref} className="btn btn-sm btn-ghost">Details →</Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
