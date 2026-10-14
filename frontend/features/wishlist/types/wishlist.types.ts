import { Product } from "@/features/products/types/product.types";

export interface Wishlist {
  _id: string;
  user: string;
  products: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ToggleWishlistPayload {
  productId: string;
}
