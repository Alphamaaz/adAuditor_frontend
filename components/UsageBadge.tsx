"use client";

import Link from "next/link";
import { useMyPlanAndUsage } from "@/hooks/use-plans";

/**
 * Compact plan + usage indicator for the dashboard. Shows:
 *   - Current plan name (Starter / Pro / Agency / Free)
 *   - Audits used this period vs the cap
 *   - A subtle progress bar that turns warning/critical near the cap
 *   - Upgrade CTA when on Free, or when at/over cap
 *
 * Hidden while loading to avoid layout shift; renders nothing on error too —
 * the dashboard works fine without this badge.
 */
export function UsageBadge() {
  const { data, isLoading, isError } = useMyPlanAndUsage();

  if (isLoading || isError || !data) return null;

  const { plan, usage } = data;
  const limit = usage.monthlyAuditLimit;
  const used = usage.auditsRun;
  const isUnlimited = limit == null;
  const remaining = isUnlimited ? null : Math.max(0, limit - used);
  const percent = isUnlimited
    ? 0
    : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  const tone = isUnlimited
    ? "ok"
    : remaining === 0
      ? "critical"
      : percent >= 80
        ? "warn"
        : "ok";

  const barColor =
    tone === "critical"
      ? "bg-red-500"
      : tone === "warn"
        ? "bg-yellow-500"
        : "bg-[#1f4d3a]";

  const showUpgrade =
    plan.slug === "free" ||
    (tone === "critical" && plan.slug !== "agency");

  return (
    <div className="rounded-lg border border-[#e5ddd0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
            Plan
          </p>
          <p className="mt-1 text-lg font-semibold text-[#171717]">
            {plan.name}
          </p>
        </div>
        {showUpgrade && (
          <Link
            href="/pricing"
            className="rounded-md border border-[#1f4d3a] px-3 py-1.5 text-xs font-semibold text-[#1f4d3a] hover:bg-[#f0f7ee]"
          >
            Upgrade
          </Link>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-[#374151]">
            {isUnlimited
              ? "Unlimited audits this period"
              : `${used} of ${limit} audits used`}
          </span>
          {!isUnlimited && (
            <span
              className={`text-xs font-semibold ${
                tone === "critical"
                  ? "text-red-700"
                  : tone === "warn"
                    ? "text-yellow-700"
                    : "text-[#1f4d3a]"
              }`}
            >
              {remaining} left
            </span>
          )}
        </div>
        {!isUnlimited && (
          <div className="mt-2 h-1.5 rounded-full bg-[#e5ddd0]">
            <div
              className={`h-1.5 rounded-full transition-all ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>

      {tone === "critical" && (
        <p className="mt-3 text-xs leading-5 text-red-700">
          You&rsquo;ve reached your monthly audit limit. Upgrade to run more.
        </p>
      )}
      {tone === "warn" && (
        <p className="mt-3 text-xs leading-5 text-yellow-800">
          You&rsquo;re close to your monthly audit limit.
        </p>
      )}
    </div>
  );
}
