import express from "express";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
  applyCoupon,
  removeCoupon,
} from "./coupon.controller.js";
import { verifyAdminToken, verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();

router.route("/").get(verifyAdminToken, getCoupons).post(verifyAdminToken, createCoupon);
router.post("/apply", verifyToken, applyCoupon);
router.delete("/remove", verifyToken, removeCoupon);
router
  .route("/:couponId")
  .put(verifyAdminToken, updateCoupon)
  .delete(verifyAdminToken, deleteCoupon);

export default router;
