import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { createPaymobIntention } from "../../config/paymob.js";
import { User } from "../Users/user.model.js";
import { Cart } from "../Cart/cart.model.js";
import {
  Order,
  validateCreateOrder,
  validateUpdateOrder,
} from "./order.model.js";
import { Coupon } from "../Coupon/coupon.model.js";
import { updateStockAfterPayment } from "../Product/product.controller.js";
import { Notification } from "../Notification/notification.model.js";

// GET USER ORDERS
const getOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId })
      .populate({
        path: "orderItems.product",
        select: "title price productImages",
      })
      .sort({ createdAt: -1 });

    successMsg(res, 200, "Orders fetched successfully", orders);
  },
);

// GET ORDER BY ID
const getOrderById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const orderId = req.params.orderId;
    const order = await Order.findOne({ _id: orderId, user: userId }).populate({
      path: "orderItems.product",
      select: "title price productImages",
    });

    if (!order) {
      sendError(res, 404, "Order was not found");
      return;
    }
    successMsg(res, 200, "Order fetched successfully", order);
  },
);

// CREATE ORDER
const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateCreateOrder(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 401, "Unauthorized");
      return;
    }
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId }).populate("cartItems.product");
    if (!cart || cart.cartItems.length === 0) {
      sendError(res, 404, "Cart is empty or not found");
      return;
    }

    const orderItems = cart.cartItems
      .filter((item: any) => item.product)
      .map((item: any) => {
        const product = item.product;
        return {
          product: product._id,
          productQuantity: item.productQuantity,
          productPrice: item.productPrice,
          productTitle: product.title,
          productImage: product.productImages || [],
        };
      });

    const itemsPrice = cart.totalPrice;
    const taxPrice = 0;
    const shippingPrice = 0;
    const discountPrice = cart.totalPriceAfterDiscount
      ? cart.totalPrice - cart.totalPriceAfterDiscount
      : 0;
    const totalOrderPrice =
      (cart.totalPriceAfterDiscount ?? cart.totalPrice) +
      shippingPrice +
      taxPrice;

    const isPaid = false;
    const paidAt = undefined;
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      pricing: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        couponCode: cart.couponApplied || null,
        discountPrice,
        totalOrderPrice,
      },
      payment: {
        paymentMethod,
        isPaid,
        paidAt,
      },
      orderStatus: {
        status: "Pending",
        isDelivered: false,
        updatedAt: new Date(),
      },
      statusHistory: [
        {
          status: "Pending",
          timestamp: new Date(),
          note: "Order placed successfully",
        },
      ],
    });

    if (cart.couponApplied) {
      const coupon = await Coupon.findOne({ couponCode: cart.couponApplied });
      if (coupon) {
        coupon.usedCount += 1;
        const userIndex = coupon.usedBy.findIndex(
          (item) => item.user.toString() === userId.toString(),
        );
        if (userIndex > -1) {
          coupon.usedBy[userIndex]!.count += 1;
        } else {
          coupon.usedBy.push({ user: new Types.ObjectId(userId), count: 1 });
        }

        await coupon.save();
      }
    }

    await Cart.findByIdAndDelete(cart._id);

    try {
      await Notification.create({
        user: userId,
        title: "Order Placed Successfully",
        message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
        type: "order",
        relatedId: order._id,
      });
    } catch (notifErr) {
      console.error("Failed to create order placement notification:", notifErr);
    }

    for (const item of cart.cartItems) {
      const prod = item.product as any;
      if (!prod) continue;
      const productOwner = prod.userId || prod.user;
      if (productOwner && productOwner.toString() !== userId?.toString()) {
        const buyerName = req.user?.username || "A customer";
        try {
          await Notification.create({
            user: productOwner,
            title: "Product Sold!",
            message: `${buyerName} purchased ${item.productQuantity}x "${prod.title}"`,
            type: "order",
            relatedId: order._id,
          });
        } catch (sellerNotifErr) {
          console.error(
            "Failed to notify seller about purchase:",
            sellerNotifErr,
          );
        }
      }
    }

    successMsg(res, 201, "Order created successfully", order);
  },
);

// PAYMOB ORDER
const createPaymobOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.body;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }

    if (order.payment.isPaid) {
      sendError(res, 400, "This order is already paid");
      return;
    }

    const user = await User.findById(userId);

    const nameParts = (user?.fullName || user?.username || "Customer").split(
      " ",
    );
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    try {
      const intention = await createPaymobIntention({
        amount: order.pricing.totalOrderPrice,
        orderId: order._id.toString(),
        items: order.orderItems.map((item) => ({
          name: item.productTitle,
          amount: item.productPrice,
          quantity: item.productQuantity,
        })),
        billingData: {
          firstName,
          lastName,
          phone: order.shippingAddress.phone || user?.phone || "01000000000",
          email: user?.email || "customer@example.com",
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
          postalCode: order.shippingAddress.postalCode,
        },
      });

      successMsg(res, 200, "Paymob payment session created successfully", {
        orderId: order._id,
        checkoutUrl: intention.checkoutUrl,
        clientSecret: intention.clientSecret,
      });
    } catch (err: any) {
      sendError(
        res,
        500,
        err?.message || "Failed to initialize Paymob payment",
      );
    }
  },
);

// VERIFY PAYMOB PAYMENT
const verifyPaymobPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { orderId, success, transactionId } = req.body;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }

    if (order.payment.isPaid) {
      successMsg(res, 200, "Order is already paid", order);
      return;
    }

    if (success === true || success === "true") {
      order.payment.isPaid = true;
      order.payment.paidAt = new Date();
      order.payment.paymentResult = {
        id: transactionId ? String(transactionId) : undefined,
        status: "SUCCESS",
        update_time: new Date().toISOString(),
      };
      order.orderStatus.status = "Processing";
      order.orderStatus.updatedAt = new Date();
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: "Processing",
        timestamp: new Date(),
        note: "Payment verified via Paymob",
      });
      await order.save();
      await updateStockAfterPayment(order.orderItems);

      try {
        await Notification.create({
          user: order.user,
          title: "Payment Confirmed",
          message: `Your payment for order #${order._id.toString().slice(-6)} was successful.`,
          type: "order",
          relatedId: order._id,
        });
      } catch (notifErr) {
        console.error("Failed to create payment notification:", notifErr);
      }

      successMsg(res, 200, "Payment verified successfully", order);
      return;
    }

    sendError(
      res,
      400,
      "Payment verification failed or payment was not successful",
    );
  },
);

// PAYMOB WEBHOOK
const paymobWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const obj = req.body?.obj || req.body;
    const isSuccess = obj?.success === true || obj?.success === "true";
    const orderId =
      obj?.order?.special_reference ||
      obj?.special_reference ||
      obj?.extras?.order_id;

    if (isSuccess && orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.payment.isPaid) {
        order.payment.isPaid = true;
        order.payment.paidAt = new Date();
        order.payment.paymentResult = {
          id: String(obj?.id || ""),
          status: "SUCCESS",
          update_time: new Date().toISOString(),
        };
        order.orderStatus.status = "Processing";
        order.orderStatus.updatedAt = new Date();
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: "Processing",
          timestamp: new Date(),
          note: "Payment received via Paymob webhook",
        });
        await order.save();
        await updateStockAfterPayment(order.orderItems);

        try {
          await Notification.create({
            user: order.user,
            title: "Payment Confirmed",
            message: `Your payment for order #${order._id.toString().slice(-6)} was successful.`,
            type: "order",
            relatedId: order._id,
          });
        } catch (err) {
          console.error("Failed to create webhook payment notification:", err);
        }
      }
    }

    res.status(200).json({ status: "received" });
  },
);

// UPDATE ORDER
const updateOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateUpdateOrder(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }
    const userId = req.user?.id;
    const orderId = req.params.orderId;
    const { shippingAddress, paymentMethod } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }

    if (order.orderStatus.status !== "Pending") {
      sendError(
        res,
        400,
        "You cannot update an order that is already being processed or shipped",
      );
      return;
    }

    order.shippingAddress = shippingAddress;
    order.payment.paymentMethod = paymentMethod;

    await order.save();
    successMsg(res, 200, "Order updated successfully", order);
  },
);

// DELETE ORDER
const deleteOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId;
    const userId = req.user?.id;
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }
    await order.deleteOne();
    successMsg(res, 200, "Order deleted successfully", order);
  },
);

export {
  getOrders,
  getOrderById,
  createOrder,
  createPaymobOrder,
  verifyPaymobPayment,
  paymobWebhook,
  updateOrder,
  deleteOrder,
};
