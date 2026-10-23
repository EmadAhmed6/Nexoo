import express from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./adminCoupons.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";

const router = express.Router();

router
  .route("/")
  .get(verifyAdminToken, getCoupons)
  .post(verifyAdminToken, createCoupon);

router
  .route("/:couponId")
  .put(verifyAdminToken, updateCoupon)
  .delete(verifyAdminToken, deleteCoupon);

export default router;
