"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  CreditCard,
  MapPin,
  ChevronRight,
  Loader2,
  Trash2,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import {
  useOrders,
  useDeleteOrder,
  useCreatePaymobOrder,
} from "@/features/orders/hooks/useOrders";
import { Text } from "@/_components/shared/Text";
import { Sidebar } from "@/_components/shared";
import { OrderStatusTimeline } from "@/features/orders/components/OrderStatusTimeline";
import { useLocale, useTranslations } from "next-intl";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: any }
> = {
  Pending: {
    label: "Pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  Processing: {
    label: "Processing",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: Package,
  },
  Shipped: {
    label: "Shipped",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle,
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: orders, isLoading, refetch } = useOrders();
  const deleteOrderMutation = useDeleteOrder();
  const createPaymobMutation = useCreatePaymobOrder();

  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const handleDelete = async (orderId: string) => {
    if (!confirm(tCommon("confirm"))) return;
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      toast.success("Order cancelled successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order");
    }
  };

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      sessionStorage.setItem("current_checkout_order_id", orderId);
      const res = await createPaymobMutation.mutateAsync(orderId);
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Could not obtain Paymob payment link");
        setPayingOrderId(null);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate Paymob payment");
      setPayingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <Text color="secondary" size="sm">
          {tCommon("loading")}
        </Text>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-textPrimary tracking-tight mb-2">
          {t("emptyTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary max-w-sm mb-6">
          {t("emptySubtitle")}
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t("startShopping")}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full flex flex-col md:flex-row items-start gap-8">
      {/* Desktop Sidebar Aside */}
      <Sidebar className="hidden md:block" />

      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-6">
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.orderStatus?.status] || STATUS_CONFIG.Pending;
          const StatusIcon = status.icon;
          const orderDate = new Date(order.createdAt).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={order._id}
              className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden transition-all hover:border-primary/30"
            >
              {/* Header Bar */}
              <div className="p-4 sm:p-5 bg-bgPrimary/60 border-b border-borderPrimary flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-textSecondary block text-[10px] uppercase tracking-wider font-semibold">
                      {t("orderId")}
                    </span>
                    <span className="font-mono font-bold text-textPrimary">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div className="hidden sm:block h-6 w-px bg-borderPrimary" />

                  <div>
                    <span className="text-textSecondary block text-[10px] uppercase tracking-wider font-semibold">
                      {t("date")}
                    </span>
                    <span className="font-medium text-textPrimary">
                      {orderDate}
                    </span>
                  </div>

                  <div className="hidden sm:block h-6 w-px bg-borderPrimary" />

                  <div>
                    <span className="text-textSecondary block text-[10px] uppercase tracking-wider font-semibold">
                      {t("total")}
                    </span>
                    <span className="font-bold text-primary">
                      {order.pricing.totalOrderPrice.toFixed(2)} EGP
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${status.bg} ${status.color}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{t(status.label.toLowerCase() as "pending" | "processing" | "shipped" | "delivered" | "cancelled")}</span>
                  </div>

                  {order.orderStatus.status === "Pending" && (
                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={deleteOrderMutation.isPending}
                      title={t("cancelOrder")}
                      className="p-1.5 rounded-lg text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Body: Items & Details */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Purchased Items List */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                    {t("items")}
                  </h3>

                  <div className="space-y-2.5">
                    {order.orderItems.map((item, idx) => {
                      const imgUrl =
                        item.productImage?.[0]?.url ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=70";

                      const productId =
                        typeof item.product === "object"
                          ? item.product?._id
                          : item.product;

                      const cardContent = (
                        <>
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-bgSecondary border border-borderPrimary group-hover:border-primary/40 transition-colors">
                            <Image
                              src={imgUrl}
                              alt={item.productTitle}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors truncate block">
                              {item.productTitle}
                            </span>
                            <p className="text-[11px] text-textSecondary mt-0.5">
                              Qty: {item.productQuantity} ×{" "}
                              {item.productPrice.toFixed(2)} EGP
                            </p>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span className="text-xs font-bold text-textPrimary">
                              {(item.productQuantity * item.productPrice).toFixed(2)}{" "}
                              EGP
                            </span>
                            {productId && (
                              <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            )}
                          </div>
                        </>
                      );

                      return productId ? (
                        <Link
                          key={idx}
                          href={`/products/${productId}`}
                          className="group flex items-center gap-3.5 p-3 rounded-2xl bg-bgPrimary border border-borderPrimary hover:border-primary/50 hover:bg-bgSecondary/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.08)]"
                        >
                          {cardContent}
                        </Link>
                      ) : (
                        <div
                          key={idx}
                          className="flex items-center gap-3.5 p-3 rounded-2xl bg-bgPrimary border border-borderPrimary"
                        >
                          {cardContent}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Payment & Shipping Info */}
                <div className="p-4 rounded-xl bg-bgPrimary border border-borderPrimary space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Shipping Address */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-textPrimary mb-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{t("shippingAddress")}</span>
                      </div>
                      <p className="text-[11px] text-textSecondary leading-relaxed">
                        {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} ({order.shippingAddress.postalCode})
                      </p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        📞 {order.shippingAddress.phone}
                      </p>
                    </div>

                    <div className="border-t border-borderPrimary pt-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-textPrimary mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <span>{t("paymentMethod")} ({order.payment.paymentMethod})</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <span className="text-textSecondary">{t("status")}:</span>
                        <span
                          className={`font-bold ${
                            order.payment.isPaid
                              ? "text-primary"
                              : "text-amber-500"
                          }`}
                        >
                          {order.payment.isPaid ? t("paid") : t("paymentPending")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pay with Paymob CTA if online method and unpaid */}
                  {!order.payment.isPaid &&
                    (order.payment.paymentMethod === "Paymob" ||
                      order.payment.paymentMethod === "Paypal") &&
                    order.orderStatus.status === "Pending" && (
                      <button
                        onClick={() => handlePayNow(order._id)}
                        disabled={payingOrderId === order._id}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {payingOrderId === order._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>{t("payNow")}</span>
                      </button>
                    )}
                </div>
              </div>

              {/* Order Status Timeline & Tracking History */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-borderPrimary pt-4 bg-bgPrimary/20">
                <OrderStatusTimeline order={order} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
