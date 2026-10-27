import { apiGet, apiPost } from "@/lib/axios-client";
import {
  AuthResponseData,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordPayload,
  User,
  VerifyOtpPayload,
} from "../types/auth.types";

export interface ResendOtpPayload {
  email: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return apiPost<null, LoginCredentials>("/auth/login", credentials);
  },

  register: async (credentials: RegisterCredentials) => {
    return apiPost<AuthResponseData, RegisterCredentials>("/auth/register", credentials);
  },

  /**
   * Request password reset link by email
   * POST /auth/forgot-password
   */
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    return apiPost<null, ForgotPasswordPayload>("/auth/forgot-password", payload);
  },

  /**
   * Verify email OTP after registration
   * POST /auth/verify-otp
   */
  verifyOtp: async (payload: VerifyOtpPayload) => {
    return apiPost<AuthResponseData, VerifyOtpPayload>("/auth/verify-otp", payload);
  },

  /**
   * Resend OTP verification email
   * POST /auth/resend-otp
   */
  resendOtp: async (payload: ResendOtpPayload) => {
    return apiPost<null, ResendOtpPayload>("/auth/resend-otp", payload);
  },

  /**
   * Reset password with token and email
   * POST /auth/reset-password
   */
  resetPassword: async (payload: ResetPasswordPayload) => {
    return apiPost<null, ResetPasswordPayload>("/auth/reset-password", payload);
  },

  /**
   * Refresh JWT access token using httpOnly refreshToken cookie
   * GET /auth/refresh
   */
  refreshToken: async () => {
    return apiGet<string>("/auth/refresh");
  },

  /**
   * Log out user, remove refreshToken cookie on server
   * POST /auth/logout
   */
  logout: async () => {
    return apiPost<null>("/auth/logout");
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
