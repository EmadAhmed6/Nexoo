import { model, Schema, Types } from "mongoose";
import {
  CreateCouponSchema,
  ICreateCoupon,
  IUpdateCoupon,
  UpdateCouponSchema,
} from "./coupon.schema.js";

interface ICoupon {
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode: string;
  usageLimit: number;
  usageLimitPerUser?: number;
  usedBy: {
    user: Types.ObjectId;
    count: number;
  }[];
  minOrderValue: number;
  applicableCategories?: string[];
  maxUsersLimit: number | null;
  isActive: boolean;
  startDate: Date;
  usedCount: number;
  expireDate: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      required: true,
      minLength: 1,
      trim: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      default: 10,
    },
    usageLimitPerUser: {
      type: Number,
      required: true,
      default: 1,
    },
    usedBy: {
      type: [
        {
          user: {
            type: Types.ObjectId,
            ref: "User",
          },
          count: {
            type: Number,
            required: true,
            default: 0,
          },
        },
      ],
      required: true,
      default: [],
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    minOrderValue: {
      type: Number,
      required: true,
      default: 0,
    },
    maxUsersLimit: { type: Number, default: null },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    usedCount: {
      type: Number,
      required: true,
      default: 0,
    },
    expireDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Coupon = model<ICoupon>("Coupon", CouponSchema);

const validateCreateCoupon = (coupon: ICreateCoupon) => {
  return CreateCouponSchema.safeParse(coupon);
};

const validateUpdateCoupon = (coupon: IUpdateCoupon) => {
  return UpdateCouponSchema.safeParse(coupon);
};

export { Coupon, validateCreateCoupon, validateUpdateCoupon };
