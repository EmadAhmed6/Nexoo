import z from "zod";

const CreateCouponSchema = z.object({
  discountType: z.enum(["percentage", "fixed"], {
    message: "Invalid discount type",
  }),
  discountValue: z
    .number()
    .min(0.01, "Discount value must be greater than 0"),
  couponCode: z.string().min(1, "Coupon code is required"),
  usageLimit: z.number().min(1, "Usage limit must be greater than 0").default(10).optional(),
  isActive: z.boolean().default(true).optional(),
  startDate: z.coerce.date(),
  expireDate: z.coerce.date(),
});
const UpdateCouponSchema = CreateCouponSchema.partial();

export type ICreateCoupon = z.infer<typeof CreateCouponSchema>;
export type IUpdateCoupon = z.infer<typeof UpdateCouponSchema>;

export { CreateCouponSchema, UpdateCouponSchema };
