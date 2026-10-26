import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Coupon, validateCreateCoupon, validateUpdateCoupon, } from "../../Coupon/coupon.model.js";
// GET ALL COUPONS
const getCoupons = asyncHandler(async (req, res) => {
    const query = {};
    const { search, isActive, discountType } = req.query;
    if (search && typeof search === "string" && search.trim() !== "") {
        query.couponCode = { $regex: search, $options: "i" };
    }
    if (isActive && typeof isActive === "string" && isActive.trim() !== "") {
        query.isActive = isActive === "true" ? true : false;
    }
    if (discountType &&
        typeof discountType === "string" &&
        discountType.trim() !== "") {
        query.discountType = discountType;
    }
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    if (!coupons) {
        sendError(res, 404, "No Coupons found");
        return;
    }
    successMsg(res, 200, "Coupons fetched successfully", coupons);
});
// CREATE COUPON
const createCoupon = asyncHandler(async (req, res) => {
    const { success, error } = validateCreateCoupon(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    const { discountType, discountValue, startDate, expireDate, usageLimit, usageLimitPerUser, minOrderValue, applicableCategories, maxUsersLimit, couponCode, isActive, } = req.body;
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
});
// UPDATE COUPON
const updateCoupon = asyncHandler(async (req, res) => {
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
    const { discountType, discountValue, isActive, startDate, expireDate, couponCode, usageLimit, minOrderValue, usageLimitPerUser, applicableCategories, maxUsersLimit, } = req.body;
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
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
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
    }, { new: true, runValidators: true });
    successMsg(res, 200, "Coupon updated successfully", updatedCoupon);
});
// DELETE COUPON
const deleteCoupon = asyncHandler(async (req, res) => {
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
});
export { getCoupons, createCoupon, updateCoupon, deleteCoupon };
//# sourceMappingURL=adminCoupons.controller.js.map