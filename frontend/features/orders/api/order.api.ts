import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/axios-client";
import {
  Order,
  CreateOrderPayload,
  CreatePaymobOrderResponse,
  UpdateAdminOrderStatusPayload,
  AdminOrderFilterParams,
  AdminOrderOverview,
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
   * POST /orders/paymob/create — Generate Paymob transaction and checkout link
   */
  createPaymobOrder: async (orderId: string) => {
    return apiPost<CreatePaymobOrderResponse, { orderId: string }>(
      "/orders/paymob/create",
      { orderId },
    );
  },

  /**
   * POST /orders/paymob/verify — Verify Paymob payment outcome
   */
  verifyPaymobPayment: async (payload: {
    orderId: string;
    success?: boolean | string;
    transactionId?: string | number;
  }) => {
    return apiPost<
      Order,
      {
        orderId: string;
        success?: boolean | string;
        transactionId?: string | number;
      }
    >("/orders/paymob/verify", payload);
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

  /**
   * Admin: GET /admin/orders — Fetch all system orders with optional filtering
   */
  getAdminOrders: async (params?: AdminOrderFilterParams) => {
    return apiGet<Order[]>("/admin/orders", params as Record<string, unknown>);
  },

  /**
   * Admin: GET /admin/orders/overview — Fetch orders statistics
   */
  getAdminOrderOverview: async () => {
    return apiGet<AdminOrderOverview>("/admin/orders/overview");
  },

  /**
   * Admin: GET /admin/orders/:orderId — Fetch single order details
   */
  getAdminOrderById: async (orderId: string) => {
    return apiGet<Order>(`/admin/orders/${orderId}`);
  },

  /**
   * Admin: PATCH /admin/orders/:orderId — Update order status (or payment)
   */
  updateAdminOrderStatus: async (
    orderId: string,
    payload: UpdateAdminOrderStatusPayload,
  ) => {
    return apiPatch<Order, UpdateAdminOrderStatusPayload>(
      `/admin/orders/${orderId}`,
      payload,
    );
  },
};

