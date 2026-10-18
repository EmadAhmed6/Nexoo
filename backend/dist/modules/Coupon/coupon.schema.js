import z from "zod";
const CreateCouponSchema = z
    .object({
    discountType: z.enum(["percentage", "fixed"], {
        message: "Invalid discount type",
    }),
    discountValue: z
        .number()
        .min(0.01, "Discount value must be greater than 0"),
    couponCode: z
        .string()
        .min(1, "Coupon code is required")
        .transform((val) => val.toUpperCase()),
    usageLimit: z
        .number()
        .min(1, "Usage limit must be greater than 0")
        .default(10)
        .optional(),
    usageLimitPerUser: z
        .number()
        .min(1, "Usage limit per user must be at least 1")
        .default(1)
        .optional(),
    minOrderValue: z
        .number()
        .min(0, "Minimum order value cannot be negative")
        .default(0)
        .optional(),
    applicableCategories: z.array(z.string()).default([]).optional(),
    maxUsersLimit: z.number().min(1).nullable().optional(),
    isActive: z.boolean().default(true).optional(),
    startDate: z.coerce.date(),
    expireDate: z.coerce.date(),
})
    .refine((data) => {
    return data.expireDate > data.startDate;
}, {
    message: "Expire date must be after start date",
    path: ["expireDate"],
})
    .refine((data) => {
    if (data.discountType === "percentage") {
        return data.discountValue <= 100;
    }
    return true;
}, {
    message: "Percentage discount must be between 1 and 100",
    path: ["discountValue"],
});
const UpdateCouponSchema = z.object({
    discountType: z.enum(["percentage", "fixed"]).optional(),
    discountValue: z.number().min(0.01).optional(),
    couponCode: z
        .string()
        .min(1)
        .transform((val) => val.toUpperCase())
        .optional(),
    usageLimit: z.number().min(1).optional(),
    usageLimitPerUser: z.number().min(1).optional(),
    minOrderValue: z.number().min(0).optional(),
    applicableCategories: z.array(z.string()).optional(),
    maxUsersLimit: z.number().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    expireDate: z.coerce.date().optional(),
});
export { CreateCouponSchema, UpdateCouponSchema };
//# sourceMappingURL=coupon.schema.js.map