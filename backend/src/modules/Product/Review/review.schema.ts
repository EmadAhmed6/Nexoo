import { z } from "zod";

const CreateReviewSchema = z.object({
  reviewText: z
    .string()
    .trim()
    .min(1, "Review text is required")
    .max(500, "Review text must be at most 500 characters"),
  ratings: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

const UpdateReviewSchema = z.object({
  reviewText: z
    .string()
    .trim()
    .min(1, "Review text cannot be empty")
    .max(500, "Review text must be at most 500 characters")
    .optional(),
  ratings: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
});

export type ICreateReview = z.infer<typeof CreateReviewSchema>;
export type IUpdateReview = z.infer<typeof UpdateReviewSchema>;

export { CreateReviewSchema, UpdateReviewSchema };
