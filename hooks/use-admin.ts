"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin";
import { useRouter } from "next/navigation";

export const ADMIN_STATS_KEY = ["admin", "stats"] as const;
export const ADMIN_USERS_KEY = ["admin", "users"] as const;
export const ADMIN_ORGS_KEY = ["admin", "organizations"] as const;

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_STATS_KEY,
    queryFn: adminApi.getStats,
  });
}

export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, params],
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useAdminOrgs(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...ADMIN_ORGS_KEY, params],
    queryFn: () => adminApi.listOrganizations(params),
  });
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.impersonateUser(userId, reason),
    onSuccess: () => {
      // After setting the cookie, we need to refresh the whole app state
      window.location.href = "/dashboard";
    },
  });
}

export function useStopImpersonation() {
  return useMutation({
    mutationFn: adminApi.stopImpersonation,
    onSuccess: () => {
      // Restore the admin session and return to admin panel
      window.location.href = "/admin";
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: adminApi.listPlans,
  });
}

export function useUpdateOrgPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      planId,
      reason,
    }: {
      organizationId: string;
      planId: string | null;
      reason?: string;
    }) => adminApi.updateOrganizationPlan(organizationId, planId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORGS_KEY });
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}
