import { z } from "zod";

const createProductSchema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(10).max(1000),
  price: z.coerce.number().min(0),
  priceAfterDiscount: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0).default(0),
  category: z.string().min(3),
});

const updateProductSchema = createProductSchema.partial();

export type ICreateProductSchema = z.infer<typeof createProductSchema>;
export type IUpdateProductSchema = z.infer<typeof updateProductSchema>;

export { createProductSchema, updateProductSchema };
