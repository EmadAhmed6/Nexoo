"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, UpdateUserPayload, AddressPayload } from "../api/user.api";
import { useAppStore } from "@/store/use-app-store";

export const USER_QUERY_KEY = ["user", "current"] as const;
const addressQueryKey = (userId: string) => ["user", userId, "addresses"];

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

// ============== ADDRESS HOOKS ==============

export function useUserAddresses(userId?: string) {
  return useQuery({
    queryKey: addressQueryKey(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const res = await userApi.getUserAddresses(userId);
      return res.data ?? [];
    },
    enabled: Boolean(userId),
  });
}

export function useAddUserAddress(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) =>
      userApi.addUserAddress(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressQueryKey(userId) });
    },
  });
}

export function useUpdateUserAddress(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      addressId,
      payload,
    }: {
      addressId: string;
      payload: Partial<AddressPayload>;
    }) => userApi.updateUserAddress(userId, addressId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressQueryKey(userId) });
    },
  });
}

export function useDeleteUserAddress(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      userApi.deleteUserAddress(userId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressQueryKey(userId) });
    },
  });
}
