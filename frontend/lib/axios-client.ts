import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAuthToken, removeAuthToken } from "./cookies";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach JWT Token from js-cookie
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format errors and handle auth invalidation
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (typeof window !== "undefined") {
      // If unauthorized (401), clean credentials
      if (error.response?.status === 401) {
        removeAuthToken();
        // Optional dispatch for UI notification
        window.dispatchEvent(new CustomEvent("nexo:unauthorized"));
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "حدث خطأ غير متوقع في الاتصال بالخادم";

    return Promise.reject(new Error(message));
  }
);

// High-level Typed API helpers
export async function apiGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const response = await axiosClient.get<ApiResponse<T>>(endpoint, { params });
  return response.data;
}

export async function apiPost<T, B = unknown>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
  const response = await axiosClient.post<ApiResponse<T>>(endpoint, body);
  return response.data;
}

export async function apiPut<T, B = unknown>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
  const response = await axiosClient.put<ApiResponse<T>>(endpoint, body);
  return response.data;
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await axiosClient.delete<ApiResponse<T>>(endpoint);
  return response.data;
}

export async function apiPatch<T, B = unknown>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
  const response = await axiosClient.patch<ApiResponse<T>>(endpoint, body);
  return response.data;
}

