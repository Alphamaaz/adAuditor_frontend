"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuditHistory } from "@/hooks/use-audits";
import type { AuditTrendPoint } from "@/lib/audits";

const WIDTH = 640;
const HEIGHT = 160;
const PAD_X = 24;
const PAD_Y = 16;
const POINT_R = 5;

const formatDate = (value: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

/**
 * Lightweight SVG sparkline of audit health scores over time. No charting
 * library — just math. Hovering a point opens a tooltip with score,
 * findings counts, and a quick link to that audit's results.
 *
 * If only one audit point is available, we still render the dot but skip
 * the trend line. If no points are available, we render an empty state
 * with a "Run your first audit" CTA so the dashboard always feels useful.
 */
export function ScoreTrendChart() {
  const { data, isLoading } = useAuditHistory({ limit: 20 });
  const [hovered, setHovered] = useState<{ point: AuditTrendPoint; x: number; y: number } | null>(
    null
  );

  const points = useMemo(() => {
    const trend = data || [];
    if (trend.length === 0) return [];
    const innerW = WIDTH - PAD_X * 2;
    const innerH = HEIGHT - PAD_Y * 2;
    const stepX = trend.length === 1 ? 0 : innerW / (trend.length - 1);

    return trend.map((point, index) => {
      const score = point.healthScore ?? 0;
      const x =
        trend.length === 1 ? WIDTH / 2 : PAD_X + stepX * index;
      const y = PAD_Y + innerH * (1 - Math.min(100, Math.max(0, score)) / 100);
      return { point, x, y };
    });
  }, [data]);

  const polylinePath = useMemo(() => {
    if (points.length < 2) return "";
    return points.map(({ x, y }, i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  }, [points]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
        <h2 className="text-base font-semibold text-[#171717]">Score trend</h2>
        <p className="mt-1 text-sm text-[#9ca3af]">Loading audit history...</p>
        <div className="mt-4 h-40 animate-pulse rounded bg-[#f5efe6]" />
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
        <h2 className="text-base font-semibold text-[#171717]">Score trend</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Run your first audit to start tracking your account&rsquo;s health
          over time.
        </p>
        <Link
          href="/dashboard/audits/new"
          className="mt-4 inline-flex rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d]"
        >
          New audit
        </Link>
      </section>
    );
  }

  const latest = data[data.length - 1];
  const earliest = data[0];
  const scoreDelta =
    typeof latest.healthScore === "number" &&
    typeof earliest.healthScore === "number" &&
    data.length > 1
      ? latest.healthScore - earliest.healthScore
      : null;

  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Score trend</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Health scores across your last {data.length} completed audit
            {data.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-[#171717]">
            {latest.healthScore ?? "-"}
          </span>
          {scoreDelta != null && (
            <span
              className={`text-sm font-semibold ${
                scoreDelta > 0
                  ? "text-[#1f4d3a]"
                  : scoreDelta < 0
                    ? "text-red-700"
                    : "text-[#6b7280]"
              }`}
            >
              {scoreDelta > 0 ? "+" : ""}
              {scoreDelta} pts
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Audit health score trend"
        >
          {/* baselines at 0/50/100 */}
          {[0, 50, 100].map((value) => {
            const y = PAD_Y + (HEIGHT - PAD_Y * 2) * (1 - value / 100);
            return (
              <g key={value}>
                <line
                  x1={PAD_X}
                  x2={WIDTH - PAD_X}
                  y1={y}
                  y2={y}
                  stroke="#ece7df"
                  strokeDasharray="2 4"
                />
                <text x={4} y={y + 3} fontSize="10" fill="#9ca3af">
                  {value}
                </text>
              </g>
            );
          })}

          {polylinePath && (
            <path
              d={polylinePath}
              fill="none"
              stroke="#1f4d3a"
              strokeWidth={2}
            />
          )}

          {points.map(({ point, x, y }) => (
            <g key={point.auditId}>
              <circle
                cx={x}
                cy={y}
                r={POINT_R}
                fill="#1f4d3a"
                stroke="white"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered({ point, x, y })}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 max-w-xs rounded-md border border-[#e5ddd0] bg-white px-3 py-2 text-xs shadow-md"
            style={{
              left: `min(calc(100% - 220px), ${(hovered.x / WIDTH) * 100}%)`,
              top: 0,
            }}
          >
            <p className="font-semibold text-[#171717]">
              {hovered.point.adAccount?.name || "Audit"}
            </p>
            <p className="mt-0.5 text-[#6b7280]">
              {formatDate(hovered.point.completedAt)} -{" "}
              {hovered.point.selectedPlatforms.join(", ")}
            </p>
            <p className="mt-1 font-semibold text-[#1f4d3a]">
              Score: {hovered.point.healthScore ?? "-"}/100
            </p>
            <p className="text-[#374151]">
              {hovered.point.findingCounts.total} findings -{" "}
              {hovered.point.findingCounts.CRITICAL} critical,{" "}
              {hovered.point.findingCounts.HIGH} high
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280]">
        <span>{formatDate(earliest.completedAt)}</span>
        <Link
          href="/dashboard/audits/compare"
          className="font-semibold text-[#1f4d3a] hover:underline"
        >
          Compare audits →
        </Link>
        <span>{formatDate(latest.completedAt)}</span>
      </div>
    </section>
  );
}
