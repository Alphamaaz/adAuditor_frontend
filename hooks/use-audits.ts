"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  auditsApi,
  type CreateAuditSetupInput,
  type SubmitPlatformIntakeInput,
  type UploadAuditFileInput,
} from "@/lib/audits";
import { MY_PLAN_QUERY_KEY } from "./use-plans";

export const AUDITS_QUERY_KEY = ["audits"] as const;
export const AD_ACCOUNTS_QUERY_KEY = ["ad-accounts"] as const;
export const AUDIT_HISTORY_QUERY_KEY = ["audits", "history"] as const;

export function useAudits() {
  return useQuery({
    queryKey: AUDITS_QUERY_KEY,
    queryFn: auditsApi.list,
    retry: false,
  });
}

export function useAdAccounts() {
  return useQuery({
    queryKey: AD_ACCOUNTS_QUERY_KEY,
    queryFn: auditsApi.listAdAccounts,
    retry: false,
  });
}

export function useCreateAuditSetup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAuditSetupInput) => auditsApi.createSetup(input),
    onSuccess: ({ audit }) => {
      queryClient.invalidateQueries({ queryKey: AUDITS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AD_ACCOUNTS_QUERY_KEY });
      router.push(`/dashboard/audits/${audit.id}/intake`);
    },
  });
}

/**
 * Watches an audit. While the audit is mid-pipeline (PROCESSING / VALIDATING)
 * the query auto-refetches every 2s so the UI updates as soon as the worker
 * marks it COMPLETED or FAILED. Stops polling on terminal states.
 */
export function useAudit(auditId: string) {
  return useQuery({
    queryKey: ["audit", auditId],
    queryFn: () => auditsApi.get(auditId),
    enabled: Boolean(auditId),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PROCESSING" || status === "VALIDATING") return 2000;
      return false;
    },
    // Keep refetching even when the tab is backgrounded so users come back to
    // a fresh result rather than a stale "Processing" screen.
    refetchIntervalInBackground: true,
  });
}

export function useSubmitPlatformIntake() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitPlatformIntakeInput) =>
      auditsApi.submitPlatformIntake(input),
    onSuccess: ({ audit }) => {
      queryClient.invalidateQueries({ queryKey: AUDITS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["audit", audit.id] });

      if (audit.dataSource === "MANUAL_UPLOAD") {
        router.push(`/dashboard/audits/${audit.id}/upload`);
        return;
      }

      router.push(`/dashboard/audits/${audit.id}/connect`);
    },
  });
}

export function useUploadAuditFile(auditId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadAuditFileInput) => auditsApi.uploadFile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDITS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["audit", auditId] });
    },
  });
}

/**
 * Triggers the audit pipeline. The server queues the work and returns
 * immediately with the audit in PROCESSING. Navigates to the results page;
 * `useAudit` will auto-poll until the job is done.
 */
export function useRunAudit(auditId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auditsApi.run(auditId),
    onSuccess: (audit) => {
      // Seed the cache with the PROCESSING audit so the next page already
      // has data and starts polling on mount.
      queryClient.setQueryData(["audit", auditId], audit);
      queryClient.invalidateQueries({ queryKey: AUDITS_QUERY_KEY });
      // Usage counter increments after the run job completes — refresh the
      // dashboard badge a moment later so users see the updated count.
      // Also refresh the score-trend so the dashboard sparkline picks up
      // the new completed audit point.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: MY_PLAN_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: AUDIT_HISTORY_QUERY_KEY });
      }, 4000);
      router.push(`/dashboard/audits/${audit.id}/results`);
    },
  });
}

/**
 * Queues AI narrative generation. The audit query will refetch shortly
 * after; the `aiReport` field will switch from `provider: "deterministic"`
 * to the real provider when the job lands.
 */
export function useGenerateAiReport(auditId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auditsApi.generateAiReport(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit", auditId] });
    },
  });
}

/**
 * Queues PDF generation. Poll the audit; `pdfReports` will populate when done.
 */
export function useGeneratePdfReport(auditId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auditsApi.generatePdfReport(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit", auditId] });
    },
  });
}

/**
 * Score-trend dataset for the dashboard sparkline. Cheap to refetch — the
 * backend caps the result set, and the data only changes after an audit
 * completes. We invalidate it from useRunAudit so the chart refreshes.
 */
export function useAuditHistory(params?: {
  adAccountId?: string;
  platform?: "META" | "GOOGLE" | "TIKTOK";
  limit?: number;
}) {
  return useQuery({
    queryKey: [...AUDIT_HISTORY_QUERY_KEY, params || {}],
    queryFn: () => auditsApi.history(params),
    retry: false,
    staleTime: 30 * 1000,
  });
}

/**
 * Pulls a side-by-side comparison for two audits. Disabled until both IDs
 * are supplied so the picker UI can render without firing requests.
 */
export function useAuditComparison(
  leftAuditId: string | null,
  rightAuditId: string | null
) {
  return useQuery({
    queryKey: ["audits", "compare", leftAuditId, rightAuditId],
    queryFn: () => auditsApi.compare(leftAuditId as string, rightAuditId as string),
    enabled: Boolean(leftAuditId && rightAuditId && leftAuditId !== rightAuditId),
    retry: false,
  });
}

export function useDownloadPdfReport() {
  return useMutation({
    mutationFn: ({
      auditId,
      pdfReportId,
    }: {
      auditId: string;
      pdfReportId: string;
    }) => auditsApi.downloadPdfReport(auditId, pdfReportId),
  });
}
