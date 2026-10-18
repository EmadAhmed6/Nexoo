import { model, Schema } from "mongoose";
const WishlistSchema = new Schema({
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
}, { timestamps: true });
const Wishlist = model("Wishlist", WishlistSchema);
export default Wishlist;
//# sourceMappingURL=wishlist.model.js.map