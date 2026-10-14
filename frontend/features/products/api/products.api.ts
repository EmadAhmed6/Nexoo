import { apiGet, apiPost, apiPut, apiPatch, apiDelete, axiosClient } from "@/lib/axios-client";
import { ApiResponse } from "@/types/api.types";
import {
  Product,
  ProductFilters,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product.types";

export const productsApi = {
  /**
   * Get paginated products with filtering and search
   * GET /products
   */
  getProducts: async (filters: ProductFilters = {}) => {
    return apiGet<ProductListResponse>("/products", filters as Record<string, unknown>);
  },

  /**
   * Get single product details by ID
   * GET /products/:productId
   */
  getProductById: async (productId: string) => {
    return apiGet<Product>(`/products/${productId}`);
  },

  /**
   * Create product with multipart image upload (up to 5 files)
   * POST /products
   */
  createProduct: async (data: FormData | CreateProductInput) => {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      payload.append("title", data.title);
      payload.append("description", data.description);
      payload.append("price", String(data.price));
      if (data.priceAfterDiscount !== undefined) {
        payload.append("priceAfterDiscount", String(data.priceAfterDiscount));
      }
      if (data.stock !== undefined) {
        payload.append("stock", String(data.stock));
      }
      payload.append("category", data.category);
      if (data.productImages && data.productImages.length > 0) {
        Array.from(data.productImages).forEach((file) => {
          payload.append("productImages", file);
        });
      }
    }

    const response = await axiosClient.post<ApiResponse<Product>>("/products", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update existing product by ID
   * PUT /products/:productId
   */
  updateProduct: async (productId: string, data: FormData | UpdateProductInput) => {
    let payload: FormData | UpdateProductInput;

    if (data instanceof FormData) {
      payload = data;
      const response = await axiosClient.put<ApiResponse<Product>>(
        `/products/${productId}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } else {
      // Check if images are passed as files
      if (data.productImages && data.productImages.length > 0) {
        const formData = new FormData();
        if (data.title) formData.append("title", data.title);
        if (data.description) formData.append("description", data.description);
        if (data.price !== undefined) formData.append("price", String(data.price));
        if (data.priceAfterDiscount !== undefined) {
          formData.append("priceAfterDiscount", String(data.priceAfterDiscount));
        }
        if (data.stock !== undefined) formData.append("stock", String(data.stock));
        if (data.category) formData.append("category", data.category);
        Array.from(data.productImages).forEach((file) => {
          formData.append("productImages", file);
        });

        const response = await axiosClient.put<ApiResponse<Product>>(
          `/products/${productId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      } else {
        return apiPut<Product>(`/products/${productId}`, data);
      }
    }
  },

  /**
   * Delete product by ID
   * DELETE /products/:productId
   */
  deleteProduct: async (productId: string) => {
    return apiDelete<null>(`/products/${productId}`);
  },

  /**
   * Toggle like on product
   * PATCH /products/:productId
   */
  toggleLikeProduct: async (productId: string) => {
    return apiPatch<Product>(`/products/${productId}`);
  },
};
