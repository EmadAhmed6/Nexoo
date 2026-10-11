"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Check } from "lucide-react";
import { Product } from "../types/product.types";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useAppStore } from "@/store/use-app-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Text } from "@/_components/shared";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = React.useState(false);
  const addToCart = useAddToCart();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const router = useRouter();

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in first");
      router.push("/auth/login");
      return;
    }

    addToCart.mutate(
      { productId: product._id, productQuantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          toast.success("Added to cart");
          setTimeout(() => setAdded(false), 1500);
        },
        onError: () => {
          toast.error("Failed to add to cart");
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
        <div className="relative aspect-[4/3.8] w-full bg-bgPrimary overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover group-hover:scale-108 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 z-10">
            {discountPercentage > 0 && (
              <span className="px-3.5 py-1.5 rounded-full bg-primary text-black font-black text-xs shadow-md tracking-tight">
                {discountPercentage}% OFF
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-textError/95 text-white font-bold text-[11px] text-center shadow-sm">
                Only {product.stock} left
              </span>
            )}
          </div>

          <span className="absolute bottom-3.5 left-3.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/70 text-white backdrop-blur-md z-10">
            {product.category}
          </span>
        </div>

        {/* Info Content */}
        <div className="p-5 sm:p-5.5 flex flex-col flex-1 justify-between gap-4">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-2 text-xs text-textSecondary">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-xs font-bold text-primary">
                {product.ratingAverage || 4.8}
              </span>
              <span className="text-[11px] text-textSecondary">
                ({product.ratingQuantity || 24} reviews)
              </span>
            </div>

            <h3 className="text-base sm:text-[17px] font-extrabold text-textPrimary group-hover:text-primary transition-colors line-clamp-1 mb-1.5 tracking-tight">
              {product.title}
            </h3>

            <p className="text-xs sm:text-[13px] text-textSecondary line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action */}
          <div className="pt-3.5 border-t border-borderPrimary flex items-center justify-between mt-auto">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-primary">
                  {effectivePrice} EGP
                </span>
                {product.priceAfterDiscount &&
                  product.priceAfterDiscount < product.price && (
                    <span className="text-xs font-medium text-textSecondary line-through">
                      {product.price} EGP
                    </span>
                  )}
              </div>
              <span className="text-[10px] text-textSecondary">
                Inclusive of all taxes
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className={`p-3 rounded-2xl border transition-all z-10 shadow-sm ${
                added
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-bgPrimary border-borderPrimary hover:border-primary text-textPrimary hover:text-primary hover:bg-primary/10"
              }`}
              title="Add to cart"
            >
              {added ? (
                <Check className="w-4.5 h-4.5 text-white" />
              ) : (
                <ShoppingBag className="w-4.5 h-4.5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
