import { axiosClient, apiGet, apiDelete } from "@/lib/axios-client";
import { ApiResponse } from "@/types/api.types";
import {
  Banner,
  BannerPosition,
  BannerOverview,
  CreateBannerInput,
  UpdateBannerInput,
} from "../types/banner.types";

export const bannerApi = {
  /** GET /banners — Public: retrieve active banners by position */
  getActiveBanners: async (position: BannerPosition | "all" = "hero_home") => {
    return apiGet<Banner[]>("/banners", { position });
  },

  /** GET /admin/banners/overview — Admin: retrieve banner overview statistics */
  getBannerOverview: async () => {
    return apiGet<BannerOverview>("/admin/banners/overview");
  },

  /** GET /admin/banners — Admin: retrieve all banners */
  getAdminBanners: async (position?: string) => {
    return apiGet<Banner[]>(
      "/admin/banners",
      position && position !== "all" ? { position } : undefined,
    );
  },

  /** GET /admin/banners/:id — Admin: get single banner */
  getAdminBannerById: async (bannerId: string) => {
    return apiGet<Banner>(`/admin/banners/${bannerId}`);
  },

  /** POST /admin/banners — Admin: create a new banner */
  createBanner: async (data: FormData | CreateBannerInput) => {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      payload.append("title", data.title);
      if (data.subtitle) payload.append("subtitle", data.subtitle);
      if (data.image) payload.append("image", data.image);
      if (data.linkType) payload.append("linkType", data.linkType);
      if (data.linkValue) payload.append("linkValue", data.linkValue);
      if (data.position) payload.append("position", data.position);
      if (data.priority !== undefined) payload.append("priority", String(data.priority));
      if (data.isActive !== undefined) payload.append("isActive", String(data.isActive));
      if (data.startDate) payload.append("startDate", data.startDate);
      if (data.endDate) payload.append("endDate", data.endDate);
    }

    const response = await axiosClient.post<ApiResponse<Banner>>(
      "/admin/banners",
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /** PUT /admin/banners/:id — Admin: update an existing banner */
  updateBanner: async (bannerId: string, data: FormData | UpdateBannerInput) => {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      if (data.title !== undefined) payload.append("title", data.title);
      if (data.subtitle !== undefined) payload.append("subtitle", data.subtitle);
      if (data.image) payload.append("image", data.image);
      if (data.linkType !== undefined) payload.append("linkType", data.linkType);
      if (data.linkValue !== undefined) payload.append("linkValue", data.linkValue);
      if (data.position !== undefined) payload.append("position", data.position);
      if (data.priority !== undefined) payload.append("priority", String(data.priority));
      if (data.isActive !== undefined) payload.append("isActive", String(data.isActive));
      if (data.startDate !== undefined) payload.append("startDate", data.startDate);
      if (data.endDate !== undefined) payload.append("endDate", data.endDate);
    }

    const response = await axiosClient.put<ApiResponse<Banner>>(
      `/admin/banners/${bannerId}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /** DELETE /admin/banners/:id — Admin: delete banner */
  deleteBanner: async (bannerId: string) => {
    return apiDelete<null>(`/admin/banners/${bannerId}`);
  },
};
