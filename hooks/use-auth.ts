"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;
export const AUTH_SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

// ── current user ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ── signup ────────────────────────────────────────────────────────────────────

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (_, variables) => {
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
  });
}

// ── verify email ──────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);

      if (data.user.internalRole === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push(data.hasBusinessProfile ? "/dashboard" : "/onboarding");
      }
    },
  });
}

// ── resend otp ────────────────────────────────────────────────────────────────

export function useResendOtp() {
  return useMutation({ mutationFn: authApi.resendOtp });
}

// ── login ─────────────────────────────────────────────────────────────────────

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);

      if (data.user.internalRole === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push(data.hasBusinessProfile ? "/dashboard" : "/onboarding");
      }
    },
  });
}

// ── logout ────────────────────────────────────────────────────────────────────

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      router.push("/login");
    },
  });
}

// ── forgot password ───────────────────────────────────────────────────────────

export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) => {
      router.push(
        `/reset-password?email=${encodeURIComponent(variables.email)}`
      );
    },
  });
}

// ── reset password ────────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      router.push("/login?reset=1");
    },
  });
}

// ── change password ───────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useAuthSessions() {
  return useQuery({
    queryKey: AUTH_SESSIONS_QUERY_KEY,
    queryFn: authApi.sessions,
    retry: false,
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY });
    },
  });
}
