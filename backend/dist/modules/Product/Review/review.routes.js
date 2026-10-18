import express from "express";
import { createReview, deleteReview, getProductReviews, updateReview, } from "./review.controller.js";
import { verifyToken } from "../../../middlewares/verifyToken.js";
const router = express.Router({ mergeParams: true });
router.route("/").get(getProductReviews).post(verifyToken, createReview);
router
    .route("/:productId")
    .get(getProductReviews)
    .post(verifyToken, createReview);
router
    .route("/:reviewId")
    .put(verifyToken, updateReview)
    .delete(verifyToken, deleteReview);
router
    .route("/:productId/:reviewId")
    .put(verifyToken, updateReview)
    .delete(verifyToken, deleteReview);
export default router;
//# sourceMappingURL=review.routes.js.map