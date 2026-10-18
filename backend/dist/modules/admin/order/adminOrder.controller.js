import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Order } from "../../Order/order.model.js";
// GET ALL USER ORDERS
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });
    if (!orders) {
        sendError(res, 404, "Orders not found");
        return;
    }
    successMsg(res, 200, "Orders fetched successfully", orders);
});
// GET ORDER BY ID
const getOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
        .populate("user")
        .populate("orderItems.product");
    if (!order) {
        sendError(res, 404, "Order not found");
        return;
    }
    successMsg(res, 200, "Order fetched successfully", order);
});
// UPDATE ORDER STATUS
const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const orderStatus = req.body.orderStatus || req.body.status;
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
        sendError(res, 400, `Invalid order status. Allowed values: ${validStatuses.join(", ")}`);
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
    }
    else {
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
});
export { getOrders, getOrderById, updateOrderStatus };
//# sourceMappingURL=adminOrder.controller.js.map