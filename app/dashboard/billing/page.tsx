"use client";

import { useState } from "react";
import {
  useCreateBillingPortal,
  useCreateCheckout,
  useMyPlanAndUsage,
  usePlans,
} from "@/hooks/use-plans";
import { getErrorMessage } from "@/lib/api";
import { fallbackPlans, type SubscriptionPlan } from "@/lib/plans";
import { DashboardShell } from "../_components/DashboardShell";

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PLAN_BLURBS: Record<string, string> = {
  starter: "For an in-house marketer auditing one or two accounts.",
  pro: "For performance marketers managing multiple accounts and platforms.",
  agency: "For agencies that need higher usage and client capacity.",
};

const planFeatures = (plan: SubscriptionPlan): string[] => {
  if (plan.features?.notes?.length) return plan.features.notes;
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
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const daysLeft = (end: string | null) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const isDatabaseId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const isUnlimited = limit == null;
  const pct = isUnlimited
    ? 12
    : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  return (
    <div className="usage-bar">
      <div className="usage-bar-h">
        <span className="l">{label}</span>
        <span className="v">
          {used} / {isUnlimited ? "unlimited" : limit}
        </span>
      </div>
      <div className="usage-bar-track">
        <div
          className="usage-bar-fill"
          style={{
            width: `${pct}%`,
            ...(isUnlimited ? { background: "var(--lime)" } : {}),
          }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: apiPlans } = usePlans();
  const { data: planUsage } = useMyPlanAndUsage();
  const checkout = useCreateCheckout();
  const portal = useCreateBillingPortal();
  const [billingError, setBillingError] = useState<string | null>(null);

  const plans = (apiPlans?.length ? apiPlans : fallbackPlans).filter(
    (plan) => plan.isActive
  );
  const currentSlug = planUsage?.plan?.slug || "free";
  const usage = planUsage?.usage;
  const periodLeft = usage ? daysLeft(usage.periodEnd) : null;
  const hasSubscription = Boolean(planUsage?.subscription);
  const billingBusy = checkout.isPending || portal.isPending;
  const upgradeTarget = plans.find(
    (plan) => plan.slug === "agency" && plan.slug !== currentSlug
  );

  const openPortal = () => {
    setBillingError(null);
    portal.mutate(undefined, {
      onError: (error) => setBillingError(getErrorMessage(error)),
    });
  };

  const choosePlan = (plan: SubscriptionPlan) => {
    setBillingError(null);
    if (hasSubscription) {
      openPortal();
      return;
    }
    if (!isDatabaseId(plan.id)) {
      setBillingError(
        "Checkout is temporarily unavailable because live plan configuration could not be loaded."
      );
      return;
    }
    checkout.mutate(plan.id, {
      onError: (error) => setBillingError(getErrorMessage(error)),
    });
  };

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
              ? `You are on ${planUsage.plan.name}. ${
                  usage?.periodEnd
                    ? `Current cycle ends ${formatDate(usage.periodEnd)}.`
                    : ""
                } Manage your plan and track usage below.`
              : "Choose the plan that fits how you run audits."}
          </p>
        </div>
        {upgradeTarget && (
          <div className="page-head-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={billingBusy}
              onClick={() => choosePlan(upgradeTarget)}
            >
              {billingBusy
                ? "Opening billing..."
                : hasSubscription
                  ? "Manage subscription"
                  : `Upgrade to ${upgradeTarget.name}`}
            </button>
          </div>
        )}
      </div>

      {billingError && <div className="alert error">{billingError}</div>}

      <div className="plan-grid">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentSlug;
          return (
            <div
              className={`plan-card ${isCurrent ? "current" : ""}`}
              key={plan.id || plan.slug}
            >
              <div className="plan-tier">{plan.name}</div>
              <div className="plan-name">
                {plan.formattedPrice}
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--hint)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {" "}/ mo
                </span>
              </div>
              <div className="plan-blurb">
                {plan.description || PLAN_BLURBS[plan.slug] || ""}
              </div>
              <div className="plan-feats">
                {planFeatures(plan).map((feature) => (
                  <div className="f" key={feature}>
                    <CheckIcon />
                    {feature}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={(isCurrent && !hasSubscription) || billingBusy}
                onClick={isCurrent ? openPortal : () => choosePlan(plan)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {isCurrent
                  ? hasSubscription
                    ? "Manage subscription"
                    : "Current plan"
                  : hasSubscription
                    ? "Change in billing portal"
                    : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ marginBottom: 22 }}>
        <div className="usage-card">
          <div className="card-h">
            <div>
              <div className="card-title-lg">
                Usage this <span className="em">cycle</span>
              </div>
              <div className="card-sub">
                {usage
                  ? `${formatDate(usage.periodStart)} to ${formatDate(usage.periodEnd)}`
                  : "Current billing period"}
              </div>
            </div>
            {periodLeft != null && (
              <span className="pill">
                <span className="mono">{periodLeft} days left</span>
              </span>
            )}
          </div>
          {usage ? (
            <UsageBar
              label="Analyses"
              used={usage.auditsRun}
              limit={usage.monthlyAuditLimit}
            />
          ) : (
            <div className="empty-state">Usage data unavailable.</div>
          )}
        </div>

        <div className="usage-card">
          <div className="card-h">
            <div>
              <div className="card-title-lg">
                Payment <span className="em">method</span>
              </div>
              <div className="card-sub">Payments are managed securely by Stripe</div>
            </div>
          </div>
          <div className="billing-provider-card">
            <div className="billing-provider-label">Billing account</div>
            <div className="billing-provider-title">
              {hasSubscription
                ? "Active Stripe billing profile"
                : "No active paid subscription"}
            </div>
            <div className="billing-provider-meta">
              {planUsage?.subscription
                ? `${planUsage.subscription.status} subscription${
                    planUsage.subscription.cancelAtPeriodEnd
                      ? " - cancels at period end"
                      : ""
                  }`
                : "Choose a paid plan to open secure checkout"}
            </div>
          </div>
          {hasSubscription ? (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={billingBusy}
              onClick={openPortal}
            >
              Manage payment method and invoices
            </button>
          ) : (
            <p className="billing-help">
              Payment details are collected only on Stripe&apos;s secure checkout page.
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="billing-invoice-head">
          <div>
            <div className="card-title-lg">
              Recent <span className="em">invoices</span>
            </div>
            <div className="card-sub">Receipts and downloadable invoices</div>
          </div>
        </div>
        <div className="empty-state">
          {hasSubscription ? (
            <>
              Invoices are available in the secure billing portal.{" "}
              <button
                type="button"
                className="link-lime billing-inline-button"
                onClick={openPortal}
                disabled={billingBusy}
              >
                Open billing portal
              </button>
            </>
          ) : (
            "No invoices yet. They will be available after your first paid subscription."
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
