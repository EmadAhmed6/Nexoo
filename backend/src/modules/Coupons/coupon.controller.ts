import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../middlewares/errors.js";
import {
  Coupon,
  validateCreateCoupon,
  validateUpdateCoupon,
} from "./coupon.model.js";
import { Cart } from "../Cart/cart.model.js";

// GET ALL COUPONS (Admin)
const getCoupons = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    successMsg(res, 200, "Coupons fetched successfully", coupons);
  },
);

// CREATE COUPON
const createCoupon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateCreateCoupon(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }
    const {
      discountType,
      discountValue,
      startDate,
      expireDate,
      usageLimit,
      couponCode,
    } = req.body;

    if (
      discountType === "percentage" &&
      (discountValue < 1 || discountValue > 100)
    ) {
      sendError(res, 400, "Percentage discount must be between 1 and 100");
      return;
    }

    if (new Date(startDate) > new Date(expireDate)) {
      sendError(res, 400, "Start date must be before expire date");
      return;
    }

    const existingCode = await Coupon.findOne({ couponCode });
    if (existingCode) {
      sendError(res, 400, "Coupon code already exists");
      return;
    }
    const newCoupon = new Coupon({
      discountType,
      discountValue,
      couponCode: couponCode.toUpperCase(),
      usageLimit: Number(usageLimit) || 10,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      startDate: new Date(startDate),
      expireDate: new Date(expireDate),
    });
    const savedCoupon = await newCoupon.save();
    successMsg(res, 201, "Coupon created successfully", savedCoupon);
  },
);

// UPDATE COUPON
const updateCoupon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateUpdateCoupon(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      sendError(res, 404, "Coupon not found");
      return;
    }
    const {
      discountType,
      discountValue,
      isActive,
      startDate,
      expireDate,
      couponCode,
      usageLimit,
    } = req.body;

    if (couponCode) {
      const existingCode = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existingCode) {
        sendError(res, 400, "Coupon code already exists");
        return;
      }
    }
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        $set: {
          ...(discountType && { discountType }),
          ...(discountValue !== undefined && { discountValue }),
          ...(isActive !== undefined && { isActive }),
          ...(startDate && { startDate }),
          ...(expireDate && { expireDate }),
          ...(couponCode && { couponCode: couponCode.toUpperCase() }),
          ...(usageLimit !== undefined && { usageLimit }),
        },
      },
      { new: true, runValidators: true },
    );

    successMsg(res, 200, "Coupon updated successfully", updatedCoupon);
  },
);

// APPLY COUPON
const applyCoupon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const couponCode = req.body.couponCode;
    const userId = req.user?.id;
    const coupon = await Coupon.findOne({
      couponCode: couponCode?.toUpperCase(),
    });
    if (!coupon) {
      sendError(res, 404, "Coupon not found");
      return;
    }
    if (coupon.isActive === false) {
      sendError(res, 400, "Coupon is not active");
      return;
    }
    const currentDate = new Date();
    if (currentDate < coupon.startDate || currentDate > coupon.expireDate) {
      sendError(res, 400, "Coupon has expired");
      return;
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      sendError(res, 400, "Coupon usage limit exceeded");
      return;
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.cartItems.length === 0) {
      sendError(res, 404, "Cart is empty or not found");
      return;
    }

    const originalTotal = cart.totalPrice;
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (originalTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    if (discountAmount > originalTotal) {
      discountAmount = originalTotal;
    }

    const finalPrice = originalTotal - discountAmount;
    cart.totalPriceAfterDiscount = finalPrice;
    cart.couponApplied = coupon.couponCode;
    await cart.save();

    successMsg(res, 200, "Coupon applied successfully", {
      originalTotal,
      discountAmount,
      finalPrice,
      couponCode: coupon.couponCode,
    });
  },
);

// REMOVE COUPON
const removeCoupon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      sendError(res, 404, "Cart is empty or not found");
      return;
    }
    cart.totalPriceAfterDiscount = undefined;
    cart.couponApplied = undefined;
    await cart.save();
    successMsg(res, 200, "Coupon removed successfully", null);
  },
);

// DELETE COUPON
const deleteCoupon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      sendError(res, 404, "Coupon not found");
      return;
    }

    if (coupon.usedCount > 0) {
      sendError(res, 400, "Coupon cannot be deleted as it is already used");
      return;
    }
    await Coupon.findByIdAndDelete(couponId);
    successMsg(res, 200, "Coupon deleted successfully", null);
  },
);

export { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon, removeCoupon };
