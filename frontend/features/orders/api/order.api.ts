import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios-client";
import {
  Order,
  CreateOrderPayload,
  CreatePayPalOrderResponse,
} from "../types/order.types";

export const orderApi = {
  /**
   * GET /orders — Fetch user's orders
   */
  getOrders: async () => {
    return apiGet<Order[]>("/orders");
  },

  /**
   * GET /orders/:orderId — Fetch order by id
   */
  getOrderById: async (orderId: string) => {
    return apiGet<Order>(`/orders/${orderId}`);
  },

  /**
   * POST /orders — Create new order from user's current cart
   */
  createOrder: async (payload: CreateOrderPayload) => {
    return apiPost<Order, CreateOrderPayload>("/orders", payload);
  },

  /**
   * POST /orders/paypal/create — Generate PayPal transaction and approval link
   */
  createPayPalOrder: async (orderId: string) => {
    return apiPost<CreatePayPalOrderResponse, { orderId: string }>(
      "/orders/paypal/create",
      { orderId },
    );
  },

  /**
   * POST /orders/paypal/capture — Capture PayPal funds after buyer approval
   */
  capturePayPalPayment: async (payload: {
    paypalOrderId: string;
    orderId: string;
  }) => {
    return apiPost<Order, { paypalOrderId: string; orderId: string }>(
      "/orders/paypal/capture",
      payload,
    );
  },

  /**
   * PUT /orders/:orderId — Update order details (if still Pending)
   */
  updateOrder: async (
    orderId: string,
    payload: Partial<CreateOrderPayload>,
  ) => {
    return apiPut<Order, Partial<CreateOrderPayload>>(
      `/orders/${orderId}`,
      payload,
    );
  },

  /**
   * DELETE /orders/:orderId — Cancel/delete order
   */
  deleteOrder: async (orderId: string) => {
    return apiDelete<Order>(`/orders/${orderId}`);
  },
};
