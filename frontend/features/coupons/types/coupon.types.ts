export interface Coupon {
  _id: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode: string;
  usageLimit: number;
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
