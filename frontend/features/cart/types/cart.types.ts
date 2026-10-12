import { Product } from "@/features/products/types/product.types";

// Backend cart item shape (after populate)
export interface CartItem {
  product: Pick<Product, "_id" | "title" | "price" | "priceAfterDiscount" | "productImages">;
  productQuantity: number;
  productPrice: number;
}

// Backend cart document shape
export interface Cart {
  _id: string;
  userId: string;
  cartItems: CartItem[];
  totalPrice: number;
  totalPriceAfterDiscount?: number;
  couponApplied?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payloads
export interface AddToCartPayload {
  productId: string;
  productQuantity?: number;
}

export interface UpdateCartPayload {
  productQuantity: number;
}

// UI-only store (drawer open/close)
export interface CartUIStore {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}
