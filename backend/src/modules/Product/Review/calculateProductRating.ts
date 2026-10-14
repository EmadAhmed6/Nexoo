import { Types } from "mongoose";
import { Review } from "./review.model.js";
import { Product } from "../product.model.js";

export const updateProductRatingStats = async (
  productId: string | Types.ObjectId,
) => {
  const allReviews = await Review.find({ product: productId });
  const totalSum = allReviews.reduce((sum, item) => sum + item.ratings, 0);
  const avg =
    allReviews.length > 0 ? +(totalSum / allReviews.length).toFixed(2) : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: avg,
    ratingAverage: avg,
    ratingQuantity: allReviews.length,
  });

  return { ratingAverage: avg, ratingQuantity: allReviews.length };
};
