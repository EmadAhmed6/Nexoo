import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAuthToken, setAuthToken, removeAuthToken } from "./cookies";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
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

let refreshPromise: Promise<string | null> | null = null;

// Response Interceptor: Format errors and handle silent token refresh
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _refreshFailed?: boolean;
    };

    if (typeof window !== "undefined" && originalRequest) {
      const url = originalRequest.url || "";
      const isAuthUrl =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout");

      if (error.response?.status === 401 && !isAuthUrl && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = (async () => {
              try {
                const response = await axios.get<{ data?: string; accessToken?: string }>(
                  `${BASE_URL}/auth/refresh`,
                  {
                    withCredentials: true,
                    timeout: 15000,
                    headers: {
                      Accept: "application/json",
                    },
                  }
                );

                const newAccessToken =
                  response.data?.data || response.data?.accessToken;

                if (newAccessToken && typeof newAccessToken === "string") {
                  setAuthToken(newAccessToken);
                  return newAccessToken;
                }
                removeAuthToken();
                window.dispatchEvent(new CustomEvent("nexo:unauthorized"));
                return null;
              } catch (refreshErr) {
                const status = axios.isAxiosError(refreshErr)
                  ? refreshErr.response?.status
                  : undefined;
                if (status && [400, 401, 403].includes(status)) {
                  removeAuthToken();
                  window.dispatchEvent(new CustomEvent("nexo:unauthorized"));
                }
                return null;
              } finally {
                refreshPromise = null;
              }
            })();
          }

          const newAccessToken = await refreshPromise;

          if (newAccessToken) {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return axiosClient(originalRequest);
          }
          originalRequest._refreshFailed = true;
        } catch (refreshErr) {
          originalRequest._refreshFailed = true;
          return Promise.reject(refreshErr);
        }
      }

      if (
        error.response?.status === 401 &&
        originalRequest._retry &&
        !originalRequest._refreshFailed &&
        !isAuthUrl
      ) {
        removeAuthToken();
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

