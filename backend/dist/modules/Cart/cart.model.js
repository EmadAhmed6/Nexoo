import { model, Schema } from "mongoose";
import { CreateCartSchema, UpdateCartSchema, } from "./cart.schema.js";
const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
    },
    cartItems: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productQuantity: {
                type: Number,
                required: true,
            },
            productPrice: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: false,
    },
    totalPriceAfterDiscount: {
        type: Number,
        required: false,
    },
    couponApplied: {
        type: String,
        required: false,
        default: null,
    },
}, { timestamps: true });
const Cart = model("Cart", CartSchema);
const validateCreateCart = (cart) => {
    return CreateCartSchema.safeParse(cart);
};
const validateUpdateCart = (cart) => {
    return UpdateCartSchema.safeParse(cart);
};
export { Cart };
export { validateCreateCart, validateUpdateCart };
//# sourceMappingURL=cart.model.js.map