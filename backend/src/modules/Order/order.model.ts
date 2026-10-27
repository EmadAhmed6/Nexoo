import { Document, model, Schema, Types } from "mongoose";
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  ICreateOrderSchema,
  IUpdateOrderSchema,
} from "./order.schema.js";

interface IOrderItem {
  product: Types.ObjectId;
  productQuantity: number;
  productPrice: number;
  productTitle: string;
  productImage: { url: string; publicId: string }[];
}

interface IShippingAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
}

interface IPricing {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  couponCode: string | null;
  discountPrice: number;
  totalOrderPrice: number;
}
interface IPaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
}

interface IPayment {
  paymentMethod: "Paymob" | "COD" | "Stripe" | "Paypal";
  isPaid: boolean;
  paidAt?: Date;
  paymentResult?: IPaymentResult;
}

interface IOrderStatus {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  updatedAt: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
}
interface IOrderStatusHistory {
  status: "Pending" | "Processing" | "Shipped" | "Delievered" | "Cancelled";
  timestamp: Date;
  note?: string;
}

// interface IOrderStatusHistory {
//   status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
//   timestamp: Date;
//   note?: string;
// }

interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  pricing: IPricing;
  payment: IPayment;
  orderStatus: IOrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
  statusHistory: IOrderStatusHistory[];
}

const OrderSchema = new Schema<IOrder>(
  {
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
  },
  { timestamps: true },
);

const Order = model<IOrder>("Order", OrderSchema);

const validateCreateOrder = (order: ICreateOrderSchema) => {
  return CreateOrderSchema.safeParse(order);
};
const validateUpdateOrder = (order: IUpdateOrderSchema) => {
  return UpdateOrderSchema.safeParse(order);
};

export { Order, validateCreateOrder, validateUpdateOrder };
