import { Types } from "mongoose";
import { Review } from "./review.model.js";
import { Product } from "../product.model.js";
export const updateProductRatingStats = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product: new Types.ObjectId(productId) } },
        {
            $group: {
                _id: "$product",
                ratingQuantity: { $sum: 1 },
                avgRating: { $avg: "$ratings" },
            },
        },
    ]);
    let avg = 0;
    let quantity = 0;
    if (stats.length > 0) {
        quantity = stats[0].ratingQuantity;
        avg = +stats[0].avgRating.toFixed(2);
    }
    await Product.findByIdAndUpdate(productId, {
        ratings: avg,
        ratingAverage: avg,
        ratingQuantity: quantity,
    });
    return { ratingAverage: avg, ratingQuantity: quantity };
};
//# sourceMappingURL=calculateProductRating.js.map