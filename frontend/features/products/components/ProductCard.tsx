"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Check } from "lucide-react";
import { Product } from "../types/product.types";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { Text } from "@/_components/shared";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

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

  const imageUrl =
    product.productImages?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product._id}`} className="block h-full group">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="h-full relative rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden shadow-sm hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between"
      >
        {/* Product Image & Badges */}
        <div className="relative aspect-square w-full bg-bgPrimary overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {discountPercentage > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-primary text-textPrimary font-extrabold text-[11px] shadow-sm">
                {discountPercentage}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-textError/90 text-white font-medium text-[10px]">
                Only {product.stock} left
              </span>
            )}
          </div>

          <span className="absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md z-10">
            {product.category}
          </span>
        </div>

        {/* Info Content */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1 mb-1.5 text-xs text-textSecondary">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <Text as="span" size="xs" font="bold" color="primary">
                {product.ratingAverage || 4.8}
              </Text>
              <Text
                as="span"
                size="xs"
                color="secondary"
                className="text-[11px]"
              >
                ({product.ratingQuantity || 24})
              </Text>
            </div>

            <Text
              as="h3"
              size="sm"
              font="bold"
              className="group-hover:text-primary transition-colors line-clamp-1 mb-1"
            >
              {product.title}
            </Text>

            <Text size="xs" color="secondary" className="line-clamp-2 mb-3">
              {product.description}
            </Text>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-borderPrimary flex items-center justify-between mt-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <Text as="span" size="base" font="black" color="accent">
                  {effectivePrice} EGP
                </Text>
                {product.priceAfterDiscount &&
                  product.priceAfterDiscount < product.price && (
                    <Text
                      as="span"
                      size="xs"
                      color="secondary"
                      className="line-through"
                    >
                      {product.price} EGP
                    </Text>
                  )}
              </div>
              <Text size="xs" color="secondary" className="text-[10px]">
                Inclusive of taxes
              </Text>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className={`p-2.5 rounded-xl border transition-all z-10 ${
                added
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-bgPrimary border-borderPrimary hover:border-primary text-textPrimary hover:text-primary"
              }`}
              title="Add to cart"
            >
              {added ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
