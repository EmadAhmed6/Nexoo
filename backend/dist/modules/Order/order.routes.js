import express from "express";
import { createOrder, deleteOrder, getOrderById, getOrders, updateOrder, createPayPalOrder, capturePayPalPayment, } from "./order.controller.js";
import { verifyOrderOwner, verifyToken } from "../../middlewares/verifyToken.js";
const router = express.Router();
router
    .route("/")
    .post(verifyToken, createOrder)
    .get(verifyToken, getOrders);
router.post("/paypal/create", verifyToken, createPayPalOrder);
router.post("/paypal/capture", verifyToken, capturePayPalPayment);
router
    .route("/:orderId")
    .get(verifyOrderOwner, getOrderById)
    .put(verifyOrderOwner, updateOrder)
    .delete(verifyOrderOwner, deleteOrder);
export default router;
//# sourceMappingURL=order.routes.js.map