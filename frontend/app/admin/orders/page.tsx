"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Loader2,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  MapPin,
  Calendar,
  X,
  User as UserIcon,
  ChevronDown,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminOrders,
  useUpdateAdminOrderStatus,
} from "@/features/orders/hooks/useOrders";
import { Order, IOrderUser } from "@/features/orders/types/order.types";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  Pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    icon: Clock,
  },
  Processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: Package,
  },
  Shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: CheckCircle,
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
};

const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useAdminOrders();
  const updateStatusMutation = useUpdateAdminOrderStatus();

  // Metrics
  const metrics = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, delivered: 0, totalRevenue: 0 };
    const total = orders.length;
    const pending = orders.filter((o) => o.orderStatus.status === "Pending").length;
    const delivered = orders.filter((o) => o.orderStatus.status === "Delivered").length;
    const totalRevenue = orders
      .filter((o) => o.orderStatus.status !== "Cancelled" && o.payment.isPaid)
      .reduce((acc, o) => acc + (o.pricing?.totalOrderPrice || 0), 0);
    return { total, pending, delivered, totalRevenue };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      // Search
      const searchLower = search.toLowerCase();
      const orderIdMatch = order._id.toLowerCase().includes(searchLower);
      const user = typeof order.user === "object" ? (order.user as IOrderUser) : null;
      const userNameMatch = user?.fullName?.toLowerCase().includes(searchLower);
      const userEmailMatch = user?.email?.toLowerCase().includes(searchLower);
      const phoneMatch = order.shippingAddress?.phone?.includes(searchLower);

      const matchesSearch =
        !search || orderIdMatch || userNameMatch || userEmailMatch || phoneMatch;

      // Status Filter
      const matchesStatus =
        filterStatus === "all" || order.orderStatus?.status === filterStatus;

      // Payment Filter
      const matchesPayment =
        filterPayment === "all" ||
        (filterPayment === "paid" && order.payment.isPaid) ||
        (filterPayment === "unpaid" && !order.payment.isPaid);

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, filterStatus, filterPayment]);

  const handleQuickStatusChange = async (
    orderId: string,
    newStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        payload: { orderStatus: newStatus },
      });
      toast.success(`Order status changed to ${newStatus}`);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: {
                  ...prev.orderStatus,
                  status: newStatus,
                  isDelivered: newStatus === "Delivered",
                },
              }
            : null,
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Monitor, fulfill and update customer orders across the platform
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Total Orders</p>
              <p className="text-xl font-black text-textPrimary">{metrics.total}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Pending Orders</p>
              <p className="text-xl font-black text-amber-400">{metrics.pending}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Delivered</p>
              <p className="text-xl font-black text-emerald-400">{metrics.delivered}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Paid Volume</p>
              <p className="text-xl font-black text-textPrimary">
                {metrics.totalRevenue.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, email, or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Payment filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-primary text-black"
                : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
            }`}
          >
            All ({orders?.length ?? 0})
          </button>
          {ORDER_STATUS_OPTIONS.map((st) => {
            const count =
              orders?.filter((o) => o.orderStatus?.status === st).length ?? 0;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-primary text-black"
                    : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">Loading orders...</span>
          </div>
        ) : !filteredOrders.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingCart className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Total (EGP)
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {filteredOrders.map((order) => {
                  const status =
                    STATUS_CONFIG[order.orderStatus?.status] || STATUS_CONFIG.Pending;
                  const StatusIcon = status.icon;
                  const user =
                    typeof order.user === "object"
                      ? (order.user as IOrderUser)
                      : null;
                  const orderDate = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  );

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-bgPrimary/30 transition-colors"
                    >
                      {/* Order ID & Date */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono font-bold text-xs text-primary hover:underline"
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </button>
                          <div className="flex items-center gap-1 text-[11px] text-textSecondary">
                            <Calendar className="w-3 h-3" />
                            <span>{orderDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-primary">
                              {user?.fullName?.[0]?.toUpperCase() ?? "U"}
                            </span>
                          </div>
                          <div className="min-w-0 max-w-[150px]">
                            <p className="font-semibold text-textPrimary text-xs truncate">
                              {user?.fullName || "Guest Customer"}
                            </p>
                            <p className="text-[10.5px] text-textSecondary truncate">
                              {user?.email || order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.orderItems.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="relative w-6 h-6 rounded-md border border-borderPrimary bg-bgPrimary overflow-hidden"
                              >
                                <Image
                                  src={
                                    item.productImage?.[0]?.url ||
                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60"
                                  }
                                  alt={item.productTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-textSecondary font-medium">
                            {order.orderItems.reduce(
                              (sum, i) => sum + i.productQuantity,
                              0,
                            )}{" "}
                            items
                          </span>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-textPrimary text-xs">
                          {order.pricing?.totalOrderPrice?.toFixed(2)} EGP
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                              order.payment.isPaid
                                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                                : "bg-amber-400/10 border-amber-400/30 text-amber-400"
                            }`}
                          >
                            <CreditCard className="w-3 h-3" />
                            {order.payment.isPaid ? "Paid" : "Unpaid"}
                          </span>
                          <p className="text-[10px] text-textSecondary font-medium">
                            {order.payment.paymentMethod}
                          </p>
                        </div>
                      </td>

                      {/* Order Status with Quick Change */}
                      <td className="px-4 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus.status}
                            disabled={updateStatusMutation.isPending}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                order._id,
                                e.target.value as any,
                              )
                            }
                            className={`appearance-none pl-6 pr-6 py-1 rounded-full border text-xs font-bold cursor-pointer focus:outline-none transition-all ${status.bg} ${status.color}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-bgSecondary text-textPrimary">
                                {st}
                              </option>
                            ))}
                          </select>
                          <StatusIcon className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${status.color}`} />
                          <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${status.color}`} />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 hover:text-primary text-textSecondary text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleQuickStatusChange}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}

// ── ORDER DETAILS MODAL ──────────────────────────────────────────────────────────
function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
  ) => Promise<void>;
  isUpdating: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus.status);
  const user = typeof order.user === "object" ? (order.user as IOrderUser) : null;
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
  const StatusIcon = status.icon;

  if (!isOpen) return null;

  const handleSaveStatus = async () => {
    if (currentStatus === order.orderStatus.status) {
      toast.info("Status unchanged");
      return;
    }
    await onUpdateStatus(order._id, currentStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderPrimary">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg text-primary">
                #{order._id.slice(-8).toUpperCase()}
              </span>
              <div
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${status.bg} ${status.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{order.orderStatus.status}</span>
              </div>
            </div>
            <p className="text-xs text-textSecondary mt-0.5">
              Full Order ID: <span className="font-mono">{order._id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change Status Control Box */}
        <div className="p-4 rounded-xl border border-borderPrimary bg-bgPrimary/60 space-y-3">
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider">
            Update Order Status
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as any)}
              className="flex-1 px-3 py-2 rounded-xl border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors"
            >
              {ORDER_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={isUpdating || currentStatus === order.orderStatus.status}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Status</span>
            </button>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer Info */}
          <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-textPrimary">
              <UserIcon className="w-3.5 h-3.5 text-primary" />
              <span>Customer Information</span>
            </div>
            <div className="space-y-1 text-textSecondary">
              <p>
                <strong className="text-textPrimary">Name:</strong>{" "}
                {user?.fullName || "N/A"}
              </p>
              <p>
                <strong className="text-textPrimary">Email:</strong>{" "}
                {user?.email || "N/A"}
              </p>
              {user?.username && (
                <p>
                  <strong className="text-textPrimary">Username:</strong> @
                  {user.username}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-textPrimary">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Shipping Address</span>
            </div>
            <div className="space-y-1 text-textSecondary">
              <p>
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}
              </p>
              <p>
                {order.shippingAddress.country}{" "}
                {order.shippingAddress.postalCode &&
                  `(${order.shippingAddress.postalCode})`}
              </p>
              <p>
                <strong className="text-textPrimary">Phone:</strong>{" "}
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
            Order Items ({order.orderItems.length})
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {order.orderItems.map((item, idx) => {
              const imgUrl =
                item.productImage?.[0]?.url ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60";
              const productId =
                typeof item.product === "object"
                  ? item.product?._id
                  : item.product;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-borderPrimary bg-bgSecondary flex-shrink-0">
                    <Image
                      src={imgUrl}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-textPrimary truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-[11px] text-textSecondary">
                      Qty: {item.productQuantity} × {item.productPrice.toFixed(2)} EGP
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-textPrimary">
                      {(item.productQuantity * item.productPrice).toFixed(2)} EGP
                    </span>
                    {productId && (
                      <Link
                        href={`/products/${productId}`}
                        target="_blank"
                        className="p-1 rounded-md text-textSecondary hover:text-primary transition-colors"
                        title="View product"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-xl border border-borderPrimary bg-bgPrimary/80 space-y-2 text-xs">
          <div className="flex justify-between text-textSecondary">
            <span>Items Subtotal:</span>
            <span>{order.pricing?.itemsPrice?.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Shipping:</span>
            <span>{order.pricing?.shippingPrice?.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Tax:</span>
            <span>{order.pricing?.taxPrice?.toFixed(2)} EGP</span>
          </div>
          {Boolean(order.pricing?.discountPrice && order.pricing.discountPrice > 0) && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Coupon Discount:</span>
              <span>-{(order.pricing?.discountPrice ?? 0).toFixed(2)} EGP</span>
            </div>
          )}
          <div className="border-t border-borderPrimary pt-2 flex justify-between font-black text-sm text-textPrimary">
            <span>Total:</span>
            <span className="text-primary">
              {order.pricing?.totalOrderPrice?.toFixed(2)} EGP
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-borderPrimary hover:bg-bgPrimary text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
