"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange, CheckCircle2, Clock3, Target } from "lucide-react";
import { DashboardShell } from "../_components/DashboardShell";
import { useDashboardAuditData } from "../_components/useDashboardAuditData";
import { useLocalRecord } from "@/hooks/use-local-record";

const severityClass: Record<string, string> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

type RoadmapWindow = "today" | "week" | "month";

export default function RoadmapPage() {
  const { latestAudit, findings, isLoading } = useDashboardAuditData();
  const [window, setWindow] = useState<RoadmapWindow>("today");
  const [completedTasks, setCompletedTasks] = useLocalRecord<Record<string, boolean>>("aa-roadmap-completed");
  const reportHref = latestAudit ? `/dashboard/audits/${latestAudit.id}/results` : "/dashboard";

  const ranked = findings.filter((finding) => finding.fixSteps?.length || finding.detail);
  const ranges: Record<RoadmapWindow, typeof ranked> = {
    today: ranked.slice(0, 3),
    week: ranked.slice(3, 7).length ? ranked.slice(3, 7) : ranked.slice(0, 4),
    month: ranked.slice(7, 12).length ? ranked.slice(7, 12) : ranked.slice(0, 5),
  };
  const items = ranges[window];
  const completedCount = items.filter((item) => completedTasks[item.id]).length;

  const toggleCompleted = (findingId: string) => {
    setCompletedTasks({ ...completedTasks, [findingId]: !completedTasks[findingId] });
  };

  return (
    <DashboardShell active="roadmap" section="Roadmap">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Execution roadmap</div>
          <h1 className="page-h1">Turn insight into <span className="em">action</span>.</h1>
          <p className="page-h1-sub">
            A practical sequence for implementing the latest audit recommendations without changing everything at once.
          </p>
        </div>
        <div className="page-head-actions">
          <Link href={reportHref} className="btn btn-primary">Open latest report <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="roadmap-tabs" role="tablist" aria-label="Roadmap period">
        {([
          ["today", "Today"],
          ["week", "This week"],
          ["month", "This month"],
        ] as const).map(([key, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={window === key}
            className={window === key ? "active" : ""}
            key={key}
            onClick={() => setWindow(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="roadmap-metrics">
        <div><Target size={18} /><span><strong>{items.length}</strong>Recommended changes</span></div>
        <div><CheckCircle2 size={18} /><span><strong>{completedCount}/{items.length}</strong>Completed</span></div>
        <div><CalendarRange size={18} /><span><strong>{window === "today" ? "24h" : window === "week" ? "7d" : "30d"}</strong>Execution window</span></div>
      </div>

      {isLoading ? (
        <div className="card empty-state">Loading roadmap...</div>
      ) : items.length === 0 ? (
        <div className="card empty-state priority-empty">
          <CalendarRange size={28} />
          <strong>No roadmap yet</strong>
          <span>Complete an audit to build an account-specific execution sequence.</span>
          <Link href="/dashboard/audits/new" className="btn btn-primary">Run an audit</Link>
        </div>
      ) : (
        <div className="roadmap-list">
          {items.map((finding, index) => (
            <article className={`roadmap-item ${completedTasks[finding.id] ? "completed" : ""}`} key={finding.id}>
              <div className={`roadmap-rank rank-${severityClass[finding.severity]}`}>{String(index + 1).padStart(2, "0")}</div>
              <div className="roadmap-body">
                <div className="roadmap-title-row">
                  <h2>{finding.title}</h2>
                  <span className={`sev ${severityClass[finding.severity]}`}>{finding.severity}</span>
                  <span className="pill">{finding.category}</span>
                </div>
                <p>{finding.detail || finding.fixSteps?.[0]}</p>
                <div className="roadmap-meta">
                  <span><Clock3 size={13} /> Step {index + 1}</span>
                  {finding.estimatedImpact && <span className="good-text">{finding.estimatedImpact}</span>}
                  {finding.platform && <span>{finding.platform} Ads</span>}
                </div>
              </div>
              <div className="roadmap-actions">
                <button type="button" className={`btn btn-sm ${completedTasks[finding.id] ? "btn-complete" : "btn-ghost"}`} onClick={() => toggleCompleted(finding.id)}>
                  <CheckCircle2 size={13} /> {completedTasks[finding.id] ? "Completed" : "Mark done"}
                </button>
                <Link href={reportHref} className="btn btn-sm btn-ghost">Review <ArrowRight size={13} /></Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
