import { Document, model, Schema, Types } from "mongoose";
import {
  CreateReviewSchema,
  ICreateReview,
  IUpdateReview,
  UpdateReviewSchema,
} from "./review.schema.js";

export interface IReview extends Document {
  reviewText: string;
  ratings: number;
  product: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
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
  },
  {
    timestamps: true,
  },
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = model<IReview>("Review", ReviewSchema);

const validateCreateReview = (review: ICreateReview) => {
  return CreateReviewSchema.safeParse(review);
};

const validateUpdateReview = (review: IUpdateReview) => {
  return UpdateReviewSchema.safeParse(review);
};

export { Review, validateCreateReview, validateUpdateReview };
