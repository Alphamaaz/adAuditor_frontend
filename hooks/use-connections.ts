"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectionsApi } from "@/lib/connections";

export const CONNECTIONS_QUERY_KEY = ["platform-connections"] as const;

export function useConnections() {
  return useQuery({
    queryKey: CONNECTIONS_QUERY_KEY,
    queryFn: connectionsApi.list,
    retry: false,
  });
}

export function useDisconnectPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsApi.disconnect(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_QUERY_KEY });
    },
  });
}

export function useGoogleAdAccounts(enabled: boolean) {
  return useQuery({
    queryKey: ["google-ad-accounts"],
    queryFn: connectionsApi.listGoogleAdAccounts,
    enabled,
    retry: false,
  });
}

export function useFetchGoogleData() {
  return useMutation({
    mutationFn: ({ auditId, customerId }: { auditId: string; customerId: string }) =>
      connectionsApi.fetchGoogleData(auditId, customerId),
  });
}

export function useMetaAdAccounts(enabled: boolean) {
  return useQuery({
    queryKey: ["meta-ad-accounts"],
    queryFn: connectionsApi.listMetaAdAccounts,
    enabled,
    retry: false,
  });
}

export function useFetchMetaData() {
  return useMutation({
    mutationFn: ({ auditId, externalAdAccountId }: { auditId: string; externalAdAccountId: string }) =>
      connectionsApi.fetchMetaData(auditId, externalAdAccountId),
  });
}
