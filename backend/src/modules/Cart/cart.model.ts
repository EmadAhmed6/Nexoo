import { Document, model, Schema, Types } from "mongoose";
import {
  CreateCartSchema,
  ICreateCartSchema,
  IUpdateCartSchema,
  UpdateCartSchema,
} from "./cart.schema.js";
interface ICartItems {
  product: Types.ObjectId;
  productQuantity: number;
  productPrice: number;
}
interface ICart extends Document {
  userId: Types.ObjectId;
  cartItems: ICartItems[];
  totalPrice: number;
  totalPriceAfterDiscount: number | undefined;
  couponApplied: string | undefined;
}

const CartSchema = new Schema<ICart>(
  {
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
  },
  { timestamps: true },
);

const Cart = model<ICart>("Cart", CartSchema);

const validateCreateCart = (cart: ICreateCartSchema) => {
  return CreateCartSchema.safeParse(cart);
};
const validateUpdateCart = (cart: IUpdateCartSchema) => {
  return UpdateCartSchema.safeParse(cart);
};

export { Cart };

export { validateCreateCart, validateUpdateCart };
