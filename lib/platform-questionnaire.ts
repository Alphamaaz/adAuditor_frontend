import type { Platform } from "./audits";

export type QuestionType = "select" | "multi-select" | "number" | "text";

export interface PlatformQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  showWhen?: {
    questionId: string;
    includes?: string;
    equals?: string;
  };
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  META: "Meta Ads",
  GOOGLE: "Google Ads",
  TIKTOK: "TikTok Ads",
};

export const PLATFORM_QUESTIONS: Record<Platform, PlatformQuestion[]> = {
  META: [
    {
      id: "M1",
      label: "Are you using Advantage+ Shopping Campaigns or manual campaigns?",
      type: "multi-select",
      options: ["ASC", "Manual campaigns", "Mixed", "Do not know"],
    },
    {
      id: "M2",
      label: "What is your campaign bid strategy?",
      type: "multi-select",
      options: ["Lowest Cost", "Cost Cap", "Bid Cap", "ROAS Target", "Do not know"],
    },
    {
      id: "M3",
      label: "Are you using Advantage+ Audience or manual targeting?",
      type: "select",
      options: ["Yes", "No", "Mixed", "Do not know"],
    },
    {
      id: "M4",
      label: "Are you running broad, interest, or lookalike audiences?",
      type: "multi-select",
      options: ["Broad", "Interest", "Lookalike", "Retargeting", "Do not know"],
    },
    {
      id: "M5",
      label: "Do you have retargeting campaigns? If yes, what audience windows?",
      type: "text",
      placeholder: "Example: yes, 7-day visitors and 30-day add-to-cart",
    },
    {
      id: "M6",
      label: "Are existing customers excluded from prospecting campaigns?",
      type: "select",
      options: ["Yes", "No", "Unsure"],
    },
    {
      id: "M7",
      label: "How many active ads exist per ad set on average?",
      type: "number",
    },
    {
      id: "M8",
      label: "How often do you refresh creative?",
      type: "select",
      options: ["Weekly", "Bi-weekly", "Monthly", "Rarely", "Do not know"],
    },
    {
      id: "M9",
      label: "Are you running Catalog or Dynamic Product Ads?",
      type: "select",
      options: ["Yes", "No", "Do not know"],
    },
    {
      id: "M10",
      label: "Have you experienced a significant performance drop in the past 60 days?",
      type: "text",
      placeholder: "Example: yes, around 2026-04-15",
    },
  ],
  GOOGLE: [
    {
      id: "G1",
      label: "What campaign types are you running?",
      type: "multi-select",
      options: ["Search", "Shopping", "PMax", "Display", "YouTube", "App"],
    },
    {
      id: "G2",
      label: "What is your primary bid strategy?",
      type: "multi-select",
      options: [
        "Manual CPC",
        "Enhanced CPC",
        "Target CPA",
        "Target ROAS",
        "Maximize Conversions",
        "Max Conv. Value",
        "Do not know",
      ],
    },
    {
      id: "G3",
      label: "How many conversions per month does your account record?",
      type: "number",
    },
    {
      id: "G4",
      label: "Which keyword match type is used primarily?",
      type: "select",
      options: ["Broad match", "Phrase match", "Exact match", "Mixed", "Do not know"],
    },
    {
      id: "G5",
      label: "Do you have a negative keyword list? When was it last updated?",
      type: "select",
      options: ["No", "Never", "6+ months ago", "Within 3 months", "Ongoing", "Do not know"],
    },
    {
      id: "G6",
      label: "Are brand and non-brand campaigns separated?",
      type: "select",
      options: ["Yes", "No", "Do not know"],
    },
    {
      id: "G7",
      label: "What Performance Max asset groups exist?",
      type: "text",
      placeholder: "Example: best sellers, clearance, new arrivals",
      showWhen: { questionId: "G1", includes: "PMax" },
    },
    {
      id: "G8",
      label: "Do you have audience segments added as observation or targeting?",
      type: "select",
      options: ["Yes", "No", "Unsure"],
    },
    {
      id: "G9",
      label: "Are you using ad schedule or dayparting bid adjustments?",
      type: "select",
      options: ["Yes", "No", "Do not know"],
    },
    {
      id: "G10",
      label: "Are conversion actions categorized as Primary vs. Secondary?",
      type: "select",
      options: ["Yes", "No", "Unsure"],
    },
    {
      id: "G11",
      label: "Is Enhanced Conversions or server-side tagging configured?",
      type: "select",
      options: ["Yes", "No", "In progress", "Do not know"],
    },
    {
      id: "G12",
      label: "What is your average Quality Score across Search campaigns?",
      type: "select",
      options: ["Mostly 1-4", "Mostly 5-6", "Mostly 7-10", "Do not know"],
    },
  ],
  TIKTOK: [
    {
      id: "T1",
      label: "Are you using Smart+ Campaigns or manual structure?",
      type: "select",
      options: ["Smart+", "Manual", "Mixed", "Do not know"],
    },
    {
      id: "T2",
      label: "What is your primary bid strategy?",
      type: "select",
      options: ["Lowest Cost", "Cost Cap", "Bid Cap", "Do not know"],
    },
    {
      id: "T3",
      label: "How frequently do you refresh video creatives?",
      type: "select",
      options: ["Daily", "Weekly", "Bi-weekly", "Monthly", "Rarely"],
    },
    {
      id: "T4",
      label: "What is your average video ad length?",
      type: "select",
      options: ["<10s", "10-20s", "20-30s", "30s+", "Do not know"],
    },
    {
      id: "T5",
      label: "Are you using TikTok Pixel or Events API?",
      type: "select",
      options: ["Pixel only", "Events API", "Both", "Neither", "Do not know"],
    },
    {
      id: "T6",
      label: "Are you running TopView, In-Feed, or Spark Ads?",
      type: "multi-select",
      options: ["TopView", "In-Feed", "Spark Ads", "Do not know"],
    },
    {
      id: "T7",
      label: "Are you targeting broad audiences or specific interest categories?",
      type: "multi-select",
      options: ["Broad", "Interest categories", "Lookalike", "Retargeting", "Do not know"],
    },
    {
      id: "T8",
      label: "Are existing customers excluded from prospecting?",
      type: "select",
      options: ["Yes", "No", "Unsure"],
    },
  ],
};
