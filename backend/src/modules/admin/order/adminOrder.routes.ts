import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "./adminOrder.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyAdminToken, getOrders);

router
  .route("/:orderId")
  .get(verifyAdminToken, getOrderById)
  .patch(verifyAdminToken, updateOrderStatus)
  .put(verifyAdminToken, updateOrderStatus);

export default router;
