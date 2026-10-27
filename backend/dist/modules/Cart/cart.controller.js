import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { Cart, validateCreateCart, validateUpdateCart } from "./cart.model.js";
import { Types } from "mongoose";
import { Product } from "../Product/product.model.js";
import { Coupon } from "../Coupon/coupon.model.js";
// GET CART
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const cart = await Cart.findOne({ userId })
        .populate({
        path: "cartItems.product",
        select: "title price priceAfterDiscount productImages",
    })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
    if (!cart) {
        successMsg(res, 200, "Cart is empty", {
            cartItems: [],
            totalPrice: 0,
        });
        return;
    }
    const validItems = cart.cartItems.filter((item) => item.product != null);
    if (validItems.length !== cart.cartItems.length) {
        cart.cartItems = validItems;
        cart.totalPrice = validItems.reduce((sum, item) => sum + item.productQuantity * item.productPrice, 0);
        await cart.save();
    }
    if (cart.cartItems.length === 0) {
        successMsg(res, 200, "Cart is empty", {
            cartItems: [],
            totalPrice: 0,
        });
        return;
    }
    successMsg(res, 200, "Cart fetched successfully", cart);
});
// ADD ITEM TO CART
const addToCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    const { productQuantity = 1 } = req.body;
    if (!Types.ObjectId.isValid(productId)) {
        sendError(res, 400, "Invalid Product ID format");
        return;
    }
    const { success, error } = validateCreateCart(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "Product not found");
        return;
    }
    const productPrice = product.priceAfterDiscount || product.price;
    let cart = await Cart.findOne({ userId });
    let existingQuantity = productQuantity;
    if (cart) {
        const existingItem = cart.cartItems.find((item) => item.product.toString() === productId?.toString());
        if (existingItem) {
            existingQuantity += existingItem.productQuantity;
        }
    }
    if (product.stock < existingQuantity) {
        sendError(res, 400, "Requested quantity exceeds available stock");
        return;
    }
    if (!cart) {
        cart = new Cart({
            userId,
            cartItems: [
                {
                    product: productId,
                    productQuantity,
                    productPrice,
                },
            ],
        });
    }
    else {
        const existingItemIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId?.toString());
        if (existingItemIndex >= 0) {
            cart.cartItems[existingItemIndex].productQuantity += productQuantity;
            cart.cartItems[existingItemIndex].productPrice = productPrice;
        }
        else {
            cart.cartItems.push({
                product: new Types.ObjectId(productId),
                productQuantity,
                productPrice,
            });
        }
    }
    let totalPrice = 0;
    cart.cartItems.forEach((item) => (totalPrice += item.productQuantity * item.productPrice));
    cart.totalPrice = totalPrice;
    await cart.save();
    await cart.populate({
        path: "cartItems.product",
        select: "title price priceAfterDiscount productImages",
    });
    successMsg(res, 201, "Product added to cart successfully", cart);
});
// UPDATE ITEM IN CART
const updateCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    const productQuantity = req.body.productQuantity;
    const { success, error } = validateUpdateCart(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        sendError(res, 404, "Cart was not found");
        return;
    }
    const itemIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId?.toString());
    if (itemIndex === -1) {
        sendError(res, 404, "Product is not found in the cart");
        return;
    }
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "Product was not found");
        return;
    }
    if (product.stock < productQuantity) {
        sendError(res, 400, "Product is out of stock");
        return;
    }
    const updatedPrice = product.priceAfterDiscount || product.price;
    cart.cartItems[itemIndex].productQuantity = productQuantity;
    cart.cartItems[itemIndex].productPrice = updatedPrice;
    let totalPrice = 0;
    cart.cartItems.forEach((item) => (totalPrice += item.productQuantity * item.productPrice));
    cart.totalPrice = totalPrice;
    await cart.save();
    await cart.populate({
        path: "cartItems.product",
        select: "title price priceAfterDiscount productImages",
    });
    successMsg(res, 200, "Product quantity updated successfully", cart);
});
// REMOVE ITEM FROM CART
const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        sendError(res, 404, "Cart was not found");
        return;
    }
    const itemIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId?.toString());
    if (itemIndex === -1) {
        sendError(res, 404, "Product is not found in the cart");
        return;
    }
    cart.cartItems.splice(itemIndex, 1);
    let totalPrice = 0;
    cart.cartItems.forEach((item) => (totalPrice += item.productQuantity * item.productPrice));
    cart.totalPrice = totalPrice;
    if (cart.cartItems.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        successMsg(res, 200, "Cart is now empty and removed", {
            cartItems: [],
            totalPrice: 0,
        });
        return;
    }
    if (cart.couponApplied) {
        const coupon = await Coupon.findOne({ couponCode: cart.couponApplied });
        if (coupon && coupon.isActive && new Date() <= coupon.expireDate) {
            let discountAmount = 0;
            if (coupon.discountType === "percentage") {
                discountAmount = (cart.totalPrice * coupon.discountValue) / 100;
            }
            else {
                discountAmount = coupon.discountValue;
            }
            cart.totalPriceAfterDiscount = Math.max(0, cart.totalPrice - discountAmount);
        }
        else {
            cart.couponApplied = undefined;
            cart.totalPriceAfterDiscount = undefined;
        }
    }
    await cart.save();
    await cart.populate({
        path: "cartItems.product",
        select: "title price priceAfterDiscount productImages",
    });
    successMsg(res, 200, "Product removed from cart successfully", cart);
});
// CLEAR CART
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        successMsg(res, 200, "Cart cleared successfully", {
            totalPrice: 0,
            cartItems: [],
        });
        return;
    }
    await Cart.findByIdAndDelete(cart._id);
    successMsg(res, 200, "Cart cleared successfully", {
        totalPrice: 0,
        cartItems: [],
    });
});
export { getCart, addToCart, updateCart, removeFromCart, clearCart };
//# sourceMappingURL=cart.controller.js.map