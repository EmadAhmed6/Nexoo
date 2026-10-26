"use client";

import React from "react";
import { AlertCircle, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useProducts } from "../hooks/useProducts";
import { Product, ProductFilters } from "../types/product.types";
import { Text } from "@/_components/shared";
import { useTranslations } from "next-intl";

interface ProductGridProps {
  filters?: ProductFilters;
  onPageChange?: (page: number) => void;
}

export function ProductGrid({ filters, onPageChange }: ProductGridProps) {
  const t = useTranslations("home");
  const { data, isLoading, isError, error, refetch } = useProducts(filters);

  const products: Product[] =
    data?.products && data.products.length > 0 ? data.products : [];

  const currentPage = data?.currentPage || filters?.page || 1;
  const totalPages = data?.totalPages || 1;
  const totalProducts = data?.totalProducts || products.length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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
          {t("failedLoadProducts")}
        </Text>
        <Text size="xs" color="secondary" className="mb-4">
          {error instanceof Error
            ? error.message
            : t("failedLoadProducts")}
        </Text>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white dark:text-black text-xs font-bold hover:bg-primaryHover transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t("retry")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text
            as="h2"
            size="xl"
            font="black"
            className="flex items-center gap-2"
          >
            <span>{t("featuredCollection")}</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </Text>
          <Text size="xs" color="secondary" className="mt-0.5">
            {t("featuredSubtitle")}
          </Text>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full border border-borderPrimary bg-bgSecondary text-textSecondary">
          {t("productsCount", { count: totalProducts })}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-borderPrimary rounded-3xl p-8">
          <Text font="bold" size="lg" className="mb-1">
            {t("noProductsFound")}
          </Text>
          <Text size="xs" color="secondary">
            {t("noProductsSubtitle")}
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-borderPrimary">
          <Text size="xs" color="secondary">
            {t("showingPage")} <span className="font-bold text-textPrimary">{currentPage}</span> {t("ofPages")}{" "}
            <span className="font-bold text-textPrimary">{totalPages}</span> ({totalProducts} {t("totalCount")})
          </Text>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label={t("previousPage")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-white dark:text-black shadow-md scale-105"
                      : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/40"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label={t("nextPage")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
