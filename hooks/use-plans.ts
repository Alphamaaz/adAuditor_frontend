"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { plansApi } from "@/lib/plans";

export const PLANS_QUERY_KEY = ["plans"] as const;
export const MY_PLAN_QUERY_KEY = ["plans", "me"] as const;

export function usePlans() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: plansApi.list,
    retry: false,
  });
}

/**
 * Returns the authenticated org's effective plan + current-period usage.
 * Use this to show "X of Y audits used" badges and gate upgrade CTAs.
 */
export function useMyPlanAndUsage(enabled = true) {
  return useQuery({
    queryKey: MY_PLAN_QUERY_KEY,
    queryFn: plansApi.myPlanAndUsage,
    enabled,
    retry: false,
    // Usage updates after each audit run — keep relatively fresh.
    staleTime: 30 * 1000,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: string) =>
      plansApi.createCheckout({
        planId,
        successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
        cancelUrl: `${window.location.origin}/dashboard/billing?checkout=cancelled`,
      }),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

export function useCreateBillingPortal() {
  return useMutation({
    mutationFn: () =>
      plansApi.createPortal(`${window.location.origin}/dashboard/billing`),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}
