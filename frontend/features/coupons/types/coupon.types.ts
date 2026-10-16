export interface Coupon {
  _id: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode: string;
  usageLimit: number;
  usageLimitPerUser?: number;
  minOrderValue?: number;
  applicableCategories?: string[];
  maxUsersLimit?: number | null;
  usedBy?: { user: string; count: number }[];
  usedCount: number;
  isActive: boolean;
  startDate: string;
  expireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minOrderValue?: number;
  applicableCategories?: string[];
  maxUsersLimit?: number | null;
  isActive?: boolean;
  startDate: string;
  expireDate: string;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}

export interface ApplyCouponResponse {
  originalTotal: number;
  discountAmount: number;
  finalPrice: number;
  couponCode: string;
}
