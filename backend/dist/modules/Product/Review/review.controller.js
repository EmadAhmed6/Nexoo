import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Review, validateCreateReview, validateUpdateReview, } from "./review.model.js";
import { Product } from "../product.model.js";
import { updateProductRatingStats } from "./calculateProductRating.js";
import { createNotification } from "../../Notification/notification.controller.js";
// GET PRODUCT REVIEWS
const getProductReviews = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    if (!productId) {
        sendError(res, 400, "Product ID is required");
        return;
    }
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "Product not found");
        return;
    }
    const reviews = await Review.find({ product: productId })
        .populate("user", "fullName username profilePicture email role")
        .sort({ createdAt: -1 });
    successMsg(res, 200, "Reviews fetched successfully", reviews);
});
// CREATE OR SUBMIT REVIEW
const createReview = asyncHandler(async (req, res) => {
    const { error, success } = validateCreateReview(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    const productId = req.params.productId;
    const userId = req.user?.id;
    if (!productId) {
        sendError(res, 400, "Product ID is required");
        return;
    }
    if (!userId) {
        sendError(res, 401, "User not authenticated");
        return;
    }
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "Product not found");
        return;
    }
    const { reviewText, ratings } = req.body;
    let review = await Review.findOne({ product: productId, user: userId });
    let isNewReview = false;
    if (review) {
        review.ratings = ratings;
        review.reviewText = reviewText;
        await review.save();
    }
    else {
        isNewReview = true;
        review = await Review.create({
            product: productId,
            user: userId,
            ratings,
            reviewText,
        });
    }
    const stats = await updateProductRatingStats(productId);
    await review.populate("user", "fullName username profilePicture email role");
    const productOwner = product.userId || product.user;
    if (productOwner && productOwner.toString() !== req.user?.id) {
        const reviewerName = review.user?.fullName ||
            review.user?.username ||
            req.user?.username ||
            "Someone";
        await createNotification({
            user: productOwner,
            title: "New review on your product",
            message: `${reviewerName} gave a ${review.ratings}★ review on "${product.title}"`,
            type: "review",
            relatedId: product._id,
        });
    }
    successMsg(res, isNewReview ? 201 : 200, isNewReview
        ? "Review created successfully"
        : "Review updated successfully", {
        review,
        productRating: stats.ratingAverage,
        productRatingQuantity: stats.ratingQuantity,
    });
});
// UPDATE REVIEW
const updateReview = asyncHandler(async (req, res) => {
    const { error, success } = validateUpdateReview(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    const reviewId = req.params.reviewId;
    const productId = req.params.productId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!reviewId) {
        sendError(res, 400, "Review ID is required");
        return;
    }
    const review = await Review.findById(reviewId);
    if (!review) {
        sendError(res, 404, "Review Not Found");
        return;
    }
    const isOwner = review.user.toString() === userId;
    const isAdmin = userRole === "Admin" || userRole === "SuperAdmin";
    if (!isOwner && !isAdmin) {
        sendError(res, 403, "Not authorized to update this review");
        return;
    }
    const { reviewText, ratings } = req.body;
    if (ratings !== undefined)
        review.ratings = ratings;
    if (reviewText !== undefined)
        review.reviewText = reviewText;
    await review.save();
    const targetProductId = productId || review.product.toString();
    const stats = await updateProductRatingStats(targetProductId);
    await review.populate("user", "fullName username profilePicture email role");
    successMsg(res, 200, "Review updated successfully", {
        review,
        productRating: stats.ratingAverage,
        productRatingQuantity: stats.ratingQuantity,
    });
});
// DELETE REVIEW
const deleteReview = asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const productId = req.params.productId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!reviewId) {
        sendError(res, 400, "Review ID is required");
        return;
    }
    const review = await Review.findById(reviewId);
    if (!review) {
        sendError(res, 404, "Review Not Found");
        return;
    }
    const isOwner = review.user.toString() === userId;
    const isAdmin = userRole === "Admin" || userRole === "SuperAdmin";
    if (!isOwner && !isAdmin) {
        sendError(res, 403, "Not authorized to delete this review");
        return;
    }
    const targetProductId = productId || review.product.toString();
    await review.deleteOne();
    const stats = await updateProductRatingStats(targetProductId);
    successMsg(res, 200, "Review deleted successfully", {
        productRating: stats.ratingAverage,
        productRatingQuantity: stats.ratingQuantity,
    });
});
export { createReview, deleteReview, updateReview, getProductReviews };
//# sourceMappingURL=review.controller.js.map