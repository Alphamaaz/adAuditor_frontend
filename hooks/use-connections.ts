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
