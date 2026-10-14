import { apiGet, apiPost, apiDelete } from "@/lib/axios-client";
import { Wishlist } from "../types/wishlist.types";

export const wishlistApi = {
  /**
   * GET /wishlist — Fetch authenticated user's wishlist
   */
  getWishlist: async () => {
    return apiGet<Wishlist>("/wishlist");
  },

  /**
   * POST /wishlist/:productId — Add product to wishlist
   */
  addToWishlist: async (productId: string) => {
    return apiPost<Wishlist>(`/wishlist/${productId}`);
  },

  /**
   * DELETE /wishlist/:productId — Remove product from wishlist
   */
  removeFromWishlist: async (productId: string) => {
    return apiDelete<Wishlist>(`/wishlist/${productId}`);
  },

  /**
   * DELETE /wishlist — Clear authenticated user's wishlist
   */
  clearWishlist: async () => {
    return apiDelete<Wishlist>("/wishlist");
  },
};
