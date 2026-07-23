"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { useAudit, useAudits } from "@/hooks/use-audits";
import type { Audit, RuleFinding } from "@/lib/audits";

const severityRank: Record<RuleFinding["severity"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function useDashboardAuditData() {
  const { data: currentUser, isLoading: authLoading } = useCurrentUser();
  const { data: audits = [], isLoading: auditsLoading } = useAudits(Boolean(currentUser));

  const latestCompleted = useMemo(
    () =>
      [...audits]
        .filter((audit) => audit.status === "COMPLETED")
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.updatedAt).getTime() -
            new Date(a.completedAt || a.updatedAt).getTime()
        )[0] as Audit | undefined,
    [audits]
  );

  const { data: latestAudit, isLoading: detailLoading } = useAudit(latestCompleted?.id || "");

  const findings = useMemo(
    () =>
      [...(latestAudit?.ruleFindings || [])].sort(
        (a, b) => severityRank[a.severity] - severityRank[b.severity]
      ),
    [latestAudit?.ruleFindings]
  );

  return {
    audits,
    latestAudit: latestAudit || latestCompleted,
    findings,
    quickWins: latestAudit?.aiReport?.output?.quickWins || [],
    isLoading: authLoading || auditsLoading || Boolean(latestCompleted && detailLoading),
  };
}
