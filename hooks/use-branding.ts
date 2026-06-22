"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandingApi, type BrandingSettings } from "@/lib/branding";

const BRANDING_KEY = ["organization-branding"] as const;

export function useBranding() {
  return useQuery({
    queryKey: BRANDING_KEY,
    queryFn: brandingApi.get,
    retry: false,
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Omit<BrandingSettings, "logoBase64">) =>
      brandingApi.update(settings),
    onSuccess: (updated) => {
      qc.setQueryData(BRANDING_KEY, (prev: BrandingSettings | undefined) => ({
        ...prev,
        ...updated,
      }));
    },
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => brandingApi.uploadLogo(file),
    onSuccess: ({ logoBase64 }) => {
      qc.setQueryData(BRANDING_KEY, (prev: BrandingSettings | undefined) => ({
        ...prev,
        logoBase64,
      }));
    },
  });
}

export function useDeleteLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandingApi.deleteLogo,
    onSuccess: (updated) => {
      qc.setQueryData(BRANDING_KEY, updated);
    },
  });
}
