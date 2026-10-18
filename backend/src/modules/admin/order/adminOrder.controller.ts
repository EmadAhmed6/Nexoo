import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Order } from "../../Order/order.model.js";
import mongoose from "mongoose";
import { User } from "../../Users/user.model.js";

interface IOrderQuery {
  orderStatus?: string;
  orderId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  isPaid?: string;
}
// GET ALL USER ORDERS
const getOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      orderStatus,
      orderId,
      customerName,
      email,
      phone,
      minPrice,
      maxPrice,
      page,
      limit,
      isPaid,
    } = req.query as any;
    const query: any = {};

    const targetStatus = orderStatus;
    if (targetStatus && targetStatus !== "all") {
      query["orderStatus.status"] = targetStatus;
    }

    if (orderId) {
      query._id = orderId;
    }

    if (customerName || email) {
      const userFilters: any[] = [];
      if (customerName) {
        userFilters.push({ fullName: { $regex: customerName, $options: "i" } });
        userFilters.push({ username: { $regex: customerName, $options: "i" } });
      }
      if (email) {
        userFilters.push({ email: { $regex: email, $options: "i" } });
      }
      const matchedUsers = await User.find({ $or: userFilters }).select("_id");
      query.user = { $in: matchedUsers.map((u) => u._id) };
    }

    if (phone) {
      query["shippingAddress.phone"] = { $regex: phone, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["pricing.totalOrderPrice"] = {};
      if (minPrice !== undefined && minPrice !== "") {
        query["pricing.totalOrderPrice"].$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        query["pricing.totalOrderPrice"].$lte = Number(maxPrice);
      }
    }
    if (isPaid !== undefined && isPaid !== "") {
      query["payment.isPaid"] = isPaid === "true" ? true : false;
    }
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const orders = await Order.find(query)
      .populate("user")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    if (!orders) {
      sendError(res, 404, "Orders not found");
      return;
    }
    successMsg(res, 200, "Orders fetched successfully", orders);
  },
);

// GET ORDER BY ID
const getOrderById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product");
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }
    successMsg(res, 200, "Order fetched successfully", order);
  },
);

// UPDATE ORDER STATUS
const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId;
    const orderStatus = req.body.orderStatus;

    if (!orderStatus) {
      sendError(res, 400, "Order status is required");
      return;
    }

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      sendError(
        res,
        400,
        `Invalid order status. Allowed values: ${validStatuses.join(", ")}`,
      );
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      sendError(res, 404, "Order not found");
      return;
    }

    order.orderStatus.status = orderStatus;

    if (order.orderStatus.status === "Delivered") {
      order.orderStatus.isDelivered = true;
      order.orderStatus.deliveredAt = new Date();
    } else {
      order.orderStatus.isDelivered = false;
    }

    if (typeof req.body.isPaid === "boolean") {
      order.payment.isPaid = req.body.isPaid;
      if (req.body.isPaid && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }
    }

    await order.save();

    successMsg(res, 200, "Order status updated successfully", order);
  },
);

// GET ORDER STATS
const getOrderOverview = asyncHandler(async (req: Request, res: Response) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({
    "orderStatus.status": "Pending",
  });
  const DeliveredOrders = await Order.countDocuments({
    "orderStatus.status": "Delivered",
  });
  const processingOrders = await Order.countDocuments({
    "orderStatus.status": "Processing",
  });
  const cancelledOrders = await Order.countDocuments({
    "orderStatus.status": "Cancelled",
  });

  const paidOrders = await Order.aggregate([
    { $match: { "payment.isPaid": true } },
    { $group: { _id: null, total: { $sum: "$pricing.totalOrderPrice" } } },
  ]);

  const totalPaidAmount = paidOrders[0]?.total || 0;
  successMsg(res, 200, "Stats fetched Succeed", {
    totalOrders,
    pendingOrders,
    DeliveredOrders,
    deliveredOrders: DeliveredOrders,
    processingOrders,
    cancelledOrders,
    totalPaidAmount,
  });
});

export { getOrders, getOrderById, updateOrderStatus, getOrderOverview };
