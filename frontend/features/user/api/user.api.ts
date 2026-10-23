import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/axios-client";
import { User, UserAddress } from "@/features/auth/types/auth.types";

export interface UpdateUserPayload {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "User" | "Admin" | "SuperAdmin";
}

export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  phone: string;
  isDefault?: boolean;
}

export const userApi = {
  getUserById: async (userId: string) => {
    return apiGet<User>(`/users/${userId}`);
  },

  updateUser: async (userId: string, payload: UpdateUserPayload) => {
    return apiPut<User>(`/users/${userId}`, payload);
  },

  deleteUser: async (userId: string) => {
    return apiDelete<null>(`/users/${userId}`);
  },

  getUserAddresses: async (userId: string) => {
    return apiGet<UserAddress[]>(`/users/${userId}/addresses`);
  },

  addUserAddress: async (userId: string, payload: AddressPayload) => {
    return apiPost<UserAddress[]>(`/users/${userId}/addresses`, payload);
  },

  updateUserAddress: async (
    userId: string,
    addressId: string,
    payload: Partial<AddressPayload>
  ) => {
    return apiPut<UserAddress[]>(
      `/users/${userId}/addresses/${addressId}`,
      payload
    );
  },

  deleteUserAddress: async (userId: string, addressId: string) => {
    return apiDelete<UserAddress[]>(`/users/${userId}/addresses/${addressId}`);
  },

  banUser: async (userId: string, banDuration: number) => {
    return apiPut<User, { banDuration: number }>(`/admin/users/${userId}/ban`, {
      banDuration,
    });
  },

  unbanUser: async (userId: string) => {
    return apiPut<User>(`/admin/users/${userId}/unban`);
  },
};
