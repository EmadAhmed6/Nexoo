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
