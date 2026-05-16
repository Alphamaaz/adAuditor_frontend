"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  useAuditComparison,
  useAuditHistory,
} from "@/hooks/use-audits";
import type {
  AuditComparisonDelta,
  AuditComparisonSide,
  AuditTrendPoint,
} from "@/lib/audits";

const formatDate = (value: string | null) => {
  if (!value) return "Not completed";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatNumber = (value: number | null) =>
  value == null ? "-" : value.toLocaleString();

/**
 * Compare two audits side-by-side. The route accepts ?left=ID&right=ID;
 * if either is missing, we render two pickers populated from the user's
 * audit history. Convention: left = older, right = newer (deltas read
 * "good" when scores went up, findings went down).
 */
export default function AuditCompareRoute() {
  return (
    <Suspense fallback={null}>
      <AuditComparePage />
    </Suspense>
  );
}

function AuditComparePage() {
  const search = useSearchParams();
  const queryLeft = search.get("left");
  const queryRight = search.get("right");

  const { data: history = [], isLoading: historyLoading } = useAuditHistory({
    limit: 30,
  });

  const [leftId, setLeftId] = useState<string | null>(queryLeft);
  const [rightId, setRightId] = useState<string | null>(queryRight);

  // If the URL doesn't pre-select audits, default to the two most recent
  // completed audits so the page is immediately useful.
  useEffect(() => {
    if (history.length < 2) return;
    if (leftId && rightId) return;
    const sorted = [...history].sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return aTime - bTime;
    });
    if (!leftId) setLeftId(sorted[sorted.length - 2].auditId);
    if (!rightId) setRightId(sorted[sorted.length - 1].auditId);
  }, [history, leftId, rightId]);

  const {
    data: comparison,
    isLoading: comparisonLoading,
    isError,
  } = useAuditComparison(leftId, rightId);

  const sameAudit = leftId && rightId && leftId === rightId;

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

      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#171717]">
            Compare audits
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Pick an older audit on the left and a newer one on the right. We
            highlight what changed — score, severity counts, spend, and which
            rule findings were resolved or appeared.
          </p>
        </header>

        <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <AuditPicker
              label="Older (baseline)"
              value={leftId}
              audits={history}
              loading={historyLoading}
              onChange={setLeftId}
              excludeId={rightId}
            />
            <AuditPicker
              label="Newer (current)"
              value={rightId}
              audits={history}
              loading={historyLoading}
              onChange={setRightId}
              excludeId={leftId}
            />
          </div>

          {sameAudit && (
            <p className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              You picked the same audit on both sides. Choose two different
              audits to see deltas.
            </p>
          )}

          {history.length < 2 && !historyLoading && (
            <p className="mt-4 rounded-md border border-[#e5ddd0] bg-[#faf9f7] px-4 py-3 text-sm text-[#6b7280]">
              You need at least two completed audits to compare. Run another
              audit and come back.
            </p>
          )}
        </section>

        {comparisonLoading && (
          <p className="mt-6 text-sm text-[#6b7280]">Loading comparison...</p>
        )}

        {isError && (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&rsquo;t load that comparison. The audits may not be in your
            organization, or one of them isn&rsquo;t completed.
          </p>
        )}

        {comparison && (
          <div className="mt-6 space-y-6">
            <ScoreSummaryCard comparison={comparison} />
            <FindingsBreakdownCard comparison={comparison} />
            <RulesDiffCard comparison={comparison} />
            <PerformanceDeltasCard comparison={comparison} />
          </div>
        )}
      </main>
    </div>
  );
}

function AuditPicker({
  label,
  value,
  audits,
  loading,
  onChange,
  excludeId,
}: {
  label: string;
  value: string | null;
  audits: AuditTrendPoint[];
  loading: boolean;
  onChange: (id: string | null) => void;
  excludeId: string | null;
}) {
  const sorted = useMemo(() => {
    return [...audits].sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [audits]);

  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
        {label}
      </span>
      <select
        value={value || ""}
        disabled={loading}
        onChange={(event) => onChange(event.target.value || null)}
        className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2 text-sm text-[#171717]"
      >
        <option value="">Select an audit...</option>
        {sorted.map((audit) => {
          const account = audit.adAccount?.name || "Audit";
          const date = formatDate(audit.completedAt);
          const score = audit.healthScore ?? "-";
          const platforms = audit.selectedPlatforms.join(", ");
          const isExcluded = audit.auditId === excludeId;
          return (
            <option
              key={audit.auditId}
              value={audit.auditId}
              disabled={isExcluded}
            >
              {date} - {account} ({platforms}) - {score}/100
            </option>
          );
        })}
      </select>
    </label>
  );
}

function DeltaPill({ delta }: { delta: AuditComparisonDelta }) {
  if (delta.delta == null) {
    return <span className="text-xs text-[#9ca3af]">no change data</span>;
  }
  if (delta.delta === 0) {
    return <span className="text-xs font-semibold text-[#6b7280]">No change</span>;
  }
  const positive = delta.delta > 0;
  const cls = positive ? "text-[#1f4d3a]" : "text-red-700";
  const arrow = positive ? "↑" : "↓";
  const pctText =
    delta.deltaPct == null ? "" : ` (${positive ? "+" : ""}${delta.deltaPct}%)`;
  return (
    <span className={`text-xs font-semibold ${cls}`}>
      {arrow} {Math.abs(delta.delta).toLocaleString()}
      {pctText}
    </span>
  );
}

/**
 * For findings counts, "fewer" is good. Wrap the standard delta pill so the
 * arrow color flips meaning.
 */
function FindingDeltaPill({ delta }: { delta: AuditComparisonDelta }) {
  if (delta.delta == null) {
    return <span className="text-xs text-[#9ca3af]">no change data</span>;
  }
  if (delta.delta === 0) {
    return <span className="text-xs font-semibold text-[#6b7280]">No change</span>;
  }
  const dropped = delta.delta < 0;
  const cls = dropped ? "text-[#1f4d3a]" : "text-red-700";
  const arrow = dropped ? "↓" : "↑";
  return (
    <span className={`text-xs font-semibold ${cls}`}>
      {arrow} {Math.abs(delta.delta).toLocaleString()} {dropped ? "fewer" : "more"}
    </span>
  );
}

function ScoreSummaryCard({
  comparison,
}: {
  comparison: { left: AuditComparisonSide; right: AuditComparisonSide; deltas: { healthScore: AuditComparisonDelta } };
}) {
  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#171717]">Health score</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ScoreSide side={comparison.left} label="Older (baseline)" />
        <div className="flex flex-col items-center justify-center rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Score change
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#171717]">
            <DeltaPill delta={comparison.deltas.healthScore} />
          </p>
        </div>
        <ScoreSide side={comparison.right} label="Newer (current)" />
      </div>
    </section>
  );
}

function ScoreSide({ side, label }: { side: AuditComparisonSide; label: string }) {
  return (
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-[#171717]">
        {side.healthScore ?? "-"}
        <span className="ml-1 text-base font-medium text-[#6b7280]">/100</span>
      </p>
      <p className="mt-1 text-xs text-[#6b7280]">
        {side.adAccount?.name || "Audit"} - {formatDate(side.completedAt)}
      </p>
      <p className="mt-1 text-xs text-[#6b7280]">
        {side.selectedPlatforms.join(", ")}
      </p>
      <Link
        href={`/dashboard/audits/${side.auditId}/results`}
        className="mt-3 inline-block text-xs font-semibold text-[#1f4d3a] hover:underline"
      >
        View report →
      </Link>
    </div>
  );
}

function FindingsBreakdownCard({
  comparison,
}: {
  comparison: {
    left: AuditComparisonSide;
    right: AuditComparisonSide;
    deltas: {
      totalFindings: AuditComparisonDelta;
      critical: AuditComparisonDelta;
      high: AuditComparisonDelta;
      medium: AuditComparisonDelta;
      low: AuditComparisonDelta;
    };
  };
}) {
  const rows: {
    key: keyof AuditComparisonSide["findingCounts"];
    label: string;
    delta: AuditComparisonDelta;
  }[] = [
    { key: "total", label: "Total findings", delta: comparison.deltas.totalFindings },
    { key: "CRITICAL", label: "Critical", delta: comparison.deltas.critical },
    { key: "HIGH", label: "High", delta: comparison.deltas.high },
    { key: "MEDIUM", label: "Medium", delta: comparison.deltas.medium },
    { key: "LOW", label: "Low", delta: comparison.deltas.low },
  ];

  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#171717]">
        Findings breakdown
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#ece7df] text-left text-xs uppercase text-[#6b7280]">
              <th className="py-2 pr-4">Severity</th>
              <th className="py-2 pr-4">Older</th>
              <th className="py-2 pr-4">Newer</th>
              <th className="py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-[#ece7df] last:border-0">
                <td className="py-3 pr-4 font-medium text-[#374151]">
                  {row.label}
                </td>
                <td className="py-3 pr-4 text-[#171717]">
                  {comparison.left.findingCounts[row.key]}
                </td>
                <td className="py-3 pr-4 text-[#171717]">
                  {comparison.right.findingCounts[row.key]}
                </td>
                <td className="py-3">
                  <FindingDeltaPill delta={row.delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RulesDiffCard({
  comparison,
}: {
  comparison: { rulesDiff: { new: string[]; resolved: string[]; persisted: string[] } };
}) {
  const { rulesDiff } = comparison;
  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#171717]">Rule changes</h2>
      <p className="mt-1 text-sm text-[#6b7280]">
        Rules that flipped between the two audits, plus the persistent ones
        you still need to address.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <RulesColumn
          label="Resolved"
          tone="good"
          rules={rulesDiff.resolved}
          emptyText="None — no rules dropped between audits."
        />
        <RulesColumn
          label="Newly flagged"
          tone="bad"
          rules={rulesDiff.new}
          emptyText="None — no new rules in the newer audit."
        />
        <RulesColumn
          label="Persisted"
          tone="neutral"
          rules={rulesDiff.persisted}
          emptyText="None — no rules carried over."
        />
      </div>
    </section>
  );
}

function RulesColumn({
  label,
  tone,
  rules,
  emptyText,
}: {
  label: string;
  tone: "good" | "bad" | "neutral";
  rules: string[];
  emptyText: string;
}) {
  const styles = {
    good: "border-[#b8d9c3] bg-[#eff7f1] text-[#1f4d3a]",
    bad: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-[#eee7dc] bg-[#faf9f7] text-[#374151]",
  } as const;

  return (
    <div className={`rounded-md border p-4 ${styles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">
        {label} ({rules.length})
      </p>
      {rules.length === 0 ? (
        <p className="mt-2 text-xs">{emptyText}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1">
          {rules.map((ruleId) => (
            <li
              key={ruleId}
              className="rounded border border-current/20 bg-white/50 px-2 py-1 text-xs font-semibold"
            >
              {ruleId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PerformanceDeltasCard({
  comparison,
}: {
  comparison: {
    left: AuditComparisonSide;
    right: AuditComparisonSide;
    deltas: {
      spend: AuditComparisonDelta;
      impressions: AuditComparisonDelta;
      clicks: AuditComparisonDelta;
      conversions: AuditComparisonDelta;
    };
  };
}) {
  const rows: {
    label: string;
    leftValue: number | null;
    rightValue: number | null;
    delta: AuditComparisonDelta;
  }[] = [
    {
      label: "Spend",
      leftValue: comparison.left.spend,
      rightValue: comparison.right.spend,
      delta: comparison.deltas.spend,
    },
    {
      label: "Impressions",
      leftValue: comparison.left.impressions,
      rightValue: comparison.right.impressions,
      delta: comparison.deltas.impressions,
    },
    {
      label: "Clicks",
      leftValue: comparison.left.clicks,
      rightValue: comparison.right.clicks,
      delta: comparison.deltas.clicks,
    },
    {
      label: "Conversions",
      leftValue: comparison.left.conversions,
      rightValue: comparison.right.conversions,
      delta: comparison.deltas.conversions,
    },
  ];

  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#171717]">Performance deltas</h2>
      <p className="mt-1 text-sm text-[#6b7280]">
        Aggregated across all uploaded reports for each audit. Currency follows
        whatever was detected on upload.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#ece7df] text-left text-xs uppercase text-[#6b7280]">
              <th className="py-2 pr-4">Metric</th>
              <th className="py-2 pr-4">Older</th>
              <th className="py-2 pr-4">Newer</th>
              <th className="py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[#ece7df] last:border-0">
                <td className="py-3 pr-4 font-medium text-[#374151]">{row.label}</td>
                <td className="py-3 pr-4 text-[#171717]">{formatNumber(row.leftValue)}</td>
                <td className="py-3 pr-4 text-[#171717]">{formatNumber(row.rightValue)}</td>
                <td className="py-3">
                  <DeltaPill delta={row.delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
