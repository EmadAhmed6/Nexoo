import express from "express";
import { getOrders, getOrderById, updateOrderStatus, } from "./adminOrder.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";
const router = express.Router();
router.use(verifyAdminToken);
router.get("/", getOrders);
router
    .route("/:orderId")
    .get(getOrderById)
    .patch(updateOrderStatus)
    .put(updateOrderStatus);
export default router;
//# sourceMappingURL=adminOrder.routes.js.map