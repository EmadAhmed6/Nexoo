import { apiGet, apiPut, apiPost, apiDelete, apiPatch, axiosClient } from "@/lib/axios-client";
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

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
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

  toggleAdminStatus: async (userId: string) => {
    return apiPatch<User>(`/admin/users/${userId}/toggle-admin`);
  },

  /**
   * Change password for authenticated user
   * PUT /users/:userId/change-password
   */
  changePassword: async (userId: string, payload: ChangePasswordPayload) => {
    return apiPut<null, ChangePasswordPayload>(
      `/users/${userId}/change-password`,
      payload
    );
  },

  /**
   * Upload or replace profile picture
   * PUT /users/:userId  (multipart/form-data with field "profilePicture")
   */
  uploadProfilePicture: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await axiosClient.put<{ data: User }>(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Delete profile picture from Cloudinary and unset on user
   * DELETE /users/:userId/profile-picture
   */
  deleteProfilePicture: async (userId: string) => {
    return apiDelete<null>(`/users/${userId}/profile-picture`);
  },
};
