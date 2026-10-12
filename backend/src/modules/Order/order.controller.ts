import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../middlewares/errors.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import paypalClient from "../../config/paypal.js";
import { Cart } from "../Cart/cart.model.js";
import {
  Order,
  validateCreateOrder,
  validateUpdateOrder,
} from "./order.model.js";
import { Coupon } from "../Coupons/coupon.model.js";

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
    const totalOrderPrice = itemsPrice + shippingPrice + taxPrice;

    const isPaid = paymentMethod === "Paypal";
    const paidAt = isPaid ? new Date() : undefined;
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      pricing: {
        itemsPrice,
        shippingPrice,
        taxPrice,
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
      },
    });
    
    if (cart.couponApplied) {
      await Coupon.findOneAndUpdate(
        { couponCode: cart.couponApplied },
        { $inc: { usedCount: 1 } },
      );
    }

    await Cart.findByIdAndDelete(cart._id);
    successMsg(res, 201, "Order created successfully", order);
  },
);

// PAYAPAL ORDER
const createPayPalOrder = asyncHandler(
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

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order._id.toString(),
          amount: {
            currency_code: "USD",
            value: order.pricing.totalOrderPrice.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/checkout/success",
        cancel_url: "http://localhost:3000/checkout/cancel",
      },
    });

    const client = paypalClient();
    const paypalOrder = await client.execute(request);

    const approvalUrl = paypalOrder.result.links.find(
      (link: any) => link.rel === "approve",
    )?.href;

    successMsg(res, 200, "PayPal order created successfully", {
      paypalOrderId: paypalOrder.result.id,
      approvalUrl,
    });
  },
);

const capturePayPalPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { paypalOrderId, orderId } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(
      paypalOrderId,
    );
    request.requestBody({});

    const client = paypalClient();
    const captureResponse = await client.execute(request);

    if (captureResponse.result.status === "COMPLETED") {
      const order = await Order.findById(orderId);
      if (!order) {
        sendError(res, 404, "Order not found");
        return;
      }

      order.payment.isPaid = true;
      order.payment.paidAt = new Date();
      order.payment.paymentResult = {
        id: captureResponse.result.id,
        status: captureResponse.result.status,
        update_time: captureResponse.result.update_time,
        email_address: captureResponse.result.payer?.email_address,
      };
      order.orderStatus.status = "Processing";

      await order.save();

      successMsg(res, 200, "Payment captured successfully", order);
    } else {
      sendError(res, 400, "Payment failed or not completed");
    }
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
  createPayPalOrder,
  capturePayPalPayment,
  updateOrder,
  deleteOrder,
};
