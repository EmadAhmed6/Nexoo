"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "../api/coupon.api";
import { CreateCouponPayload, UpdateCouponPayload } from "../types/coupon.types";
import { CART_QUERY_KEY } from "@/features/cart/hooks/useCart";

export const COUPONS_QUERY_KEY = ["coupons"] as const;

/** Admin: get all coupons */
export function useCoupons() {
  return useQuery({
    queryKey: COUPONS_QUERY_KEY,
    queryFn: async () => {
      const res = await couponApi.getCoupons();
      return res.data ?? [];
    },
  });
}

/** Admin: create a coupon */
export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponApi.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
  });
}

/** Admin: update a coupon */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ couponId, payload }: { couponId: string; payload: UpdateCouponPayload }) =>
      couponApi.updateCoupon(couponId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
  });
}

/** Admin: delete a coupon */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => couponApi.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
  });
}

/** User: apply coupon to cart */
export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponCode: string) => couponApi.applyCoupon(couponCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/** User: remove coupon from cart */
export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => couponApi.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}
