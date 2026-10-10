"use client";

import React from "react";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useProducts } from "../hooks/useProducts";
import { Product, ProductFilters } from "../types/product.types";
import { Text } from "@/_components/shared";

interface ProductGridProps {
  filters?: ProductFilters;
}

export function ProductGrid({ filters }: ProductGridProps) {
  const { data, isLoading, isError, error, refetch } = useProducts(filters);

  const products: Product[] =
    data?.products && data.products.length > 0 ? data.products : [];

  if (isLoading) {
    return (
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
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-2xl border border-textError/20 bg-textError/5 text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-textError mx-auto mb-2" />
        <Text as="h4" size="sm" font="bold" color="primary" className="mb-1">
          Failed to load products
        </Text>
        <Text size="xs" color="secondary" className="mb-4">
          {error instanceof Error
            ? error.message
            : "An error occurred while connecting to server"}
        </Text>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primaryHover transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text
            as="h2"
            size="xl"
            font="black"
            className="flex items-center gap-2"
          >
            <span>Featured Collection</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </Text>
          <Text size="xs" color="secondary" className="mt-0.5">
            Meticulously curated luxury pieces for distinguished tastes
          </Text>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full border border-borderPrimary bg-bgSecondary text-textSecondary">
          {products.length} products
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
