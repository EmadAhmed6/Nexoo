import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios-client";
import {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  ApplyCouponResponse,
} from "../types/coupon.types";

export const couponApi = {
  /** GET /coupons — Admin: list all coupons */
  getCoupons: () => apiGet<Coupon[]>("/coupons"),

  /** POST /coupons — Admin: create coupon */
  createCoupon: (payload: CreateCouponPayload) =>
    apiPost<Coupon, CreateCouponPayload>("/coupons", payload),

  /** PUT /coupons/:id — Admin: update coupon */
  updateCoupon: (couponId: string, payload: UpdateCouponPayload) =>
    apiPut<Coupon, UpdateCouponPayload>(`/coupons/${couponId}`, payload),

  /** DELETE /coupons/:id — Admin: delete coupon */
  deleteCoupon: (couponId: string) => apiDelete<null>(`/coupons/${couponId}`),

  /** POST /coupons/apply — User: apply coupon to cart */
  applyCoupon: (couponCode: string) =>
    apiPost<ApplyCouponResponse, { couponCode: string }>("/coupons/apply", {
      couponCode,
    }),

  /** DELETE /coupons/remove — User: remove coupon from cart */
  removeCoupon: () => apiDelete<null>("/coupons/remove"),
};
