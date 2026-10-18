export interface IOrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
    productImages: { url: string; publicId: string }[];
  } | string;
  productQuantity: number;
  productPrice: number;
  productTitle: string;
  productImage: { url: string; publicId: string }[];
}

export interface IShippingAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
}

export interface IPricing {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  couponCode?: string | null;
  discountPrice?: number;
  totalOrderPrice: number;
}

export interface IPaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
}

export interface IPayment {
  paymentMethod: "Paymob" | "COD" | "Stripe" | "Paypal";
  isPaid: boolean;
  paidAt?: string;
  paymentResult?: IPaymentResult;
}

export interface IOrderStatus {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  isDelivered: boolean;
  deliveredAt?: string;
}

export interface IOrderUser {
  _id: string;
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  profilePic?: { url: string; publicId?: string };
  role?: string;
}

export interface Order {
  _id: string;
  user: IOrderUser | string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  pricing: IPricing;
  payment: IPayment;
  orderStatus: IOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminOrderStatusPayload {
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  isPaid?: boolean;
}

export interface CreateOrderPayload {
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: "Paymob" | "COD" | "Stripe" | "Paypal";
}

export interface CreatePaymobOrderResponse {
  orderId: string;
  checkoutUrl: string;
  clientSecret?: string;
}

export interface AdminOrderFilterParams {
  orderStatus?: string;
  orderId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  status?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number;
  limit?: number;
  isPaid?: boolean | string;
}

export interface AdminOrderOverview {
  totalOrders: number;
  pendingOrders: number;
  DeliveredOrders?: number;
  deliveredOrders?: number;
  processingOrders: number;
  cancelledOrders: number;
  totalPaidAmount: number;
}
