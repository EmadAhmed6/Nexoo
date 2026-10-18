import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, } from "./wishlist.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
const router = express.Router();
router
    .route("/")
    .get(verifyToken, getWishlist)
    .post(verifyToken, addToWishlist)
    .delete(verifyToken, clearWishlist);
router
    .route("/:productId")
    .post(verifyToken, addToWishlist)
    .delete(verifyToken, removeFromWishlist);
export default router;
//# sourceMappingURL=wishlist.routes.js.map