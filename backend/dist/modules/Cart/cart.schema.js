import { z } from "zod";
import { Types } from "mongoose";
const CartItemBaseSchema = z.object({
    productId: z
        .string()
        .min(1, "Product ID must be a valid string")
        .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid Product ID format",
    })
        .optional(),
    product: z
        .string()
        .min(1, "Product ID must be a valid string")
        .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid Product ID format",
    })
        .optional(),
    productQuantity: z
        .number()
        .min(1, "Product Quantity must be at least 1")
        .optional()
        .default(1),
    productPrice: z
        .number()
        .min(0, "Product Price cannot be negative")
        .optional(),
});
const CreateCartSchema = CartItemBaseSchema;
const UpdateCartSchema = CartItemBaseSchema.partial();
export { CreateCartSchema, UpdateCartSchema };
//# sourceMappingURL=cart.schema.js.map