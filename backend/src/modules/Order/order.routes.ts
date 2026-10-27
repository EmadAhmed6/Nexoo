import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
  createPaymobOrder,
  verifyPaymobPayment,
  paymobWebhook,
} from "./order.controller.js";
import {
  verifyOrderOwner,
  verifyToken,
} from "../../middlewares/verifyToken.js";

const router = express.Router();

router
  .route("/")
  .post(verifyToken, createOrder)
  .get(verifyToken, getOrders);

router.post("/:orderId/paymob/create", verifyToken, createPaymobOrder);
router.post("/:orderId/paymob/verify", verifyToken, verifyPaymobPayment);
router.post("/paymob/webhook", paymobWebhook);

router
  .route("/:orderId")
  .get(verifyOrderOwner, getOrderById)
  .put(verifyOrderOwner, updateOrder)
  .delete(verifyOrderOwner, deleteOrder);

export default router;
