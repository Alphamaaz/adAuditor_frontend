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
};
