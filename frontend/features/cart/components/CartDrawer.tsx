"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../store/useCartStore";
import { Text } from "@/_components/shared/Text";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-bgSecondary border-l border-borderPrimary shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-borderPrimary flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <Text font="bold" size="base">Shopping Cart</Text>
                  <Text size="xs" color="secondary">{totalItems} items selected</Text>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-bgPrimary border border-borderPrimary flex items-center justify-center text-textSecondary mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <Text font="bold" size="lg" className="mb-1">Your cart is empty</Text>
                  <Text size="xs" color="secondary" className="max-w-xs mb-6">
                    Looks like you haven&apos;t added any luxury items to your cart yet.
                  </Text>
                  <button
                    onClick={closeCart}
                    className="px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primaryHover transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map(({ product, quantity }) => {
                  const effectivePrice =
                    product.priceAfterDiscount !== undefined && product.priceAfterDiscount > 0
                      ? product.priceAfterDiscount
                      : product.price;

                  const imageUrl =
                    product.productImages?.[0]?.url ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      key={product._id}
                      className="p-3.5 rounded-2xl border border-borderPrimary bg-bgPrimary flex gap-3.5 items-center"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bgSecondary flex-shrink-0 border border-borderPrimary">
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Text font="bold" size="xs" className="truncate mb-1">
                          {product.title}
                        </Text>
                        <div className="flex items-center gap-1.5">
                          <Text font="black" size="xs" color="accent">
                            {effectivePrice} EGP
                          </Text>
                          {product.priceAfterDiscount && product.priceAfterDiscount < product.price && (
                            <Text size="xs" color="secondary" className="line-through text-[10px]">
                              {product.price} EGP
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(product._id)}
                          className="text-textSecondary hover:text-textError transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-borderPrimary rounded-lg bg-bgSecondary">
                          <button
                            onClick={() => updateQuantity(product._id, quantity - 1)}
                            className="p-1 text-textSecondary hover:text-textPrimary"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-textPrimary">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, quantity + 1)}
                            className="p-1 text-textSecondary hover:text-textPrimary"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-borderPrimary bg-bgSecondary space-y-3.5">
                <div className="flex justify-between items-center text-xs text-textSecondary">
                  <span>Subtotal:</span>
                  <Text font="semiBold" size="xs">{totalPrice} EGP</Text>
                </div>
                <div className="flex justify-between items-center text-xs text-textSecondary">
                  <span>Shipping:</span>
                  <span className="text-emerald-500 font-semibold">Free (Nexo Exclusive)</span>
                </div>
                <div className="pt-2 border-t border-borderPrimary flex justify-between items-center">
                  <Text font="bold" size="sm">Total Amount:</Text>
                  <Text font="black" size="lg" color="accent">{totalPrice} EGP</Text>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={clearCart}
                    className="px-3 py-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textError hover:border-textError/40 text-xs font-semibold transition-colors"
                  >
                    Clear
                  </button>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
