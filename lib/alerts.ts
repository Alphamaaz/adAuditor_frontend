import api from "./api";

export interface OrgAccount {
  id: string;
  name: string;
  platform: string;
  assignedUserId: string | null;
  monitoringEnabled: boolean;
  lastAutoAuditAt: string | null;
  assignedUser: { id: string; name: string | null; email: string } | null;
}

export interface OrgMember {
  userId: string;
  role: string;
  alertsEnabled: boolean;
  user: { id: string; name: string | null; email: string };
}

export const alertsApi = {
  listAccounts: async (): Promise<OrgAccount[]> => {
    const { data } = await api.get("/api/organizations/accounts");
    return data.data as OrgAccount[];
  },

  listMembers: async (): Promise<OrgMember[]> => {
    const { data } = await api.get("/api/organizations/members");
    return data.data as OrgMember[];
  },

  assignAccount: async (
    adAccountId: string,
    assignedUserId: string | null
  ): Promise<{ id: string; name: string; assignedUserId: string | null }> => {
    const { data } = await api.patch(
      `/api/organizations/accounts/${adAccountId}/assignee`,
      { assignedUserId }
    );
    return data.data;
  },

  setMonitoring: async (
    adAccountId: string,
    monitoringEnabled: boolean
  ): Promise<{ id: string; name: string; monitoringEnabled: boolean }> => {
    const { data } = await api.patch(
      `/api/organizations/accounts/${adAccountId}/monitoring`,
      { monitoringEnabled }
    );
    return data.data;
  },

  updateAlertPreferences: async (alertsEnabled: boolean): Promise<{ alertsEnabled: boolean }> => {
    const { data } = await api.patch("/api/organizations/alert-preferences", { alertsEnabled });
    return data.data;
  },
};
