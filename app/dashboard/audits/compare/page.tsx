"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, GitCompareArrows, TrendingDown, TrendingUp } from "lucide-react";
import { DashboardShell } from "../../_components/DashboardShell";
import { useAuditComparison, useAuditHistory } from "@/hooks/use-audits";
import type { AuditComparisonDelta, AuditTrendPoint } from "@/lib/audits";

const formatDate = (value: string | null) => {
  if (!value) return "Not completed";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatNumber = (value: number | null) =>
  value == null ? "-" : new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);

export default function AuditCompareRoute() {
  return (
    <Suspense fallback={<DashboardShell active="compare" section="Compare"><div className="card empty-state">Loading comparison...</div></DashboardShell>}>
      <AuditComparePage />
    </Suspense>
  );
}

function AuditComparePage() {
  const search = useSearchParams();
  const { data: history = [], isLoading: historyLoading } = useAuditHistory({ limit: 30 });
  const [leftId, setLeftId] = useState<string | null>(search.get("left"));
  const [rightId, setRightId] = useState<string | null>(search.get("right"));

  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(a.completedAt || a.createdAt).getTime() -
          new Date(b.completedAt || b.createdAt).getTime()
      ),
    [history]
  );

  const selectedLeftId = leftId || (sorted.length >= 2 ? sorted[sorted.length - 2].auditId : null);
  const selectedRightId = rightId || (sorted.length >= 2 ? sorted[sorted.length - 1].auditId : null);
  const { data: comparison, isLoading, isError } = useAuditComparison(selectedLeftId, selectedRightId);

  return (
    <DashboardShell active="compare" section="Compare">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Performance comparison</div>
          <h1 className="page-h1">Compare <span className="em">audits</span>.</h1>
          <p className="page-h1-sub">
            Put an older audit beside a newer one to see score movement, issue changes, and performance deltas.
          </p>
        </div>
        <div className="page-head-actions">
          <Link href="/dashboard/audits/new" className="btn btn-primary">Run another audit <ArrowRight size={14} /></Link>
        </div>
      </div>

      <section className="compare-picker">
        <AuditPicker label="Baseline audit" value={selectedLeftId} audits={history} disabled={historyLoading} excludeId={selectedRightId} onChange={setLeftId} />
        <div className="compare-switch"><GitCompareArrows size={19} /></div>
        <AuditPicker label="Current audit" value={selectedRightId} audits={history} disabled={historyLoading} excludeId={selectedLeftId} onChange={setRightId} />
      </section>

      {history.length < 2 && !historyLoading && (
        <div className="card empty-state priority-empty">
          <GitCompareArrows size={28} />
          <strong>Two completed audits are required</strong>
          <span>Run another audit to unlock before-and-after comparison.</span>
          <Link href="/dashboard/audits/new" className="btn btn-primary">Run an audit</Link>
        </div>
      )}

      {isLoading && <div className="card empty-state">Building comparison...</div>}
      {isError && <div className="alert error">This comparison could not be loaded. Select two completed audits from the same workspace.</div>}

      {comparison && (
        <div className="compare-results">
          <section className="compare-score-panel">
            <ScoreSide label="Baseline" score={comparison.left.healthScore} account={comparison.left.adAccount?.name} date={comparison.left.completedAt} auditId={comparison.left.auditId} />
            <ScoreDelta delta={comparison.deltas.healthScore} />
            <ScoreSide label="Current" score={comparison.right.healthScore} account={comparison.right.adAccount?.name} date={comparison.right.completedAt} auditId={comparison.right.auditId} />
          </section>

          <div className="compare-grid">
            <section className="card compare-card">
              <div className="card-h">
                <div><div className="card-title-lg">Issue movement</div><div className="card-sub">Fewer findings is better</div></div>
              </div>
              <ComparisonTable rows={[
                ["Total findings", comparison.left.findingCounts.total, comparison.right.findingCounts.total, comparison.deltas.totalFindings, true],
                ["Critical", comparison.left.findingCounts.CRITICAL, comparison.right.findingCounts.CRITICAL, comparison.deltas.critical, true],
                ["High", comparison.left.findingCounts.HIGH, comparison.right.findingCounts.HIGH, comparison.deltas.high, true],
                ["Medium", comparison.left.findingCounts.MEDIUM, comparison.right.findingCounts.MEDIUM, comparison.deltas.medium, true],
                ["Low", comparison.left.findingCounts.LOW, comparison.right.findingCounts.LOW, comparison.deltas.low, true],
              ]} />
            </section>

            <section className="card compare-card">
              <div className="card-h">
                <div><div className="card-title-lg">Performance movement</div><div className="card-sub">Aggregated account metrics</div></div>
              </div>
              <ComparisonTable rows={[
                ["Spend", comparison.left.spend, comparison.right.spend, comparison.deltas.spend, false],
                ["Impressions", comparison.left.impressions, comparison.right.impressions, comparison.deltas.impressions, false],
                ["Clicks", comparison.left.clicks, comparison.right.clicks, comparison.deltas.clicks, false],
                ["Conversions", comparison.left.conversions, comparison.right.conversions, comparison.deltas.conversions, false],
              ]} />
            </section>
          </div>

          <section className="comparison-summary-strip">
            <div><span>Resolved</span><strong className="good-text">{comparison.rulesDiff.resolved.length}</strong></div>
            <div><span>Newly detected</span><strong>{comparison.rulesDiff.new.length}</strong></div>
            <div><span>Still active</span><strong className="violet-text">{comparison.rulesDiff.persisted.length}</strong></div>
            <p>Review resolved, new, and persistent issues across the two audit periods.</p>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}

function AuditPicker({
  label,
  value,
  audits,
  disabled,
  excludeId,
  onChange,
}: {
  label: string;
  value: string | null;
  audits: AuditTrendPoint[];
  disabled: boolean;
  excludeId: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <label className="compare-field">
      <span>{label}</span>
      <select value={value || ""} disabled={disabled} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">Select an audit</option>
        {[...audits].reverse().map((audit) => (
          <option key={audit.auditId} value={audit.auditId} disabled={audit.auditId === excludeId}>
            {audit.adAccount?.name || "Audit"} / {formatDate(audit.completedAt)} / {audit.healthScore ?? "-"}/100
          </option>
        ))}
      </select>
    </label>
  );
}

function ScoreSide({ label, score, account, date, auditId }: { label: string; score: number | null; account?: string; date: string | null; auditId: string }) {
  return (
    <div className="compare-score-side">
      <span className="summary-label">{label}</span>
      <strong>{score ?? "-"}<small>/100</small></strong>
      <p>{account || "Audit"}<br />{formatDate(date)}</p>
      <Link href={`/dashboard/audits/${auditId}/results`}>Open report <ArrowRight size={13} /></Link>
    </div>
  );
}

function ScoreDelta({ delta }: { delta: AuditComparisonDelta }) {
  const value = delta.delta;
  const improved = typeof value === "number" && value > 0;
  const declined = typeof value === "number" && value < 0;
  return (
    <div className={`compare-score-delta ${improved ? "improved" : declined ? "declined" : ""}`}>
      {improved ? <TrendingUp size={20} /> : declined ? <TrendingDown size={20} /> : <GitCompareArrows size={20} />}
      <strong>{value == null ? "-" : `${value > 0 ? "+" : ""}${value}`}</strong>
      <span>score change</span>
    </div>
  );
}

type ComparisonRow = [string, number | null, number | null, AuditComparisonDelta, boolean];

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="compare-table">
      <div className="compare-table-head"><span>Metric</span><span>Before</span><span>After</span><span>Change</span></div>
      {rows.map(([label, before, after, delta, inverse]) => {
        const value = delta.delta;
        const favorable = typeof value === "number" && (inverse ? value < 0 : value > 0);
        return (
          <div className="compare-table-row" key={label}>
            <span>{label}</span>
            <span>{formatNumber(before)}</span>
            <span>{formatNumber(after)}</span>
            <span className={favorable ? "good-text" : ""}>{value == null ? "-" : `${value > 0 ? "+" : ""}${formatNumber(value)}`}</span>
          </div>
        );
      })}
    </div>
  );
}
