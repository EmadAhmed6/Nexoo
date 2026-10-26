"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { LoginCredentials, RegisterCredentials } from "../types/auth.types";
import { setAuthToken, getAuthToken, removeAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAppStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.accessToken;
      if (token) {
        setAuthToken(token);
      }
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser } = useAppStore();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await authApi.register(credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.accessToken;
      if (token) {
        setAuthToken(token);
      }
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
    },
  });
}

/**
 * Hook to retrieve the current user via /auth/me
 */
export function useAuthMe() {
  const { setUser, logout } = useAppStore();
  const token = typeof window !== "undefined" ? getAuthToken() : undefined;

  return useQuery({
    queryKey: ["authMe"],
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        if (response.data) {
          setUser(response.data);
        }
        return response.data;
      } catch (error) {
        logout();
        throw error;
      }
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

/**
 * Mutation hook to verify OTP after registration
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const { setUser } = useAppStore();

  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const response = await authApi.verifyOtp(payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        const token = (data as any)?.accessToken;
        if (token) {
          setAuthToken(token);
        }
        setUser(data);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["authMe"] });
      }
    },
  });
}

/**
 * Mutation hook for resending OTP verification email
 * POST /auth/resend-otp
 */
export function useResendOtp() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await authApi.resendOtp(payload);
      return response;
    },
  });
}

/**
 * Mutation hook for requesting a password reset email
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await authApi.forgotPassword(payload);
      return response;
    },
  });
}

/**
 * Mutation hook for resetting password with token and email
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string; token: string; newPassword: string }) => {
      const response = await authApi.resetPassword(payload);
      return response;
    },
  });
}

/**
 * Mutation hook for logging out user across server and client
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: clearStore } = useAppStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    },
    onSettled: () => {
      clearStore();
      removeAuthToken();
      queryClient.clear();
    },
  });
}
