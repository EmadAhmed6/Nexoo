"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tag, AlertCircle, RefreshCw, Flame } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useProducts } from "../hooks/useProducts";
import { Product } from "../types/product.types";
import { Text } from "@/_components/shared";

export function SaleGrid() {
  const { data, isLoading, isError, error, refetch } = useProducts({
    hasDiscount: "true",
    limit: 8,
  });

  const products: Product[] =
    data?.products && data.products.length > 0 ? data.products : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-bgSecondary rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-borderPrimary bg-bgSecondary p-4 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-square bg-bgPrimary rounded-xl" />
              <div className="h-4 bg-bgPrimary rounded w-3/4" />
              <div className="h-3 bg-bgPrimary rounded w-1/2" />
              <div className="h-6 bg-bgPrimary rounded w-1/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl border border-textError/20 bg-textError/5 text-center max-w-lg mx-auto">
        <AlertCircle className="w-7 h-7 text-textError mx-auto mb-2" />
        <Text size="sm" font="bold" color="primary" className="mb-1">
          Failed to load sale products
        </Text>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primaryHover transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Don't render section if no sale products
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-textError/10 text-textError text-[11px] font-bold border border-textError/20">
              <Flame className="w-3 h-3" />
              HOT DEALS
            </span>
          </div>
          <Text
            as="h2"
            size="xl"
            font="black"
            className="flex items-center gap-2 tracking-tight"
          >
            <Tag className="w-5 h-5 text-primary" />
            On Sale
          </Text>
          <Text size="xs" color="secondary" className="mt-0.5">
            Exclusive discounts — limited time only
          </Text>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full border border-textError/20 bg-textError/5 text-textError">
          {products.length} deals
        </span>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </motion.div>
  );
}
