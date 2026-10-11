"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, Package, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useCapturePayPalPayment,
  useOrder,
} from "@/features/orders/hooks/useOrders";
import { Text } from "@/_components/shared/Text";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paypalToken = searchParams.get("token"); // PayPal Order ID
  const queryOrderId = searchParams.get("orderId");

  const [orderId, setOrderId] = useState<string | null>(queryOrderId);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const captureMutation = useCapturePayPalPayment();
  const { data: order, isLoading: isOrderLoading, refetch } = useOrder(orderId || "");

  useEffect(() => {
    // If orderId not in URL, check sessionStorage
    if (!orderId && typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("current_checkout_order_id");
      if (storedId) {
        setOrderId(storedId);
      }
    }
  }, [orderId]);

  useEffect(() => {
    // If we have both a PayPal token and an orderId, trigger capture
    if (paypalToken && orderId && !isCapturing && !captureError) {
      setIsCapturing(true);
      captureMutation
        .mutateAsync({
          paypalOrderId: paypalToken,
          orderId,
        })
        .then(() => {
          toast.success("PayPal Payment Completed Successfully!");
          sessionStorage.removeItem("current_checkout_order_id");
          refetch();
        })
        .catch((err: any) => {
          // If already captured or error
          if (!err?.message?.includes("already paid")) {
            setCaptureError(err?.message || "Failed to capture PayPal payment");
          }
        })
        .finally(() => {
          setIsCapturing(false);
        });
    }
  }, [paypalToken, orderId]);

  if (isCapturing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-xl font-bold text-textPrimary">
          Finalizing Your PayPal Payment...
        </h2>
        <p className="text-xs text-textSecondary max-w-sm">
          Please wait while we confirm your payment with PayPal and process your order.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="p-8 sm:p-12 rounded-3xl border border-borderPrimary bg-bgSecondary space-y-6 shadow-xl">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-textSecondary max-w-md mx-auto">
            Your order has been received and is currently being prepared with care.
          </p>
        </div>

        {orderId && (
          <div className="inline-block px-4 py-2 rounded-xl bg-bgPrimary border border-borderPrimary text-xs text-textSecondary">
            Order Reference:{" "}
            <span className="font-mono font-bold text-textPrimary">{orderId}</span>
          </div>
        )}

        {order && (
          <div className="text-left p-6 rounded-2xl bg-bgPrimary border border-borderPrimary space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-borderPrimary pb-3 text-xs">
              <span className="text-textSecondary">Payment Status:</span>
              <span className={`font-bold ${order.payment.isPaid ? "text-primary" : "text-amber-500"}`}>
                {order.payment.isPaid ? "Paid in Full" : "Pending Payment / COD"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-borderPrimary pb-3 text-xs">
              <span className="text-textSecondary">Total Amount:</span>
              <span className="font-black text-textPrimary text-sm">
                {order.pricing.totalOrderPrice.toFixed(2)} EGP
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-textSecondary">Delivery Destination:</span>
              <span className="font-medium text-textPrimary text-right">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </span>
            </div>
          </div>
        )}

        {captureError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{captureError}</span>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
