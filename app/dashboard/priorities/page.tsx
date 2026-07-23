"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Download } from "lucide-react";
import { DashboardShell } from "../_components/DashboardShell";
import { useDashboardAuditData } from "../_components/useDashboardAuditData";
import { datedFilename, downloadCsv } from "@/lib/dashboard-exports";

const severityClass: Record<string, string> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export default function PrioritiesPage() {
  const { latestAudit, findings, isLoading } = useDashboardAuditData();
  const priorities = findings.slice(0, 5);
  const reportHref = latestAudit ? `/dashboard/audits/${latestAudit.id}/results` : "/dashboard";
  const measured = priorities.filter((finding) => finding.estimatedImpact).length;

  const exportPriorities = () => {
    downloadCsv(
      datedFilename("adadviser-priorities"),
      ["Priority", "Finding", "Severity", "Category", "Platform", "Estimated impact", "Recommended action"],
      priorities.map((finding, index) => [
        index + 1,
        finding.title,
        finding.severity,
        finding.category,
        finding.platform || "Account-wide",
        finding.estimatedImpact || "Not quantified",
        finding.fixSteps?.join(" | ") || "Review the full report",
      ])
    );
  };

  return (
    <DashboardShell active="priorities" section="Top 5 Priorities">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Action items</div>
          <h1 className="page-h1">Top 5 <span className="em">priorities</span>.</h1>
          <p className="page-h1-sub">
            The most important actions from your latest audit, ordered by severity and measured business impact.
          </p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn btn-ghost" onClick={exportPriorities} disabled={!priorities.length}>
            <Download size={14} /> Export task list
          </button>
          <Link href={reportHref} className="btn btn-primary">
            View full report <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <section className="card priority-board">
        <div className="card-h">
          <div>
            <div className="card-title-lg">Latest audit <span className="em">priorities</span></div>
            <div className="card-sub">
              {latestAudit?.adAccount?.name || "No completed account audit selected"}
            </div>
          </div>
          {findings.length > 5 && <span className="pill">Top 5 of {findings.length}</span>}
        </div>

        {isLoading ? (
          <div className="empty-state">Loading priorities...</div>
        ) : priorities.length === 0 ? (
          <div className="empty-state priority-empty">
            <ClipboardList size={28} />
            <strong>No priorities yet</strong>
            <span>Complete an audit and the highest-impact findings will appear here.</span>
            <Link href="/dashboard/audits/new" className="btn btn-primary">Run an audit</Link>
          </div>
        ) : (
          <div className="pri-list">
            {priorities.map((finding, index) => (
              <article className="pri-item priority-detail" key={finding.id}>
                <div className={`pri-rank ${index < 3 ? "top" : ""}`}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="pri-body">
                  <div className="pri-title">{finding.title}</div>
                  <div className="pri-meta">
                    <span className={`sev ${severityClass[finding.severity]}`}>{finding.severity}</span>
                    <span className="pill">{finding.category}</span>
                    {finding.platform && <span className="pill">{finding.platform} Ads</span>}
                    {finding.estimatedImpact && (
                      <span className="pill impact-pill">{finding.estimatedImpact}</span>
                    )}
                  </div>
                  {finding.detail && <p className="priority-copy">{finding.detail}</p>}
                  {finding.fixSteps?.[0] && (
                    <p className="priority-next"><strong>Next action:</strong> {finding.fixSteps[0]}</p>
                  )}
                </div>
                <div className="pri-actions">
                  <Link href={reportHref} className={`btn btn-sm ${index < 2 ? "btn-primary" : "btn-ghost"}`}>
                    Review <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="impact-strip grid-3">
        <div className="impact-stat">
          <strong>{priorities.length}</strong>
          <span>Priority actions</span>
        </div>
        <div className="impact-stat">
          <strong className="good-text">{measured}</strong>
          <span>Measured impact estimates</span>
        </div>
        <div className="impact-stat">
          <strong className="violet-text">{priorities.filter((item) => item.fixSteps?.length).length}</strong>
          <span>Action plans ready</span>
        </div>
      </div>
    </DashboardShell>
  );
}
