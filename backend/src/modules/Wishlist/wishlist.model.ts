import { Document, model, Schema, Types } from "mongoose";

interface IWishlist extends Document {
  products: Types.ObjectId[];
  user: Types.ObjectId;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const Wishlist = model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
