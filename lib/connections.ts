import api from "./api";
import { Platform } from "./audits";

export interface PlatformConnection {
  id: string;
  platform: Platform;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  externalAccountId: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAdAccount {
  customerId: string;
  name: string;
  currencyCode: string | null;
  timeZone: string | null;
  status: string | null;
  isManager: boolean;
  resourceName: string;
}

export interface MetaAdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string | null;
  status: number | null;
  businessName: string | null;
}

export interface FetchDataResult {
  auditId: string;
  platform: string;
  summary: {
    rowCount: number;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    currency: string | null;
  };
  message: string;
}

export const connectionsApi = {
  list: async (): Promise<PlatformConnection[]> => {
    const res = await api.get<{ status: string; data: PlatformConnection[] }>("/api/platform-connections");
    return res.data.data;
  },

  disconnect: async (connectionId: string): Promise<void> => {
    await api.delete(`/api/platform-connections/${connectionId}`);
  },

  getConnectUrl: (platform: Platform, auditId?: string): string => {
    const base = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/platform-connections/${platform.toLowerCase()}/connect`;
    const params = new URLSearchParams();
    if (auditId) params.append("auditId", auditId);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  },

  // ── Google ───────────────────────────────────────────────────────────────

  listGoogleAdAccounts: async (): Promise<GoogleAdAccount[]> => {
    const res = await api.get<{ status: string; data: GoogleAdAccount[] }>(
      "/api/platform-connections/google/ad-accounts"
    );
    return res.data.data;
  },

  fetchGoogleData: async (auditId: string, customerId: string): Promise<FetchDataResult> => {
    const res = await api.post<{ status: string; data: FetchDataResult }>(
      "/api/platform-connections/google/fetch-data",
      { auditId, customerId }
    );
    return res.data.data;
  },

  // ── Meta ─────────────────────────────────────────────────────────────────

  listMetaAdAccounts: async (): Promise<MetaAdAccount[]> => {
    const res = await api.get<{ status: string; data: MetaAdAccount[] }>(
      "/api/platform-connections/meta/ad-accounts"
    );
    return res.data.data;
  },

  fetchMetaData: async (auditId: string, externalAdAccountId: string): Promise<FetchDataResult> => {
    const res = await api.post<{ status: string; data: FetchDataResult }>(
      "/api/platform-connections/meta/fetch-data",
      { auditId, externalAdAccountId }
    );
    return res.data.data;
  },
};
