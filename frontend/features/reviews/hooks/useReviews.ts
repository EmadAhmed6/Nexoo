"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviews.api";
import {
  CreateReviewPayload,
  UpdateReviewPayload,
} from "../types/review.types";
import { PRODUCT_QUERY_KEYS } from "@/features/products/hooks/useProducts";

export const REVIEW_QUERY_KEYS = {
  all: ["reviews"] as const,
  byProduct: (productId: string) => ["reviews", "product", productId] as const,
};

/**
 * Hook to retrieve all reviews for a product
 */
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.byProduct(productId),
    queryFn: async () => {
      const response = await reviewsApi.getProductReviews(productId);
      return response.data || [];
    },
    enabled: Boolean(productId),
  });
}

/**
 * Hook to create/submit a review
 */
export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewPayload) => {
      const response = await reviewsApi.createReview(productId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REVIEW_QUERY_KEYS.byProduct(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.all,
      });
    },
  });
}

/**
 * Hook to update an existing review
 */
export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdateReviewPayload;
    }) => {
      const response = await reviewsApi.updateReview(reviewId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REVIEW_QUERY_KEYS.byProduct(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.all,
      });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await reviewsApi.deleteReview(reviewId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REVIEW_QUERY_KEYS.byProduct(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.all,
      });
    },
  });
}
