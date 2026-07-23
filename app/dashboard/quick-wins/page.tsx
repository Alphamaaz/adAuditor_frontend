"use client";

import Link from "next/link";
import { ArrowRight, Download, Sparkles, Zap } from "lucide-react";
import { DashboardShell } from "../_components/DashboardShell";
import { useDashboardAuditData } from "../_components/useDashboardAuditData";
import { datedFilename, downloadCsv } from "@/lib/dashboard-exports";

interface QuickWinView {
  ruleId: string;
  platform: string | null;
  title: string;
  fixSteps: string[];
  impact: string | null;
}

export default function QuickWinsPage() {
  const { latestAudit, findings, quickWins, isLoading } = useDashboardAuditData();
  const reportHref = latestAudit ? `/dashboard/audits/${latestAudit.id}/results` : "/dashboard";
  const fallbackWins: QuickWinView[] = findings
    .filter((finding) => finding.fixSteps?.length)
    .slice(0, 9)
    .map((finding) => ({
      ruleId: finding.ruleId,
      platform: finding.platform,
      title: finding.title,
      fixSteps: finding.fixSteps || [],
      impact: finding.estimatedImpact,
    }));
  const wins: QuickWinView[] = (quickWins.length
    ? quickWins.map((win) => ({
        ruleId: win.ruleId,
        platform: win.platform,
        title: win.title,
        fixSteps: win.fixSteps || [],
        impact: findings.find((finding) => finding.ruleId === win.ruleId)?.estimatedImpact || null,
      }))
    : fallbackWins
  ).slice(0, 9);

  const exportQuickWins = () => {
    downloadCsv(
      datedFilename("adadviser-quick-wins"),
      ["Action", "Platform", "Estimated impact", "Implementation steps"],
      wins.map((win) => [
        win.title,
        win.platform || "Account-wide",
        win.impact || "Review report",
        win.fixSteps.join(" | "),
      ])
    );
  };

  return (
    <DashboardShell active="quick-wins" section="Quick Wins">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Fast actions</div>
          <h1 className="page-h1">Quick <span className="em">wins</span>.</h1>
          <p className="page-h1-sub">
            Practical actions from the latest audit that can be shipped without a broader account rebuild.
          </p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn btn-ghost" onClick={exportQuickWins} disabled={!wins.length}>
            <Download size={14} /> Export task list
          </button>
          <Link href="/dashboard/audits/new" className="btn btn-primary">
            <Zap size={14} /> New Audit
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="card empty-state">Loading quick wins...</div>
      ) : wins.length === 0 ? (
        <div className="card empty-state priority-empty">
          <Sparkles size={28} />
          <strong>No quick wins yet</strong>
          <span>Run an audit to generate account-specific actions.</span>
          <Link href="/dashboard/audits/new" className="btn btn-primary">Run an audit</Link>
        </div>
      ) : (
        <div className="quick-win-grid">
          {wins.map((win, index) => {
            return (
              <article className="qw-card" key={`${win.ruleId}-${index}`}>
                <div className="qw-h">
                  <div className="qw-mark"><Zap size={16} strokeWidth={2} /></div>
                  <div>
                    <div className="qw-title">{win.title}</div>
                    {win.platform && <span className="qw-platform">{win.platform} Ads</span>}
                  </div>
                </div>
                <div className="qw-desc">
                  {win.fixSteps?.[0] || "Open the full report for the recommended implementation steps."}
                </div>
                <div className="qw-foot">
                  <span className="qw-impact">{win.impact || `${win.fixSteps.length || 1} action step${win.fixSteps.length === 1 ? "" : "s"}`}</span>
                  <Link href={reportHref} className="btn btn-sm btn-ghost" aria-label={`Review ${win.title}`}>
                    Review <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {wins.length > 0 && (
        <section className="quick-win-summary">
          <div>
            <span className="summary-label">Ready to action</span>
            <strong>{wins.length}</strong>
          </div>
          <div className="summary-divider" />
          <p>
            These actions come from your latest completed audit. Review the supporting evidence before changing live campaigns.
          </p>
          <Link href={reportHref} className="btn btn-primary">Open report <ArrowRight size={14} /></Link>
        </section>
      )}
    </DashboardShell>
  );
}
