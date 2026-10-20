import express from "express";
import { getOrders, getOrderById, updateOrderStatus, } from "./adminOrder.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";
import { getOrderOverview } from "./adminOrder.controller.js";
const router = express.Router();
router.get("/", verifyAdminToken, getOrders);
router.get("/overview", verifyAdminToken, getOrderOverview);
router
    .route("/:orderId")
    .get(verifyAdminToken, getOrderById)
    .patch(verifyAdminToken, updateOrderStatus)
    .put(verifyAdminToken, updateOrderStatus);
export default router;
//# sourceMappingURL=adminOrder.routes.js.map