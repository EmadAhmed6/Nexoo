"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import {
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product.types";

export const PRODUCT_QUERY_KEYS = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};

/**
 * Hook to retrieve products list with filters & search
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await productsApi.getProducts(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to retrieve single product by ID
 */
export function useProduct(productId: string) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(productId),
    queryFn: async () => {
      const response = await productsApi.getProductById(productId);
      return response.data;
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a product (Admin / Owner)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | CreateProductInput) => {
      const response = await productsApi.createProduct(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | UpdateProductInput) => {
      const response = await productsApi.updateProduct(productId, data);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await productsApi.deleteProduct(productId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
}
