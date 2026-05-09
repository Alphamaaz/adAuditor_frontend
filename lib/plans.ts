import api from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  priceMonthly: number;
  currency: string;
  formattedPrice: string;
  monthlyAuditLimit: number | null;
  platformLimit: number | null;
  historyDays: number | null;
  features: {
    pdfExport?: boolean;
    manualUpload?: boolean;
    oauthConnections?: boolean;
    whiteLabelPdf?: boolean | string;
    customBranding?: boolean | string;
    teamSeats?: boolean;
    prioritySupport?: boolean;
    clientAccountLimit?: number | null;
    includedPlatforms?: string[];
    notes?: string[];
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fallbackPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    description:
      "For small teams validating one ad platform at a time with focused monthly audit volume.",
    priceCents: 2000,
    priceMonthly: 20,
    currency: "usd",
    formattedPrice: "$20",
    monthlyAuditLimit: 3,
    platformLimit: 1,
    historyDays: 30,
    features: {
      notes: ["3 audit runs/month", "1 platform per audit", "PDF export", "30-day history"],
    },
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    description:
      "For agencies and operators running multi-platform audits across active client accounts.",
    priceCents: 4900,
    priceMonthly: 49,
    currency: "usd",
    formattedPrice: "$49",
    monthlyAuditLimit: 15,
    platformLimit: 3,
    historyDays: 365,
    features: {
      notes: [
        "15 audit runs/month",
        "All 3 platforms",
        "White-label PDF later",
        "12-month history",
        "API connection configurable by plan",
      ],
    },
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "agency",
    name: "Agency",
    slug: "agency",
    description:
      "For growing agencies that need higher usage, client account capacity, and priority support.",
    priceCents: 14900,
    priceMonthly: 149,
    currency: "usd",
    formattedPrice: "$149",
    monthlyAuditLimit: null,
    platformLimit: 3,
    historyDays: null,
    features: {
      notes: [
        "Unlimited audits",
        "Up to 10 client accounts",
        "Team seats",
        "Custom branding later",
        "Priority support",
      ],
    },
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

/**
 * AI narrative availability per plan:
 *   - "automatic": Pro/Agency — AI auto-runs after every audit
 *   - "manual":    Starter — user clicks "Generate AI report"
 *   - false:       Free — AI is locked behind upgrade
 */
export type AiNarrativeMode = "automatic" | "manual" | false;

export interface MyPlanAndUsage {
  plan: Pick<
    SubscriptionPlan,
    "slug" | "name" | "monthlyAuditLimit" | "platformLimit" | "features"
  > & { id?: string };
  source: "override" | "subscription" | "free";
  subscription: {
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: {
    periodStart: string;
    periodEnd: string;
    auditsRun: number;
    monthlyAuditLimit: number | null;
    platformLimit: number | null;
    auditsRemaining: number | null;
  };
  capabilities: {
    aiNarrative: AiNarrativeMode;
  };
}

export const plansApi = {
  list: async (): Promise<SubscriptionPlan[]> => {
    const res = await api.get<{ status: string; data: SubscriptionPlan[] }>(
      "/api/plans"
    );
    return res.data.data;
  },
  myPlanAndUsage: async (): Promise<MyPlanAndUsage> => {
    const res = await api.get<{ status: string; data: MyPlanAndUsage }>(
      "/api/billing/me"
    );
    return res.data.data;
  },
};
