export type BannerLinkType = "category" | "product" | "external" | "none";
export type BannerPosition = "hero_home" | "hero_category" | "hero_product";

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: {
    publicId: string;
    url: string;
  };
  linkType: BannerLinkType;
  linkValue?: string;
  position: BannerPosition;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  image: File;
  linkType?: BannerLinkType;
  linkValue?: string;
  position?: BannerPosition;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string;
  image?: File;
  linkType?: BannerLinkType;
  linkValue?: string;
  position?: BannerPosition;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BannerOverview {
  activeBanners: number;
  totalBanners: number;
  inactiveBanners: number;
  heroHomeBanners: number;
  heroCategoryBanners: number;
  heroProductBanners: number;
}
