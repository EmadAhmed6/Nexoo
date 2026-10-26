import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { Cart } from "../Cart/cart.model.js";
import { Coupon } from "../Coupon/coupon.model.js";
// APPLY COUPON
const applyCoupon = asyncHandler(async (req, res) => {
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
        sendError(res, 400, `Minimum order value required is ${coupon.minOrderValue}`);
        return;
    }
    const usersUsedCoupon = coupon.usedBy.find((item) => item.user.toString() === userId?.toString());
    const currentUserUsage = usersUsedCoupon ? usersUsedCoupon.count : 0;
    if (currentUserUsage >= (coupon.usageLimitPerUser || 1)) {
        sendError(res, 400, "You have already used this coupon");
        return;
    }
    if (coupon.maxUsersLimit) {
        const isUserUsedCoupon = coupon.usedBy.some((item) => item.user.toString() === userId?.toString());
        if (!isUserUsedCoupon && coupon.usedBy.length >= coupon.maxUsersLimit) {
            sendError(res, 400, "Coupon has reached its maximum user limit");
            return;
        }
    }
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        const isEligible = cart.cartItems.some((item) => {
            const productCategory = item.product?.category?.toString();
            return (productCategory &&
                coupon.applicableCategories.some((cat) => cat.toLowerCase() === productCategory.toLowerCase()));
        });
        if (!isEligible) {
            sendError(res, 400, "Coupon not applicable to your cart items");
            return;
        }
    }
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = (originalTotal * coupon.discountValue) / 100;
    }
    else {
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
});
// REMOVE COUPON
const removeCoupon = asyncHandler(async (req, res) => {
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
});
export { applyCoupon, removeCoupon };
//# sourceMappingURL=coupon.controller.js.map