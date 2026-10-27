import { model, Schema, Types } from "mongoose";
import { CreateOrderSchema, UpdateOrderSchema, } from "./order.schema.js";
const OrderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [
        {
            product: {
                type: Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productQuantity: {
                type: Number,
                required: true,
            },
            productPrice: {
                type: Number,
                required: true,
            },
            productTitle: {
                type: String,
                required: true,
            },
            productImage: {
                type: [
                    {
                        url: {
                            type: String,
                            required: true,
                        },
                        publicId: {
                            type: String,
                            required: true,
                        },
                    },
                ],
                required: true,
            },
        },
    ],
    shippingAddress: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    pricing: {
        itemsPrice: {
            type: Number,
            required: true,
        },
        shippingPrice: {
            type: Number,
            required: true,
        },
        taxPrice: {
            type: Number,
            required: true,
        },
        couponCode: {
            type: String,
            default: null,
        },
        discountPrice: {
            type: Number,
            default: 0,
        },
        totalOrderPrice: {
            type: Number,
            required: true,
        },
    },
    payment: {
        paymentMethod: {
            type: String,
            enum: ["Paymob", "COD", "Stripe", "Paypal"],
            required: true,
        },
        isPaid: {
            type: Boolean,
            required: true,
        },
        paidAt: {
            type: Date,
        },
        paymentResult: {
            id: {
                type: String,
            },
            status: {
                type: String,
            },
            update_time: {
                type: String,
            },
            email_address: {
                type: String,
            },
        },
    },
    orderStatus: {
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            required: true,
            default: "Pending",
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        isDelivered: {
            type: Boolean,
            required: true,
        },
        deliveredAt: {
            type: Date,
        },
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            note: {
                type: String,
            },
        },
    ],
}, { timestamps: true });
const Order = model("Order", OrderSchema);
const validateCreateOrder = (order) => {
    return CreateOrderSchema.safeParse(order);
};
const validateUpdateOrder = (order) => {
    return UpdateOrderSchema.safeParse(order);
};
export { Order, validateCreateOrder, validateUpdateOrder };
//# sourceMappingURL=order.model.js.map