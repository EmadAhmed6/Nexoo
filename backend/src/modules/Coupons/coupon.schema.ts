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
    isActive: z.boolean().default(true).optional(),
    startDate: z.coerce.date(),
    expireDate: z.coerce.date(),
  })
  .refine(
    (data) => {
      return data.expireDate > data.startDate;
    },
    {
      message: "Expire date must be after start date",
      path: ["expireDate"],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1 and 100",
      path: ["discountValue"],
    },
  );

const UpdateCouponSchema = z.object({
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().min(0.01).optional(),
  couponCode: z
    .string()
    .min(1)
    .transform((val) => val.toUpperCase())
    .optional(),
  usageLimit: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  expireDate: z.coerce.date().optional(),
});

export type ICreateCoupon = z.infer<typeof CreateCouponSchema>;
export type IUpdateCoupon = z.infer<typeof UpdateCouponSchema>;

export { CreateCouponSchema, UpdateCouponSchema };
