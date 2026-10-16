import { z } from "zod";

const CreateOrderSchema = z.object({
  shippingAddress: z.object({
    address: z
      .string()
      .min(1, "Address is required")
      .min(5, "Address must be at least 5 characters"),
    city: z
      .string()
      .min(1, "City is required")
      .min(2, "City must be at least 2 characters"),
    state: z
      .string()
      .min(1, "State is required")
      .min(2, "State must be at least 2 characters"),
    country: z
      .string()
      .min(1, "Country is required")
      .min(2, "Country must be at least 2 characters"),
    postalCode: z
      .string()
      .min(1, "Postal Code is required")
      .regex(/^\d{5}$/, "Postal Code must be exactly 5 digits"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .refine((val) => /^01\d{9}$/.test(val), {
        message: "Phone number must start with 01 and be exactly 11 digits",
      }),
  }),
  paymentMethod: z.enum(["Paymob", "COD", "Stripe"], {
    message: "Payment method is required",
  }),
});

const UpdateOrderSchema = CreateOrderSchema.partial();

export type ICreateOrderSchema = z.infer<typeof CreateOrderSchema>;
export type IUpdateOrderSchema = z.infer<typeof UpdateOrderSchema>;

export { CreateOrderSchema, UpdateOrderSchema };
