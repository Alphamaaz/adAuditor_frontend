import type { Platform } from "./audits";

export interface UploadReportOption {
  id: string;
  label: string;
  helper: string;
}

export const UPLOAD_REPORT_TYPES: Record<Platform, UploadReportOption[]> = {
  META: [
    {
      id: "AD_PERFORMANCE_30D",
      label: "Ad Performance, last 30 days",
      helper: "Sample-supported export: ad name, delivery, spend, impressions, reach, results.",
    },
    {
      id: "AD_PERFORMANCE_90D",
      label: "Ad Performance, last 90 days",
      helper: "Use when the account has enough history. Maximum accepted range is 90 days.",
    },
    {
      id: "CAMPAIGN_PERFORMANCE_30D",
      label: "Campaign Performance, last 30 days",
      helper: "Required for full Meta campaign structure and budget scoring.",
    },
    {
      id: "CAMPAIGN_PERFORMANCE_90D",
      label: "Campaign Performance, last 90 days",
      helper: "Required for full Meta trend and campaign structure scoring.",
    },
    {
      id: "AD_SET_PERFORMANCE_30D",
      label: "Ad Set Performance, last 30 days",
      helper: "Required for full audience and budget analysis.",
    },
    {
      id: "AD_SET_PERFORMANCE_90D",
      label: "Ad Set Performance, last 90 days",
      helper: "Required for full ad set trend analysis.",
    },
    {
      id: "AUDIENCE_DETAILS",
      label: "Audience Details Export",
      helper: "Required for full audience coverage and overlap checks.",
    },
    {
      id: "PIXEL_EVENTS_30D",
      label: "Pixel Event Report, last 30 days",
      helper: "Required for full tracking health checks.",
    },
  ],
  GOOGLE: [
    {
      id: "TIME_SERIES",
      label: "Time Series Chart",
      helper: "Sample-supported trend export. Useful, but not enough for a full Google audit.",
    },
    {
      id: "CAMPAIGN_PERFORMANCE_30D",
      label: "Campaign Performance, last 30 days",
      helper: "Required for full Google campaign and bidding analysis.",
    },
    {
      id: "CAMPAIGN_PERFORMANCE_90D",
      label: "Campaign Performance, last 90 days",
      helper: "Required for full Google trend analysis.",
    },
    {
      id: "AD_GROUP_REPORT_30D",
      label: "Ad Group Report, last 30 days",
      helper: "Required for full ad group performance checks.",
    },
    {
      id: "KEYWORD_REPORT_30D",
      label: "Keyword Report, last 30 days",
      helper: "Required for keyword quality and match type checks.",
    },
    {
      id: "SEARCH_TERMS_30D",
      label: "Search Terms Report, last 30 days",
      helper: "Required for query waste and negative keyword checks.",
    },
    {
      id: "AD_COPY_REPORT_30D",
      label: "Ad Copy Report, last 30 days",
      helper: "Required for RSA and ad copy analysis.",
    },
    {
      id: "AUDIENCE_BIDDING_30D",
      label: "Audience & Bidding Report, last 30 days",
      helper: "Required for audience observation checks.",
    },
    {
      id: "ASSET_REPORT_30D",
      label: "Asset Report for PMax, last 30 days",
      helper: "Required for Performance Max asset coverage.",
    },
    {
      id: "SHOPPING_PMAX_FEED",
      label: "Shopping/PMax Feed, current",
      helper: "Required for Shopping and PMax feed approval checks.",
    },
  ],
  TIKTOK: [
    {
      id: "CAMPAIGN_PERFORMANCE_30D",
      label: "Campaign Performance, last 30 days",
      helper: "Sample-supported export: campaign name, status, cost, impressions, clicks, conversions.",
    },
    {
      id: "CAMPAIGN_PERFORMANCE_90D",
      label: "Campaign Performance, last 90 days",
      helper: "Use when the account has enough history. Maximum accepted range is 90 days.",
    },
    {
      id: "AD_GROUP_REPORT_30D",
      label: "Ad Group Report, last 30 days",
      helper: "Required for full targeting and pacing analysis.",
    },
    {
      id: "AD_PERFORMANCE_30D",
      label: "Ad Performance Report, last 30 days",
      helper: "Required for full creative performance checks.",
    },
    {
      id: "AUDIENCE_REPORT",
      label: "Audience Report, current",
      helper: "Required for full audience coverage checks.",
    },
    {
      id: "PIXEL_EVENTS_30D",
      label: "Pixel Event Report, last 30 days",
      helper: "Required for full TikTok pixel and events health.",
    },
  ],
};

export const defaultReportType = (platform: Platform) =>
  UPLOAD_REPORT_TYPES[platform][0].id;
