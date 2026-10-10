import { Document, model, Schema } from "mongoose";
import {
  createProductSchema,
  ICreateProductSchema,
  IUpdateProductSchema,
  updateProductSchema,
} from "./product.schema.js";
type Category =
  | "Electronics"
  | "Clothes"
  | "Shoes"
  | "Furniture"
  | "Bags"
  | "Books"
  | "Accessories"
  | "Watches & Accessories"
  | "Luxury Fragrances"
  | "Eyewear"
  | "Leather Goods";

interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  category: Category;
  productImages: {
    url: string;
    publicId: string;
  }[];
  ratingAverage: number;
  ratingQuantity: number;
  userId?: Schema.Types.ObjectId | string;
}

const ProductSchema = new Schema<IProduct>({
  title: {
    type: String,
    minLength: 4,
    maxLength: 100,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    minLength: 4,
    maxLength: 1000,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  priceAfterDiscount: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    min: 0,
    default: 0,
  },
  category: {
    type: String,
    enum: [
      "Electronics",
      "Clothes",
      "Shoes",
      "Furniture",
      "Bags",
      "Books",
      "Accessories",
      "Watches & Accessories",
      "Luxury Fragrances",
      "Eyewear",
      "Leather Goods",
    ],
    required: true,
  },
  productImages: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: "default",
      },
    },
  ],
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingQuantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Product = model<IProduct>("Product", ProductSchema);

const validateCreateProduct = (product: ICreateProductSchema) => {
  return createProductSchema.safeParse(product);
};

const validateUpdateProduct = (product: IUpdateProductSchema) => {
  return updateProductSchema.safeParse(product);
};

export { Product, validateCreateProduct, validateUpdateProduct };
