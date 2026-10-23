"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerApi } from "../api/banner.api";
import {
  BannerPosition,
  CreateBannerInput,
  UpdateBannerInput,
} from "../types/banner.types";

export const ACTIVE_BANNERS_QUERY_KEY = ["banners", "active"] as const;
export const ADMIN_BANNERS_QUERY_KEY = ["banners", "admin"] as const;

/** Public: get active banners */
export function useActiveBanners(position: BannerPosition | "all" = "hero_home") {
  return useQuery({
    queryKey: [...ACTIVE_BANNERS_QUERY_KEY, position],
    queryFn: async () => {
      const res = await bannerApi.getActiveBanners(position);
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/** Admin: get all banners */
export function useAdminBanners(position?: string) {
  return useQuery({
    queryKey: [...ADMIN_BANNERS_QUERY_KEY, position ?? "all"],
    queryFn: async () => {
      const res = await bannerApi.getAdminBanners(position);
      return res.data ?? [];
    },
  });
}

/** Admin: get banner overview statistics */
export function useBannerOverview() {
  return useQuery({
    queryKey: [...ADMIN_BANNERS_QUERY_KEY, "overview"],
    queryFn: async () => {
      const res = await bannerApi.getBannerOverview();
      return res.data ?? null;
    },
  });
}

/** Admin: get single banner */
export function useAdminBanner(bannerId: string) {
  return useQuery({
    queryKey: [...ADMIN_BANNERS_QUERY_KEY, "detail", bannerId],
    queryFn: async () => {
      if (!bannerId) return null;
      const res = await bannerApi.getAdminBannerById(bannerId);
      return res.data ?? null;
    },
    enabled: Boolean(bannerId),
  });
}

/** Admin: create a new banner */
export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | CreateBannerInput) => bannerApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_BANNERS_QUERY_KEY });
    },
  });
}

/** Admin: update banner */
export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bannerId,
      data,
    }: {
      bannerId: string;
      data: FormData | UpdateBannerInput;
    }) => bannerApi.updateBanner(bannerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_BANNERS_QUERY_KEY });
    },
  });
}

/** Admin: delete banner */
export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bannerId: string) => bannerApi.deleteBanner(bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_BANNERS_QUERY_KEY });
    },
  });
}
