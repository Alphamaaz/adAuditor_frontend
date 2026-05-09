import api from "./api";
import type { AuthPayload, AuthSession } from "./types";

const BASE = "/api/auth";

export const authApi = {
  signup: async (data: {
    email: string;
    password: string;
    name?: string;
    organizationName?: string;
  }) => {
    const res = await api.post<{ status: string; message: string }>(
      `${BASE}/signup`,
      data
    );
    return res.data;
  },

  verifyEmail: async (data: { email: string; otp: string }) => {
    const res = await api.post<{ status: string; data: AuthPayload }>(
      `${BASE}/verify-email`,
      data
    );
    return res.data.data;
  },

  resendOtp: async (data: { email: string }) => {
    const res = await api.post<{ status: string; message: string }>(
      `${BASE}/resend-otp`,
      data
    );
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ status: string; data: AuthPayload }>(
      `${BASE}/login`,
      data
    );
    return res.data.data;
  },

  logout: async () => {
    await api.post(`${BASE}/logout`);
  },

  me: async (): Promise<AuthPayload> => {
    const res = await api.get<{ status: string; data: AuthPayload }>(
      `${BASE}/me`
    );
    return res.data.data;
  },

  updateProfile: async (data: {
    name?: string;
    organizationName?: string;
  }): Promise<AuthPayload> => {
    const res = await api.patch<{ status: string; data: AuthPayload }>(
      `${BASE}/profile`,
      data
    );
    return res.data.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const res = await api.post<{ status: string; message: string }>(
      `${BASE}/forgot-password`,
      data
    );
    return res.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const res = await api.post<{ status: string; message: string }>(
      `${BASE}/reset-password`,
      data
    );
    return res.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await api.post<{ status: string; message: string }>(
      `${BASE}/change-password`,
      data
    );
    return res.data;
  },

  sessions: async (): Promise<AuthSession[]> => {
    const res = await api.get<{ status: string; data: AuthSession[] }>(
      `${BASE}/sessions`
    );
    return res.data.data;
  },

  revokeOtherSessions: async () => {
    const res = await api.post<{
      status: string;
      message: string;
      data: { revokedCount: number };
    }>(`${BASE}/sessions/revoke-others`);
    return res.data;
  },
};
