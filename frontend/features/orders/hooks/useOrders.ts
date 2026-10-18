"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order.api";
import { CreateOrderPayload } from "../types/order.types";
import { useAppStore } from "@/store/use-app-store";
import { CART_QUERY_KEY } from "@/features/cart/hooks/useCart";

export const ORDERS_QUERY_KEY = ["orders"] as const;

export function useOrders() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await orderApi.getOrders();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useOrder(orderId: string) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, orderId],
    queryFn: async () => {
      const res = await orderApi.getOrderById(orderId);
      return res.data ?? null;
    },
    enabled: isAuthenticated && Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApi.createOrder(payload),
    onSuccess: () => {
      // Order creation empties the cart in backend
      queryClient.setQueryData(CART_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useCreatePaymobOrder() {
  return useMutation({
    mutationFn: (orderId: string) => orderApi.createPaymobOrder(orderId),
  });
}

export function useVerifyPaymobPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      orderId: string;
      success?: boolean | string;
      transactionId?: string | number;
    }) => orderApi.verifyPaymobPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export const ADMIN_ORDERS_QUERY_KEY = ["admin", "orders"] as const;

export function useAdminOrders() {
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  return useQuery({
    queryKey: ADMIN_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await orderApi.getAdminOrders();
      return res.data ?? [];
    },
    enabled: isAdmin,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminOrder(orderId: string) {
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  return useQuery({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, orderId],
    queryFn: async () => {
      const res = await orderApi.getAdminOrderById(orderId);
      return res.data ?? null;
    },
    enabled: isAdmin && Boolean(orderId),
  });
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: {
        orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
        isPaid?: boolean;
      };
    }) => orderApi.updateAdminOrderStatus(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

