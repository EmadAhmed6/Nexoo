"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Lock,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateOrder,
  useCreatePaymobOrder,
} from "@/features/orders/hooks/useOrders";
import { useCart } from "@/features/cart/hooks/useCart";
import { CartItem } from "@/features/cart/types/cart.types";
import { Text } from "@/_components/shared/Text";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const createOrderMutation = useCreateOrder();
  const createPaymobMutation = useCreatePaymobOrder();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Cairo");
  const [state, setState] = useState("Cairo");
  const [country, setCountry] = useState("Egypt");
  const [postalCode, setPostalCode] = useState("11371");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Paymob" | "COD">("Paymob");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = (cart?.cartItems ?? []).filter(
    (item: CartItem) => Boolean(item && item.product),
  );
  const totalPrice = cart?.totalPrice ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || address.trim().length < 5) {
      toast.error("Address must be at least 5 characters long");
      return;
    }
    if (!city || city.trim().length < 2) {
      toast.error("City is required");
      return;
    }
    if (!state || state.trim().length < 2) {
      toast.error("State is required");
      return;
    }
    if (!postalCode || !/^\d{5}$/.test(postalCode.trim())) {
      toast.error("Postal code must be exactly 5 digits (e.g. 11371)");
      return;
    }
    if (!phone || !/^01\d{9}$/.test(phone.trim())) {
      toast.error("Phone number must start with 01 and be exactly 11 digits");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        shippingAddress: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || "Egypt",
          postalCode: postalCode.trim(),
          phone: phone.trim(),
        },
        paymentMethod,
      };

      const createdOrderRes = await createOrderMutation.mutateAsync(orderPayload);
      const createdOrder = createdOrderRes.data;

      if (!createdOrder) {
        throw new Error("Failed to create order");
      }

      // If Paymob, initialize transaction and redirect to Paymob checkout URL
      if (paymentMethod === "Paymob") {
        toast.info("Connecting to secure Paymob payment gateway...");
        sessionStorage.setItem("current_checkout_order_id", createdOrder._id);

        const paymobRes = await createPaymobMutation.mutateAsync(createdOrder._id);
        if (paymobRes.data?.checkoutUrl) {
          window.location.href = paymobRes.data.checkoutUrl;
          return;
        } else {
          toast.success("Order created! Proceeding to order details.");
          router.push(`/checkout/success?orderId=${createdOrder._id}`);
          return;
        }
      }

      toast.success("Order placed successfully!");
      router.push(`/checkout/success?orderId=${createdOrder._id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order");
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <Text color="secondary" size="sm">
          Loading checkout details...
        </Text>
      </div>
    );
  }

  if (!isCartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-primary" />
        </div>
        <Text font="bold" size="2xl" className="mb-2">
          Your Cart is Empty
        </Text>
        <Text color="secondary" size="sm" className="max-w-md mb-6">
          You don't have any products in your cart to checkout. Explore our
          curated collection and add items to your cart first.
        </Text>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold shadow-md transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Form */}
        <div className="flex-1 w-full space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
              Express Checkout
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-1">
              Complete your delivery address and choose your payment method.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Delivery Address Card */}
            <div className="p-6 rounded-2xl border border-borderPrimary bg-bgSecondary space-y-5">
              <div className="flex items-center gap-3 border-b border-borderPrimary pb-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-textPrimary">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-textSecondary">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 El-Tahrir Street, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cairo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                      State / Governorate *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cairo"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                      Postal Code (5 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="11371"
                      maxLength={5}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                      Phone Number (starts with 01) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="p-6 rounded-2xl border border-borderPrimary bg-bgSecondary space-y-5">
              <div className="flex items-center gap-3 border-b border-borderPrimary pb-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-textPrimary">
                    Payment Method
                  </h2>
                  <p className="text-xs text-textSecondary">
                    Select how you want to settle your transaction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paymob option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Paymob")}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    paymentMethod === "Paymob"
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
                      : "border-borderPrimary bg-bgPrimary hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-textPrimary tracking-wide">
                        Card / Wallets (Paymob)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                        Fast & Secure
                      </span>
                    </div>
                    {paymentMethod === "Paymob" && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Pay securely using Visa, MasterCard, Meeza, or Smart Mobile Wallets.
                  </p>
                </button>

                {/* COD option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
                      : "border-borderPrimary bg-bgPrimary hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-textPrimary">
                      Cash On Delivery
                    </span>
                    {paymentMethod === "COD" && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Pay in cash upon delivery to your doorstep.
                  </p>
                </button>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primaryHover text-black font-extrabold text-sm shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : paymentMethod === "Paymob" ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Paymob Payment ({totalPrice.toFixed(2)} EGP)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Order ({totalPrice.toFixed(2)} EGP)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="w-full lg:w-[380px] rounded-2xl border border-borderPrimary bg-bgSecondary p-6 space-y-6 sticky top-24">
          <div className="border-b border-borderPrimary pb-4">
            <h2 className="text-base font-bold text-textPrimary">
              Order Summary
            </h2>
            <p className="text-xs text-textSecondary">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your bag
            </p>
          </div>

          {/* Items preview list */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item: CartItem) => {
              const { product, productQuantity, productPrice } = item;
              const imgUrl =
                product.productImages?.[0]?.url ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=70";

              return (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-bgPrimary border border-borderPrimary"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-bgSecondary">
                    <Image
                      src={imgUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-textPrimary truncate">
                      {product.title}
                    </p>
                    <p className="text-[11px] text-textSecondary">
                      Qty: {productQuantity} × {productPrice.toFixed(2)} EGP
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary">
                      {(productQuantity * productPrice).toFixed(2)} EGP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-borderPrimary pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-textSecondary">
              <span>Subtotal</span>
              <span className="text-textPrimary font-semibold">
                {totalPrice.toFixed(2)} EGP
              </span>
            </div>
            <div className="flex justify-between text-textSecondary">
              <span>Shipping</span>
              <span className="text-primary font-bold">Free</span>
            </div>
            <div className="flex justify-between text-textSecondary">
              <span>Estimated Tax</span>
              <span className="text-textPrimary font-semibold">0.00 EGP</span>
            </div>
            <div className="border-t border-borderPrimary pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-textPrimary">Total</span>
              <span className="text-lg font-black text-primary">
                {totalPrice.toFixed(2)} EGP
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bgPrimary border border-borderPrimary flex items-center gap-3 text-[11px] text-textSecondary">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <span>
              All transactions are encrypted with bank-level SSL security.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
