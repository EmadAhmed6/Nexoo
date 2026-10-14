import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios-client";
import {
  ReviewItem,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewResponseData,
} from "../types/review.types";

export const reviewsApi = {
  /**
   * Get all reviews for a product
   * GET /reviews/:productId
   */
  getProductReviews: async (productId: string) => {
    return apiGet<ReviewItem[]>(`/reviews/${productId}`);
  },

  /**
   * Create or submit review for a product
   * POST /reviews/:productId
   */
  createReview: async (productId: string, data: CreateReviewPayload) => {
    return apiPost<ReviewResponseData>(`/reviews/${productId}`, data);
  },

  /**
   * Update existing review by reviewId
   * PUT /reviews/:reviewId
   */
  updateReview: async (reviewId: string, data: UpdateReviewPayload) => {
    return apiPut<ReviewResponseData>(`/reviews/${reviewId}`, data);
  },

  /**
   * Delete review by reviewId
   * DELETE /reviews/:reviewId
   */
  deleteReview: async (reviewId: string) => {
    return apiDelete<{ productRating: number; productRatingQuantity: number }>(
      `/reviews/${reviewId}`,
    );
  },
};
