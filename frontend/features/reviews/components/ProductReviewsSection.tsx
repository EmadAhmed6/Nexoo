"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProductReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "../hooks/useReviews";
import { ReviewItem } from "../types/review.types";
import { useAppStore } from "@/store/use-app-store";
import { Button, Text } from "@/_components/shared";

interface ProductReviewsSectionProps {
  productId: string;
  ratingAverage?: number;
  ratingQuantity?: number;
}

export function ProductReviewsSection({
  productId,
  ratingAverage = 0,
  ratingQuantity = 0,
}: ProductReviewsSectionProps) {
  const router = useRouter();
  const { user } = useAppStore();

  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const createReviewMutation = useCreateReview(productId);
  const updateReviewMutation = useUpdateReview(productId);
  const deleteReviewMutation = useDeleteReview(productId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewTextInput, setReviewTextInput] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Check if current user already submitted a review
  const existingUserReview = user
    ? reviews.find((r) => r.user?._id === user._id)
    : null;

  const handleOpenForm = (reviewToEdit?: ReviewItem) => {
    if (!user) {
      toast.error("Please sign in to write a review");
      router.push("/auth/login");
      return;
    }

    if (reviewToEdit) {
      setEditingReviewId(reviewToEdit._id);
      setRatingInput(reviewToEdit.ratings);
      setReviewTextInput(reviewToEdit.reviewText);
    } else if (existingUserReview) {
      setEditingReviewId(existingUserReview._id);
      setRatingInput(existingUserReview.ratings);
      setReviewTextInput(existingUserReview.reviewText);
    } else {
      setEditingReviewId(null);
      setRatingInput(5);
      setReviewTextInput("");
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReviewId(null);
    setReviewTextInput("");
    setRatingInput(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in first");
      router.push("/auth/login");
      return;
    }

    if (!reviewTextInput.trim()) {
      toast.error("Please enter your review text");
      return;
    }

    if (editingReviewId) {
      updateReviewMutation.mutate(
        {
          reviewId: editingReviewId,
          data: { ratings: ratingInput, reviewText: reviewTextInput.trim() },
        },
        {
          onSuccess: () => {
            toast.success("Review updated successfully");
            handleCloseForm();
          },
          onError: (err: unknown) => {
            const msg =
              err instanceof Error ? err.message : "Failed to update review";
            toast.error(msg);
          },
        },
      );
    } else {
      createReviewMutation.mutate(
        {
          ratings: ratingInput,
          reviewText: reviewTextInput.trim(),
        },
        {
          onSuccess: () => {
            toast.success("Review submitted successfully");
            handleCloseForm();
          },
          onError: (err: unknown) => {
            const msg =
              err instanceof Error ? err.message : "Failed to submit review";
            toast.error(msg);
          },
        },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;

    deleteReviewMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        toast.success("Review deleted successfully");
        setDeleteTargetId(null);
        if (editingReviewId === deleteTargetId) {
          handleCloseForm();
        }
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to delete review";
        toast.error(msg);
        setDeleteTargetId(null);
      },
    });
  };

  // Compute rating breakdown (1 to 5 stars)
  const totalReviewsCount = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.ratings) === star).length;
    const percentage =
      totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { star, count, percentage };
  });

  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const isSubmitting =
    createReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <section className="mt-16 pt-12 border-t border-borderPrimary" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Opinions</span>
          </div>
          <Text as="h2" size="2xl" font="black" className="tracking-tight text-textPrimary">
            Reviews & Ratings
          </Text>
          <Text size="sm" color="secondary" className="mt-1">
            Real feedback from verified purchasers and users.
          </Text>
        </div>

        {!isFormOpen && (
          <Button
            variant="primary"
            onClick={() => handleOpenForm(existingUserReview || undefined)}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            {existingUserReview ? "Edit Your Review" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Rating Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Overall Score Card */}
        <div className="p-6 rounded-3xl border border-borderPrimary bg-bgSecondary flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black text-textPrimary tracking-tight">
            {ratingAverage ? ratingAverage.toFixed(1) : "0.0"}
          </span>
          <div className="flex items-center gap-1 my-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= Math.round(ratingAverage);
              return (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    isFilled
                      ? "text-primary fill-primary"
                      : "text-borderPrimary fill-borderPrimary/40"
                  }`}
                />
              );
            })}
          </div>
          <Text size="sm" color="secondary">
            Based on{" "}
            <span className="font-bold text-textPrimary">
              {ratingQuantity || totalReviewsCount}
            </span>{" "}
            verified ratings
          </Text>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-borderPrimary bg-bgSecondary flex flex-col justify-center gap-2.5">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 text-textSecondary font-semibold">
                <span>{star}</span>
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              </div>
              <div className="flex-1 h-2.5 rounded-full bg-borderPrimary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-16 text-right text-textSecondary">
                <span className="font-semibold text-textPrimary">{count}</span>{" "}
                <span className="text-[10px]">({percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form Modal / Inline Card */}
      {isFormOpen && (
        <div className="mb-12 p-6 sm:p-8 rounded-3xl border-2 border-primary/30 bg-bgSecondary/90 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-borderPrimary mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <Text font="bold" size="lg" className="text-textPrimary">
                  {editingReviewId ? "Update Your Review" : "Share Your Experience"}
                </Text>
                <Text size="xs" color="secondary">
                  Your review helps other shoppers make informed choices.
                </Text>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-borderPrimary/40 transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-2">
                Your Rating:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating ?? ratingInput;
                    const isSelected = star <= activeRating;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-hidden"
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isSelected
                              ? "text-primary fill-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                              : "text-borderPrimary hover:text-primary/50"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {ratingLabels[hoverRating ?? ratingInput]} ({hoverRating ?? ratingInput}/5)
                </span>
              </div>
            </div>

            {/* Review Text Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="reviewText"
                  className="text-xs font-bold text-textPrimary"
                >
                  Review Details:
                </label>
                <span className="text-[11px] text-textSecondary">
                  {reviewTextInput.length}/500 characters
                </span>
              </div>
              <textarea
                id="reviewText"
                rows={4}
                maxLength={500}
                value={reviewTextInput}
                onChange={(e) => setReviewTextInput(e.target.value)}
                placeholder="What did you like or dislike about this product? How is the quality, fit, or performance?"
                className="w-full px-4 py-3 rounded-2xl border border-borderPrimary bg-bgPrimary text-sm text-textPrimary placeholder:text-textSecondary/50 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all resize-y"
                required
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCloseForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || !reviewTextInput.trim()}
                leftIcon={
                  isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
              >
                {isSubmitting
                  ? "Saving..."
                  : editingReviewId
                  ? "Update Review"
                  : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center border border-borderPrimary bg-bgSecondary rounded-3xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <Text size="sm" color="secondary">
              Loading reviews...
            </Text>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center border border-borderPrimary bg-bgSecondary rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6" />
            </div>
            <Text font="bold" size="lg" className="text-textPrimary mb-1">
              No Reviews Yet
            </Text>
            <Text size="sm" color="secondary" className="max-w-md mx-auto mb-6">
              Be the first customer to share your thoughts on this product!
            </Text>
            <Button
              variant="primary"
              onClick={() => handleOpenForm()}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Write First Review
            </Button>
          </div>
        ) : (
          reviews.map((rev) => {
            const isAuthor = user && rev.user?._id === user._id;
            const canManage =
              isAuthor || user?.role === "Admin" || user?.role === "SuperAdmin";
            const reviewDate = new Date(rev.createdAt).toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            );

            return (
              <div
                key={rev._id}
                className={`p-6 rounded-3xl border transition-all ${
                  isAuthor
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-borderPrimary bg-bgSecondary hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    {rev.user?.profilePicture?.url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-borderPrimary flex-shrink-0">
                        <Image
                          src={rev.user.profilePicture.url}
                          alt={rev.user.fullName || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(rev.user?.fullName?.[0] || rev.user?.username?.[0] || "U").toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-textPrimary">
                          {rev.user?.fullName || "Verified Buyer"}
                        </span>
                        {isAuthor && (
                          <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-textSecondary mt-0.5">
                        <span>@{rev.user?.username || "shopper"}</span>
                        <span>•</span>
                        <span>{reviewDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars & Author Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.ratings
                              ? "text-primary fill-primary"
                              : "text-borderPrimary fill-borderPrimary/40"
                          }`}
                        />
                      ))}
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 border-l border-borderPrimary pl-2">
                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleOpenForm(rev)}
                            className="p-1.5 rounded-lg text-textSecondary hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit Review"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(rev._id)}
                          className="p-1.5 rounded-lg text-textSecondary hover:text-textError hover:bg-textError/10 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-textPrimary leading-relaxed pl-13 whitespace-pre-line">
                  {rev.reviewText}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Review Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-textError/10 text-textError flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <Text as="h3" font="bold" size="lg" className="text-center text-textPrimary mb-2">
              Delete Review?
            </Text>
            <Text size="sm" color="secondary" className="text-center mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </Text>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setDeleteTargetId(null)}
                disabled={deleteReviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={handleDeleteConfirm}
                disabled={deleteReviewMutation.isPending}
                leftIcon={
                  deleteReviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )
                }
              >
                {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
