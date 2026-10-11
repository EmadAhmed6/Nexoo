"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
  Sparkles,
  PackageOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "../store/useCartStore";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "../hooks/useCart";
import { Text } from "@/_components/shared/Text";
import { cn } from "@/lib/utils";

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-borderPrimary to-transparent",
        className,
      )}
    />
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

interface StepperProps {
  value: number;
  isLoading: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
}

function Stepper({ value, isLoading, onDecrement, onIncrement }: StepperProps) {
  return (
    <div className="flex items-center rounded-lg border border-borderPrimary bg-bgPrimary overflow-hidden">
      <button
        onClick={onDecrement}
        disabled={isLoading || value <= 1}
        aria-label="Decrease quantity"
        className="px-2 py-1.5 text-textSecondary hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-3 h-3" />
      </button>

      <span className="min-w-[1.75rem] text-center text-xs font-bold text-textPrimary select-none">
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin inline text-primary" />
        ) : (
          value
        )}
      </span>

      <button
        onClick={onIncrement}
        disabled={isLoading}
        aria-label="Increase quantity"
        className="px-2 py-1.5 text-textSecondary hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col items-center justify-center text-center px-8 py-12"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl border border-borderPrimary bg-bgPrimary flex items-center justify-center">
          <PackageOpen
            className="w-10 h-10 text-textSecondary"
            strokeWidth={1.5}
          />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary" />
        </span>
      </div>

      <Text font="bold" size="lg" className="mb-2">
        Your cart is empty
      </Text>
      <Text
        size="xs"
        color="secondary"
        className="max-w-[220px] leading-relaxed mb-8"
      >
        Discover our exclusive collection and add your favourite luxury pieces.
      </Text>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClose}
        className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-primary hover:bg-primaryHover shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_28px_rgba(212,175,55,0.4)] transition-all duration-200"
      >
        Explore Collection
      </motion.button>
    </motion.div>
  );
}

// ─── Cart Item Card ───────────────────────────────────────────────────────────

interface CartItemCardProps {
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  isRemoving: boolean;
  isUpdating: boolean;
  onRemove: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onNavigate: () => void;
}

function CartItemCard({
  productId,
  title,
  imageUrl,
  price,
  originalPrice,
  quantity,
  isRemoving,
  isUpdating,
  onRemove,
  onDecrement,
  onIncrement,
  onNavigate,
}: CartItemCardProps) {
  const router = useRouter();
  const hasDiscount =
    originalPrice !== undefined && originalPrice > 0 && originalPrice > price;

  const handleCardClick = () => {
    onNavigate();
    router.push(`/products/${productId}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="group relative flex gap-3.5 p-3.5 rounded-2xl border border-borderPrimary bg-bgPrimary hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      {/* Full-card link overlay for accessibility & tab navigation */}
      <Link
        href={`/products/${productId}`}
        onClick={onNavigate}
        className="absolute inset-0 rounded-2xl z-0"
        aria-label={`View ${title}`}
      />

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border border-borderPrimary bg-bgSecondary pointer-events-none">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="relative flex-1 min-w-0 flex flex-col justify-between py-0.5 pointer-events-none">
        <span className="truncate leading-snug mb-1.5 text-xs font-bold text-textPrimary">
          {title}
        </span>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-black text-primary">
            {price.toFixed(2)} EGP
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-medium text-textSecondary line-through">
              {originalPrice!.toFixed(2)} EGP
            </span>
          )}
        </div>

        {/* Line total */}
        <Text size="xs" color="secondary" className="text-[10px] mt-1">
          {quantity} ×{" "}
          <span className="text-textPrimary font-semibold">
            {(quantity * price).toFixed(2)} EGP
          </span>
        </Text>
      </div>

      {/* Controls — isolated from card navigation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-end justify-between gap-2 flex-shrink-0 py-0.5 z-10"
      >
        {/* Remove */}
        <button
          onClick={onRemove}
          disabled={isRemoving}
          title="Remove item"
          aria-label="Remove item from cart"
          className="p-1.5 rounded-lg text-textSecondary hover:text-textError hover:bg-textError/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          {isRemoving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>

        <Stepper
          value={quantity}
          isLoading={isUpdating}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />
      </div>
    </motion.div>
  );
}

// ─── Summary Footer ───────────────────────────────────────────────────────────

interface SummaryFooterProps {
  subtotal: number;
  onClose: () => void;
}

function SummaryFooter({ subtotal, onClose }: SummaryFooterProps) {
  return (
    <div className="p-5 border-t border-borderPrimary bg-bgSecondary space-y-4">
      {/* Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Text size="xs" color="secondary">
            Subtotal
          </Text>
          <Text font="semiBold" size="xs">
            {subtotal.toFixed(2)} EGP
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="xs" color="secondary">
            Shipping
          </Text>
          <span className="text-[11px] font-bold text-primary">
            Free · Nexo Exclusive
          </span>
        </div>
      </div>

      <Divider />

      {/* Total */}
      <div className="flex items-center justify-between">
        <Text font="bold" size="sm">
          Total Amount
        </Text>
        <Text font="black" size="xl" color="accent">
          {subtotal.toFixed(2)} EGP
        </Text>
      </div>

      {/* CTA */}
      <Link
        href="/checkout"
        onClick={onClose}
        className="group flex w-full items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.5)] transition-all duration-200"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </Link>

      {/* Reassurance */}
      <p className="text-center text-[10px] text-textSecondary leading-relaxed">
        🔒 Secure checkout &nbsp;·&nbsp; Free returns &nbsp;·&nbsp; Nexo Promise
      </p>
    </div>
  );
}

// ─── Main CartDrawer ──────────────────────────────────────────────────────────

export function CartDrawer() {
  const { isOpen, closeCart } = useCartStore();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const cartItems = (cart?.cartItems ?? []).filter(
    (item) => Boolean(item && item.product),
  );
  const totalPrice = cart?.totalPrice ?? 0;
  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.productQuantity,
    0,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/55 backdrop-blur-[3px] z-50"
            aria-hidden="true"
          />

          {/* ── Drawer panel ─────────────────────────────────────────────── */}
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] flex flex-col z-50 bg-bgSecondary border-l border-borderPrimary shadow-[-8px_0_48px_rgba(0,0,0,0.4)]"
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-borderPrimary bg-bgSecondary">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <ShoppingBag
                    className="w-[18px] h-[18px] text-primary"
                    strokeWidth={2}
                  />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center px-1 leading-none">
                      {totalItems}
                    </span>
                  )}
                </div>

                <div>
                  <Text font="bold" size="base" className="leading-tight">
                    Shopping Cart
                  </Text>
                  <Text
                    size="xs"
                    color="secondary"
                    className="leading-tight mt-0.5"
                  >
                    {totalItems === 0
                      ? "No items yet"
                      : `${totalItems} item${totalItems !== 1 ? "s" : ""} selected`}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Clear all items from your cart?")) {
                        clearCart.mutate();
                      }
                    }}
                    disabled={clearCart.isPending}
                    title="Clear entire cart"
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    {clearCart.isPending ? "Clearing..." : "Clear"}
                  </button>
                )}
                <button
                  onClick={closeCart}
                  aria-label="Close cart"
                  className="p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Items list ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <Text size="xs" color="secondary">
                    Loading your cart…
                  </Text>
                </div>
              ) : cartItems.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => {
                    const { product, productQuantity } = item;
                    if (!product) return null;

                    const effectivePrice =
                      product.priceAfterDiscount &&
                      product.priceAfterDiscount > 0
                        ? product.priceAfterDiscount
                        : product.price ?? 0;

                    const hasDiscount =
                      product.priceAfterDiscount &&
                      product.priceAfterDiscount > 0 &&
                      product.priceAfterDiscount < (product.price ?? 0);

                    const imageUrl =
                      product.productImages?.[0]?.url ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=70";

                    const isRemoving =
                      removeItem.isPending &&
                      removeItem.variables === product._id;
                    const isUpdating =
                      updateItem.isPending &&
                      updateItem.variables?.productId === product._id;

                    return (
                      <CartItemCard
                        key={product._id}
                        productId={product._id}
                        title={product.title}
                        imageUrl={imageUrl}
                        price={effectivePrice}
                        originalPrice={hasDiscount ? product.price : undefined}
                        quantity={productQuantity}
                        isRemoving={isRemoving}
                        isUpdating={isUpdating}
                        onRemove={() => removeItem.mutate(product._id)}
                        onDecrement={() =>
                          updateItem.mutate({
                            productId: product._id,
                            payload: { productQuantity: productQuantity - 1 },
                          })
                        }
                        onIncrement={() =>
                          updateItem.mutate({
                            productId: product._id,
                            payload: { productQuantity: productQuantity + 1 },
                          })
                        }
                        onNavigate={closeCart}
                      />
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* ── Summary / Footer ───────────────────────────────────────── */}
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <SummaryFooter subtotal={totalPrice} onClose={closeCart} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
