import { apiGet, apiPut, apiDelete } from "@/lib/axios-client";
import { User } from "@/features/auth/types/auth.types";

export interface UpdateUserPayload {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "User" | "Admin" | "SuperAdmin";
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
};
