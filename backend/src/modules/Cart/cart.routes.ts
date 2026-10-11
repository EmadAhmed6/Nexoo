import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "./cart.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();

router.route("/").get(verifyToken, getCart).delete(verifyToken, clearCart);
router
  .route("/:productId")
  .post(verifyToken, addToCart)
  .delete(verifyToken, removeFromCart)
  .put(verifyToken, updateCart);

export default router;
