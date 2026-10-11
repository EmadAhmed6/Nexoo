import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios-client";
import { Cart, AddToCartPayload, UpdateCartPayload } from "../types/cart.types";

export const cartApi = {
  /**
   * GET /cart — Fetch the authenticated user's cart
   */
  getCart: async () => {
    return apiGet<Cart>("/cart");
  },

  /**
   * POST /cart/:productId — Add a product to cart
   */
  addToCart: async (payload: AddToCartPayload) => {
    return apiPost<Cart, { productQuantity: number }>(
      `/cart/${payload.productId}`,
      {
        productQuantity: payload.productQuantity ?? 1,
      },
    );
  },

  /**
   * PUT /cart/:productId — Update quantity of a cart item
   */
  updateCartItem: async (productId: string, payload: UpdateCartPayload) => {
    return apiPut<Cart, UpdateCartPayload>(`/cart/${productId}`, payload);
  },

  /**
   * DELETE /cart/:productId — Remove a product from cart
   */
  removeFromCart: async (productId: string) => {
    return apiDelete<Cart | null>(`/cart/${productId}`);
  },

  /**
   * DELETE /cart — Clear authenticated user's cart
   */
  clearCart: async () => {
    return apiDelete<{ cartItems: []; totalPrice: number }>("/cart");
  },
};
