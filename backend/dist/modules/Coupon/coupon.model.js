import { model, Schema, Types } from "mongoose";
import { CreateCouponSchema, UpdateCouponSchema, } from "../Coupon/coupon.schema.js";
const CouponSchema = new Schema({
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
}, {
    timestamps: true,
});
const Coupon = model("Coupon", CouponSchema);
const validateCreateCoupon = (coupon) => {
    return CreateCouponSchema.safeParse(coupon);
};
const validateUpdateCoupon = (coupon) => {
    return UpdateCouponSchema.safeParse(coupon);
};
export { Coupon, validateCreateCoupon, validateUpdateCoupon };
//# sourceMappingURL=coupon.model.js.map