"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, UpdateUserPayload, AddressPayload, ChangePasswordPayload } from "../api/user.api";
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
      const authId = authUser?._id || (authUser as any)?.id;
      if (res.data && authId === variables.userId) {
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

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      banDuration,
    }: {
      userId: string;
      banDuration: number;
    }) => userApi.banUser(userId, banDuration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useToggleAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.toggleAdminStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}

/**
 * Mutation hook to change the authenticated user's password
 * PUT /users/:userId/change-password
 */
export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userApi.changePassword(userId, payload),
  });
}

/**
 * Mutation hook to upload or replace a user's profile picture
 * Sends file as multipart/form-data
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAppStore();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userApi.uploadProfilePicture(userId, file),
    onSuccess: (res, variables) => {
      const updatedUser = (res as any)?.data;
      const authId = authUser?._id || (authUser as any)?.id;
      if (updatedUser && authId === variables.userId) {
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
    },
  });
}

/**
 * Mutation hook to delete the user's profile picture from Cloudinary
 * DELETE /users/:userId/profile-picture
 */
export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAppStore();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteProfilePicture(userId),
    onSuccess: (_, userId) => {
      const authId = authUser?._id || (authUser as any)?.id;
      if (authUser && authId === userId) {
        setUser({ ...authUser, profilePicture: null });
      }
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
    },
  });
}
