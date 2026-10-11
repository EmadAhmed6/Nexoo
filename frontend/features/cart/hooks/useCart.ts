"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";
import { AddToCartPayload, UpdateCartPayload } from "../types/cart.types";
import { useAppStore } from "@/store/use-app-store";
import { useCartStore } from "../store/useCartStore";

export const CART_QUERY_KEY = ["cart"] as const;

export function useCart() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await cartApi.getCart();
      // Backend returns 404 when cart is empty — treat as empty cart
      return res.data ?? null;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 min
    retry: (failureCount, error) => {
      // Don't retry on 404 (empty cart)
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 2;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const openCart = useCartStore((s) => s.openCart);

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      openCart();
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: UpdateCartPayload;
    }) => cartApi.updateCartItem(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartApi.removeFromCart(productId),
    onSuccess: (response) => {
      if (response?.data !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, response.data);
      } else {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(CART_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

