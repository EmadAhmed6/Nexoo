import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../middlewares/errors.js";

import { Cart } from "../Cart/cart.model.js";
import {
  Coupon,
  validateCreateCoupon,
  validateUpdateCoupon,
} from "../Coupon/coupon.model.js";

// GET ALL COUPONS (Admin)
const getCoupons = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    if (!coupons) {
      sendError(res, 404, "No Coupons found");
      return;
    }
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
      usageLimitPerUser,
      minOrderValue,
      applicableCategories,
      maxUsersLimit,
      couponCode,
      isActive,
    } = req.body;

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
      usageLimitPerUser: Number(usageLimitPerUser) || 1,
      minOrderValue: Number(minOrderValue) || 0,
      applicableCategories: Array.isArray(applicableCategories)
        ? applicableCategories
        : [],
      maxUsersLimit: maxUsersLimit ? Number(maxUsersLimit) : null,
      isActive: isActive,
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
      minOrderValue,
      usageLimitPerUser,
      applicableCategories,
      maxUsersLimit,
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
          discountType,
          discountValue,
          isActive,
          startDate,
          expireDate,
          couponCode: couponCode ? couponCode.toUpperCase() : coupon.couponCode,
          usageLimit,
          minOrderValue,
          usageLimitPerUser,
          ...(applicableCategories !== undefined && { applicableCategories }),
          ...(maxUsersLimit !== undefined && {
            maxUsersLimit: maxUsersLimit ? Number(maxUsersLimit) : null,
          }),
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

    const cart = await Cart.findOne({ userId }).populate("cartItems.product");
    if (!cart || cart.cartItems.length === 0) {
      sendError(res, 404, "Cart is empty or not found");
      return;
    }

    const originalTotal = cart.totalPrice;

    if (coupon.minOrderValue && originalTotal < coupon.minOrderValue) {
      sendError(
        res,
        400,
        `Minimum order value required is ${coupon.minOrderValue}`,
      );
      return;
    }

    const usersUsedCoupon = coupon.usedBy.find(
      (item) => item.user.toString() === userId?.toString(),
    );

    const currentUserUsage = usersUsedCoupon ? usersUsedCoupon.count : 0;

    if (currentUserUsage >= (coupon.usageLimitPerUser || 1)) {
      sendError(res, 400, "You have already used this coupon");
      return;
    }

    if (coupon.maxUsersLimit) {
      const isUserUsedCoupon = coupon.usedBy.some(
        (item) => item.user.toString() === userId?.toString(),
      );
      if (!isUserUsedCoupon && coupon.usedBy.length >= coupon.maxUsersLimit) {
        sendError(res, 400, "Coupon has reached its maximum user limit");
        return;
      }
    }

    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const isEligible = cart.cartItems.some((item: any) => {
        const productCategory = item.product?.category?.toString();
        return (
          productCategory &&
          coupon.applicableCategories!.some(
            (cat: string) =>
              cat.toLowerCase() === productCategory.toLowerCase(),
          )
        );
      });

      if (!isEligible) {
        sendError(res, 400, "Coupon not applicable to your cart items");
        return;
      }
    }

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

export {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  removeCoupon,
};
