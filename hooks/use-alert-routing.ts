"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/alerts";

const ACCOUNTS_KEY = ["org-accounts"] as const;
const MEMBERS_KEY = ["org-members"] as const;

export function useOrgAccounts() {
  return useQuery({ queryKey: ACCOUNTS_KEY, queryFn: alertsApi.listAccounts, retry: false });
}

export function useOrgMembers() {
  return useQuery({ queryKey: MEMBERS_KEY, queryFn: alertsApi.listMembers, retry: false });
}

export function useAssignAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adAccountId, assignedUserId }: { adAccountId: string; assignedUserId: string | null }) =>
      alertsApi.assignAccount(adAccountId, assignedUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useSetMonitoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adAccountId, monitoringEnabled }: { adAccountId: string; monitoringEnabled: boolean }) =>
      alertsApi.setMonitoring(adAccountId, monitoringEnabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useUpdateAlertPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertsEnabled: boolean) => alertsApi.updateAlertPreferences(alertsEnabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEMBERS_KEY }),
  });
}
