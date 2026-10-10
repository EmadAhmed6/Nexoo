import { apiGet, apiPost } from "@/lib/axios-client";
import {
  AuthResponseData,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth.types";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return apiPost<AuthResponseData, LoginCredentials>("/auth/login", credentials);
  },

  register: async (credentials: RegisterCredentials) => {
    return apiPost<AuthResponseData, RegisterCredentials>("/auth/register", credentials);
  },

  /**
   * Fetch current authenticated user profile
   * GET /auth/me
   */
  getMe: async () => {
    return apiGet<User>("/auth/me");
  },

  getProfile: async (userId: string) => {
    return apiGet<User>(`/users/${userId}`);
  },
};
