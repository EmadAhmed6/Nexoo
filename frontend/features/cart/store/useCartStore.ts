import { create } from "zustand";
import { CartUIStore } from "../types/cart.types";

/**
 * UI-only store: manages the cart drawer open/close state.
 * All cart data is fetched from the backend via useCart() hook.
 */
export const useCartStore = create<CartUIStore>()((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
