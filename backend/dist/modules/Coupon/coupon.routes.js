import express from "express";
import { applyCoupon, removeCoupon } from "./coupon.controller.js";
import { updateCoupon, deleteCoupon, } from "../admin/coupons/adminCoupons.controller.js";
import { verifyAdminToken, verifyToken, } from "../../middlewares/verifyToken.js";
const router = express.Router();
// Public / User routes
router.post("/apply", verifyToken, applyCoupon);
router.delete("/remove", verifyToken, removeCoupon);
router
    .route("/:couponId")
    .put(verifyAdminToken, updateCoupon)
    .delete(verifyAdminToken, deleteCoupon);
export default router;
//# sourceMappingURL=coupon.routes.js.map