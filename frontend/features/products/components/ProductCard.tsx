"use client";

import React from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Check, Heart, Bookmark, Loader2 } from "lucide-react";
import { Product } from "../types/product.types";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useToggleLikeProduct } from "../hooks/useProducts";
import { useIsInWishlist, useToggleWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";
import { Text } from "@/_components/shared";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("products");
  const [added, setAdded] = React.useState(false);
  const inWishlist = useIsInWishlist(product._id);
  const { toggleWishlist, isPending: isWishlistPending } = useToggleWishlist();
  const addToCart = useAddToCart();
  const toggleLike = useToggleLikeProduct();
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const router = useRouter();

  const isLiked = Boolean(
    user?._id &&
      product.likes?.some(
        (id) =>
          (typeof id === "string" ? id : (id as { _id?: string })._id || id) ===
          user._id,
      ),
  );

  const likesCount = product.likesCount ?? product.likes?.length ?? 0;

  const effectivePrice =
    product.priceAfterDiscount && product.priceAfterDiscount > 0
      ? product.priceAfterDiscount
      : product.price;

  const discountPercentage =
    product.priceAfterDiscount &&
    product.priceAfterDiscount > 0 &&
    product.priceAfterDiscount < product.price
      ? Math.round(
          ((product.price - product.priceAfterDiscount) / product.price) * 100,
        )
      : 0;

  const imageUrl = product.productImages?.[0]?.url;

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error(t("signInToLike"));
      router.push("/auth/login");
      return;
    }

    toggleLike.mutate(product._id, {
      onSuccess: () => {
        if (!isLiked) {
          toast.success(t("addedToLiked"));
        } else {
          toast.info(t("removedFromLiked"));
        }
      },
      onError: (err) => {
        toast.error((err as Error)?.message || t("failedLike"));
      },
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id, product.title);
  };

  const isOutOfStock = product.stock <= 0 || Boolean(product.isOutOfStock);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error(t("outOfStock"));
      return;
    }

    if (!isAuthenticated) {
      toast.error(t("signInFirst"));
      router.push("/auth/login");
      return;
    }

    addToCart.mutate(
      { productId: product._id, productQuantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          toast.success(t("addedToCart"));
          setTimeout(() => setAdded(false), 1500);
        },
        onError: () => {
          toast.error(t("failedAddToCart"));
        },
      },
    );
  };

  return (
    <Link href={`/products/${product._id}`} className="block h-full group">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.25 }}
        className="h-full relative rounded-3xl border border-borderPrimary bg-bgSecondary overflow-hidden shadow-sm hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      >
        {/* Product Image & Badges */}
        <div className="relative aspect-[4/3.8] w-full bg-bgPrimary overflow-hidden group/image">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className={`object-cover group-hover:scale-108 transition-transform duration-500 ${
              isOutOfStock ? "grayscale-[40%] opacity-80" : ""
            }`}
          />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercentage > 0 && (
              <span className="px-3.5 py-1.5 rounded-full bg-primary text-white dark:text-black font-black text-xs shadow-md tracking-tight">
                {discountPercentage}% OFF
              </span>
            )}
            {isOutOfStock ? (
              <span className="px-3 py-1.5 rounded-full bg-textError/95 text-white font-bold text-xs text-center shadow-sm">
                {t("outOfStock")}
              </span>
            ) : product.stock <= 5 && product.stock > 0 ? (
              <span className="px-3 py-1.5 rounded-full bg-amber-500/95 text-white font-bold text-xs text-center shadow-sm">
                {t("onlyLeft", { count: product.stock })}
              </span>
            ) : null}
          </div>

          <span className="absolute bottom-4 left-4 text-xs font-bold px-3 py-1.5 rounded-xl bg-black/70 text-white backdrop-blur-md z-10 pointer-events-none">
            {product.category}
          </span>

          {/* Vertical Circular Action Buttons sliding from left (No blur) */}
          <div className="absolute top-4 left-4 flex flex-col gap-2.5 z-20">
            {/* Circular Like Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleLike}
              disabled={toggleLike.isPending}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 cursor-pointer ${
                isLiked
                  ? "opacity-100 translate-x-0 bg-rose-500 text-white border-rose-400 shadow-rose-500/30"
                  : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 bg-bgSecondary/95 text-textPrimary hover:text-rose-500 border-borderPrimary hover:border-rose-500/40 shadow-black/20"
              }`}
              title={isLiked ? t("unlike") : t("like")}
              aria-label={isLiked ? t("unlike") : t("like")}
            >
              {toggleLike.isPending ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Heart
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isLiked ? "fill-white text-white" : ""
                  }`}
                />
              )}
            </motion.button>

            {/* Circular Wishlist Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              disabled={isWishlistPending}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 delay-75 cursor-pointer ${
                inWishlist
                  ? "opacity-100 translate-x-0 bg-primary text-white dark:text-black border-primary shadow-primary/30"
                  : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 bg-bgSecondary/95 text-textPrimary hover:text-primary border-borderPrimary hover:border-primary/40 shadow-black/20"
              }`}
              title={inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              aria-label={inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
            >
              {isWishlistPending ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Bookmark
                  className={`w-5 h-5 transition-transform duration-200 ${
                    inWishlist ? "fill-black text-white dark:text-black" : ""
                  }`}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
          <div>
            {/* Rating & Likes count */}
            <div className="flex items-center justify-between mb-2.5 text-xs text-textSecondary">
              <div className="flex items-center gap-1.5">
                <Star className="w-4.5 h-4.5 fill-primary text-primary" />
                <span className="text-sm font-bold text-primary">
                  {product.ratingAverage || 4.8}
                </span>
                <span className="text-xs text-textSecondary">
                  ({product.ratingQuantity || 24} {t("reviews")})
                </span>
              </div>

              {likesCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>{likesCount}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg sm:text-[19px] font-extrabold text-textPrimary group-hover:text-primary transition-colors line-clamp-1 mb-2 tracking-tight">
              {product.title}
            </h3>

            <p className="text-[13px] sm:text-sm text-textSecondary line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action */}
          <div className="pt-4 border-t border-borderPrimary flex items-center justify-between mt-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] sm:text-base font-bold text-primary whitespace-nowrap">
                  {effectivePrice} EGP
                </span>
                {product.priceAfterDiscount &&
                  product.priceAfterDiscount < product.price && (
                    <span className="text-xs font-normal text-textSecondary line-through whitespace-nowrap">
                      {product.price} EGP
                    </span>
                  )}
              </div>
              <span className="text-[10px] text-textSecondary block mt-0.5">
                {t("inclusiveTaxes")}
              </span>
            </div>

            <motion.button
              whileTap={isOutOfStock ? undefined : { scale: 0.92 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending}
              className={`p-3.5 rounded-2xl border transition-all z-10 shadow-sm ${
                isOutOfStock
                  ? "bg-bgPrimary/60 border-borderPrimary text-textSecondary/40 cursor-not-allowed opacity-60"
                  : added
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-bgPrimary border-borderPrimary hover:border-primary text-textPrimary hover:text-primary hover:bg-primary/10 cursor-pointer"
              }`}
              title={isOutOfStock ? t("outOfStock") : t("addToCart")}
            >
              {added ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
