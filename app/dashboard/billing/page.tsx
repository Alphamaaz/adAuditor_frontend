"use client";

import Link from "next/link";
import { usePlans, useMyPlanAndUsage } from "@/hooks/use-plans";
import { fallbackPlans, type SubscriptionPlan } from "@/lib/plans";
import { DashboardShell } from "../_components/DashboardShell";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PLAN_BLURBS: Record<string, string> = {
  starter: "Run lean — perfect for an in-house marketer auditing one or two accounts.",
  pro: "Built for performance marketers managing multiple accounts and platforms in lockstep.",
  agency: "Unlimited audits, client workspaces, and your branding everywhere clients look.",
};

const planFeatures = (plan: SubscriptionPlan): string[] => {
  if (plan.features?.notes && plan.features.notes.length > 0) {
    return plan.features.notes;
  }
  const limit =
    plan.monthlyAuditLimit == null
      ? "Unlimited analyses"
      : `${plan.monthlyAuditLimit} analyses per month`;
  const platforms =
    plan.platformLimit == null || plan.platformLimit >= 3
      ? "All ad platforms"
      : `${plan.platformLimit} platform per audit`;
  return [limit, platforms, "PDF report export"];
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
};

const daysLeft = (end: string | null) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const isUnlimited = limit == null;
  const pct = isUnlimited ? 12 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className="usage-bar">
      <div className="usage-bar-h">
        <span className="l">{label}</span>
        <span className="v">{used} / {isUnlimited ? "unlimited" : limit}</span>
      </div>
      <div className="usage-bar-track">
        <div
          className="usage-bar-fill"
          style={{ width: `${pct}%`, ...(isUnlimited ? { background: "var(--lime)" } : {}) }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: apiPlans } = usePlans();
  const { data: planUsage } = useMyPlanAndUsage();

  const plans = (apiPlans && apiPlans.length > 0 ? apiPlans : fallbackPlans).filter((p) => p.isActive);
  const currentSlug = planUsage?.plan?.slug || "free";
  const usage = planUsage?.usage;
  const periodLeft = usage ? daysLeft(usage.periodEnd) : null;

  const upgradeTarget = plans.find((p) => p.slug === "agency" && p.slug !== currentSlug);

  return (
    <DashboardShell active="billing" section="Billing">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Billing &amp; usage</div>
          <h1 className="page-h1">
            Plan &amp; <span className="em">usage</span>
          </h1>
          <p className="page-h1-sub">
            {planUsage
              ? `You're on ${planUsage.plan.name}. ${
                  usage?.periodEnd ? `Current cycle renews ${formatDate(usage.periodEnd)}.` : ""
                } Manage your plan and track usage below.`
              : "Choose the plan that fits how you run audits."}
          </p>
        </div>
        {upgradeTarget && (
          <div className="page-head-actions">
            <Link href="/pricing" className="btn btn-primary">
              Upgrade to {upgradeTarget.name}
            </Link>
          </div>
        )}
      </div>

      <div className="plan-grid">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentSlug;
          return (
            <div className={`plan-card ${isCurrent ? "current" : ""}`} key={plan.id || plan.slug}>
              <div className="plan-tier">{plan.name}</div>
              <div className="plan-name">{plan.formattedPrice}<span style={{ fontSize: 13, color: "var(--hint)", fontFamily: "var(--font-mono)" }}> / mo</span></div>
              <div className="plan-blurb">
                {plan.description || PLAN_BLURBS[plan.slug] || ""}
              </div>
              <div className="plan-feats">
                {planFeatures(plan).map((feat, i) => (
                  <div className="f" key={i}>
                    <CheckIcon />
                    {feat}
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <button className="btn btn-ghost" disabled style={{ width: "100%" }}>
                  Current plan
                </button>
              ) : (
                <Link href="/pricing" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                  Switch to {plan.name}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ marginBottom: 22 }}>
        <div className="usage-card">
          <div className="card-h">
            <div>
              <div className="card-title-lg">Usage this <span className="em">cycle</span></div>
              <div className="card-sub">
                {usage ? `${formatDate(usage.periodStart)} – ${formatDate(usage.periodEnd)}` : "Current billing period"}
              </div>
            </div>
            {periodLeft != null && (
              <span className="pill"><span className="mono">{periodLeft} days left</span></span>
            )}
          </div>
          {usage ? (
            <>
              <UsageBar label="Analyses" used={usage.auditsRun} limit={usage.monthlyAuditLimit} />
              <UsageBar
                label="Platforms per audit"
                used={planUsage?.plan.platformLimit ?? 0}
                limit={planUsage?.plan.platformLimit ?? null}
              />
            </>
          ) : (
            <div className="empty-state">Usage data unavailable.</div>
          )}
        </div>

        <div className="usage-card">
          <div className="card-h">
            <div>
              <div className="card-title-lg">Payment <span className="em">method</span></div>
              <div className="card-sub">Manage how you pay for AdAdviser</div>
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg,#221a3d,#16102a)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              marginBottom: 18,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "radial-gradient(circle,rgba(234,255,0,.12),transparent 65%)",
              }}
            />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--hint)", letterSpacing: ".14em", textTransform: "uppercase" }}>
              Primary card
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, marginTop: 14, letterSpacing: ".18em", color: "var(--hint)" }}>
              •••• •••• •••• ••••
            </div>
            <div style={{ marginTop: 18, fontSize: 12.5, color: "var(--hint)" }}>
              No card on file
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--hint)", lineHeight: 1.6, margin: 0 }}>
            Online checkout is coming soon. To change or activate a paid plan today, head to{" "}
            <Link href="/pricing" className="link-lime">pricing</Link>.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div className="card-title-lg">Recent <span className="em">invoices</span></div>
            <div className="card-sub">Downloadable as PDF</div>
          </div>
        </div>
        <div className="empty-state">
          No invoices yet — they&rsquo;ll appear here once billing is active on your account.
        </div>
      </div>
    </DashboardShell>
  );
}
