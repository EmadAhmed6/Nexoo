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
  totalOrderPrice: number;
}

export interface IPaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
}

export interface IPayment {
  paymentMethod: "Paypal" | "Stripe" | "COD";
  isPaid: boolean;
  paidAt?: string;
  paymentResult?: IPaymentResult;
}

export interface IOrderStatus {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  isDelivered: boolean;
  deliveredAt?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  pricing: IPricing;
  payment: IPayment;
  orderStatus: IOrderStatus;
  createdAt: string;
  updatedAt: string;
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
  paymentMethod: "Paypal" | "Stripe" | "COD";
}

export interface CreatePayPalOrderResponse {
  paypalOrderId: string;
  approvalUrl?: string;
}
