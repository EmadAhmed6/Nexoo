import { model, Schema } from "mongoose";
import { createProductSchema, updateProductSchema, } from "./product.schema.js";
const ProductSchema = new Schema({
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
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
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
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    likesCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});
const Product = model("Product", ProductSchema);
const validateCreateProduct = (product) => {
    return createProductSchema.safeParse(product);
};
const validateUpdateProduct = (product) => {
    return updateProductSchema.safeParse(product);
};
export { Product, validateCreateProduct, validateUpdateProduct };
//# sourceMappingURL=product.model.js.map