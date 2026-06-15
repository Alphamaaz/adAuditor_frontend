"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useAudits } from "@/hooks/use-audits";
import { useMyPlanAndUsage } from "@/hooks/use-plans";
import { getAuditResumePath } from "@/lib/audit-navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

interface DashboardShellProps {
  active: string;
  section: string;
  children: React.ReactNode;
}

/**
 * Shared dashboard chrome — ambient glow, sidebar, topbar — plus the
 * auth-guard redirect every dashboard page needs. Pages render their own
 * `.content` inside `children`. The dashboard home page builds its own shell
 * because it needs the same data anyway; everything else uses this.
 */
export function DashboardShell({ active, section, children }: DashboardShellProps) {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();
  const isAuthenticated = Boolean(data);
  const { data: audits = [] } = useAudits(isAuthenticated);
  const { data: planData } = useMyPlanAndUsage(isAuthenticated);
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !data) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isLoading, data, router]);

  if (isLoading || !data) {
    return (
      <div className="aa-dash">
        <div className="ambient" />
        <div className="app-shell">
          <div className="main">
            <div className="content">
              <p style={{ color: "var(--hint)" }}>Loading…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, organizations } = data;
  const org = organizations[0];
  const planLabel = planData?.plan?.name || null;

  const latestScored = [...audits]
    .filter((audit) => audit.status === "COMPLETED" && typeof audit.healthScore === "number")
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.updatedAt).getTime() -
        new Date(a.completedAt || a.updatedAt).getTime()
    )[0];

  return (
    <div className="aa-dash">
      <div className="ambient" />
      <div className="app-shell">
        <DashboardSidebar
          active={active}
          userName={user.name || ""}
          userEmail={user.email}
          orgName={org?.name}
          planLabel={planLabel}
          resultsHref={latestScored ? getAuditResumePath(latestScored) : null}
          onLogout={() => logout.mutate()}
          loggingOut={logout.isPending}
        />
        <div className="main">
          <DashboardTopbar section={section} planLabel={planLabel} />
          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  );
}
