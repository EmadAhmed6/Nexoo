import { model, Schema } from "mongoose";
import { CreateReviewSchema, UpdateReviewSchema, } from "./review.schema.js";
const ReviewSchema = new Schema({
    reviewText: {
        type: String,
        required: [true, "Review text is required"],
        minLength: 1,
        maxLength: 500,
        trim: true,
    },
    ratings: {
        type: Number,
        required: [true, "Rating is required"],
        min: 1,
        max: 5,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
}, {
    timestamps: true,
});
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
const Review = model("Review", ReviewSchema);
const validateCreateReview = (review) => {
    return CreateReviewSchema.safeParse(review);
};
const validateUpdateReview = (review) => {
    return UpdateReviewSchema.safeParse(review);
};
export { Review, validateCreateReview, validateUpdateReview };
//# sourceMappingURL=review.model.js.map