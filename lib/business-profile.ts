import api from "./api";

export interface BusinessProfileAnswers {
  sectionA: {
    businessType?: string | null;
    monthlyBudget?: number | null;
    targetCpa?: number | null;
    targetRoas?: number | null;
    avgOrderValue?: number | null;
    blendedCac?: number | null;
    productsServices?: string | null;
    geoMarkets?: string[];
    campaignAge?: string | null;
    campaignObjective?: string[];
  };
  sectionB: {
    pixelInstalled?: string | null;
    correctConversionEvent?: string | null;
    utmConsistency?: string | null;
    crossReferencesGa4?: string | null;
    serverSideTracking?: string | null;
  };
  sectionC: {
    bestEverCpa?: number | null;
    bestEverRoas?: number | null;
    avgCtr90Days?: number | null;
    avgCpm90Days?: number | null;
    landingPageConversionRate?: number | null;
    historicalSpend?: string | null;
  };
}

export interface BusinessProfile {
  id: string;
  organizationId: string;
  answers: BusinessProfileAnswers;
  createdAt: string;
  updatedAt: string;
}

export const businessProfileApi = {
  get: async (): Promise<BusinessProfile | null> => {
    const res = await api.get<{ status: string; data: BusinessProfile | null }>(
      "/api/business-profile"
    );
    return res.data.data;
  },

  upsert: async (answers: BusinessProfileAnswers): Promise<BusinessProfile> => {
    const res = await api.post<{ status: string; data: BusinessProfile }>(
      "/api/business-profile",
      answers
    );
    return res.data.data;
  },
};
