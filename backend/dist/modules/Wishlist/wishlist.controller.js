import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../middlewares/errors.js";
import Wishlist from "./wishlist.model.js";
import { Product } from "../Product/product.model.js";
const POPULATE_PRODUCT_FIELDS = "title description price priceAfterDiscount productImages category stock ratingAverage ratingQuantity likes likesCount";
const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        sendError(res, 401, "Unauthorized");
        return;
    }
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "products",
        select: POPULATE_PRODUCT_FIELDS,
    });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    else {
        const validProducts = (wishlist.products || []).filter(Boolean);
        if (validProducts.length !== wishlist.products.length) {
            wishlist.products = validProducts;
            await wishlist.save();
        }
    }
    successMsg(res, 200, "Wishlist fetched successfully", wishlist);
});
const addToWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    if (!userId) {
        sendError(res, 401, "Unauthorized");
        return;
    }
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
    }
    const wishlist = await Wishlist.findOneAndUpdate({ user: userId }, { $addToSet: { products: productId } }, { new: true, upsert: true }).populate({
        path: "products",
        select: POPULATE_PRODUCT_FIELDS,
    });
    if (!wishlist) {
        sendError(res, 500, "Failed to update wishlist");
        return;
    }
    successMsg(res, 200, "Added to wishlist successfully", wishlist);
});
const removeFromWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    if (!userId) {
        sendError(res, 401, "Unauthorized");
        return;
    }
    if (!productId) {
        sendError(res, 400, "Valid Product ID is required");
        return;
    }
    const wishlist = await Wishlist.findOneAndUpdate({ user: userId }, { $pull: { products: productId } }, { new: true, upsert: true }).populate({
        path: "products",
        select: POPULATE_PRODUCT_FIELDS,
    });
    if (!wishlist) {
        sendError(res, 404, "No Wishlist found for this user");
        return;
    }
    successMsg(res, 200, "Removed from wishlist successfully", wishlist);
});
const clearWishlist = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        sendError(res, 401, "Unauthorized");
        return;
    }
    const wishlist = await Wishlist.findOneAndUpdate({ user: userId }, { $set: { products: [] } }, { new: true, upsert: true });
    successMsg(res, 200, "Wishlist cleared successfully", wishlist);
});
export { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };
//# sourceMappingURL=wishlist.controller.js.map