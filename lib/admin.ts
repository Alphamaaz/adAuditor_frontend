import api from "./api";
import { SubscriptionPlan } from "./plans";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalAudits: number;
  auditsLast30Days: number;
  platformStats: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";
  internalRole: "USER" | "SUPER_ADMIN" | "SUPPORT_ADMIN";
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export interface AdminOrganization {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  memberCount: number;
  auditCount: number;
  subscription: {
    status: string;
    planName: string | null;
    planSlug: string | null;
    currentPeriodEnd: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<{ status: string; data: AdminStats }>("/api/admin/stats");
    return res.data.data;
  },

  listUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<AdminUser>> => {
    const res = await api.get<PaginatedResponse<AdminUser>>("/api/admin/users", {
      params,
    });
    return res.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<AdminUser> => {
    const res = await api.patch<{ status: string; data: AdminUser }>(
      `/api/admin/users/${userId}/status`,
      { status }
    );
    return res.data.data;
  },

  listOrganizations: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<AdminOrganization>> => {
    const res = await api.get<PaginatedResponse<AdminOrganization>>(
      "/api/admin/organizations",
      { params }
    );
    return res.data;
  },

  impersonateUser: async (userId: string, reason?: string): Promise<void> => {
    await api.post("/api/admin/impersonate", { userId, reason });
  },

  stopImpersonation: async (): Promise<void> => {
    await api.post("/api/admin/stop-impersonation");
  },

  listPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await api.get<{ status: string; data: SubscriptionPlan[] }>(
      "/api/admin/plans"
    );
    return res.data.data;
  },

  createPlan: async (data: any): Promise<SubscriptionPlan> => {
    const res = await api.post<{ status: string; data: SubscriptionPlan }>(
      "/api/admin/plans",
      data
    );
    return res.data.data;
  },

  updatePlan: async (id: string, data: any): Promise<SubscriptionPlan> => {
    const res = await api.patch<{ status: string; data: SubscriptionPlan }>(
      `/api/admin/plans/${id}`,
      data
    );
    return res.data.data;
  },

  updateOrganizationPlan: async (
    organizationId: string,
    planId: string | null,
    reason?: string
  ): Promise<any> => {
    const res = await api.patch<{ status: string; data: any }>(
      `/api/admin/organizations/${organizationId}/plan`,
      { planId, reason }
    );
    return res.data.data;
  },
};

