"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, UpdateUserPayload } from "../api/user.api";
import { useAppStore } from "@/store/use-app-store";

export const USER_QUERY_KEY = ["user", "current"] as const;

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await userApi.getUserById(userId);
      return res.data;
    },
    enabled: Boolean(userId),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAppStore();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      userApi.updateUser(userId, payload),
    onSuccess: (res, variables) => {
      if (res.data && authUser?._id === variables.userId) {
        setUser(res.data);
      }
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
