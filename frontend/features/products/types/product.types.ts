export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  isOutOfStock?: boolean;
  category: string;
  productImages: ProductImage[];
  ratingAverage?: number;
  ratingQuantity?: number;
  userId?: string;
  likes?: string[];
  likesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: "true" | "false";
  minRating?: number;
  maxRating?: number;
  hasDiscount?: "true" | "false";
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  stock?: number;
  category: string;
  productImages?: FileList | File[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  priceAfterDiscount?: number;
  stock?: number;
  category?: string;
  productImages?: FileList | File[];
}
