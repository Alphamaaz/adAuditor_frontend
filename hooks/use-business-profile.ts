"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessProfileApi, type BusinessProfileAnswers } from "@/lib/business-profile";
import { AUTH_QUERY_KEY } from "./use-auth";

export const PROFILE_QUERY_KEY = ["business-profile"] as const;

export function useBusinessProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: businessProfileApi.get,
    retry: false,
  });
}

export function useUpsertBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: BusinessProfileAnswers) =>
      businessProfileApi.upsert(answers),
    onSuccess: () => {
      // Refresh both the profile cache and the auth cache (hasBusinessProfile flag).
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
