"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Zap, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { SaleGrid } from "@/features/products/components/SaleGrid";
import { ProductFilters } from "@/features/products/types/product.types";
import {
  PRODUCT_CATEGORIES,
  CATEGORY_ICONS,
} from "@/features/products/types/categories";
import { HeroSection, MultiPanelBanner } from "@/_components/shared";

import { useSearchParams, useRouter } from "next/navigation";

const ALL_TABS = ["All", ...PRODUCT_CATEGORIES] as const;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "All";

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Sync from URL params
  useEffect(() => {
    const q = searchParams.get("search");
    const cat = searchParams.get("category");
    if (q !== null) {
      setSearchQuery(q);
      setDebouncedSearch(q.trim());
      setPage(1);
    }
    if (cat !== null) {
      setSelectedCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters: ProductFilters = {
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
    inStock: inStockOnly ? "true" : undefined,
    page,
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleInStockToggle = () => {
    setInStockOnly((prev) => !prev);
    setPage(1);
  };

  const hasActiveFilter =
    selectedCategory !== "All" || debouncedSearch.length > 0 || inStockOnly;

  const clearAll = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setDebouncedSearch("");
    setInStockOnly(false);
    setPage(1);
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 w-full flex-1 space-y-10">
        {/* ── Hero Section & Multi-Panel Banner ──────────────────────── */}
        {!hasActiveFilter && (
          <div className="space-y-8 sm:space-y-10">
            <HeroSection />
            <MultiPanelBanner />
          </div>
        )}

        <section id="products" className="space-y-6">
          {/* Active filter summary badges (controlled via top Navbar search & categories) */}
          <AnimatePresence>
            {hasActiveFilter && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between gap-4 py-2.5 px-4 rounded-2xl bg-bgSecondary/60 border border-borderPrimary"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-textSecondary font-semibold">
                    Filtered by:
                  </span>
                  {selectedCategory !== "All" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
                      {selectedCategory}
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          const newUrl = searchQuery.trim()
                            ? `/?search=${encodeURIComponent(searchQuery.trim())}#products`
                            : "/#products";
                          router.push(newUrl);
                        }}
                        className="hover:opacity-75 transition-opacity"
                        aria-label="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bgPrimary border border-borderPrimary text-textPrimary text-xs font-semibold">
                      "{debouncedSearch}"
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setDebouncedSearch("");
                          const newUrl =
                            selectedCategory !== "All"
                              ? `/?category=${encodeURIComponent(selectedCategory)}#products`
                              : "/#products";
                          router.push(newUrl);
                        }}
                        className="hover:opacity-75 transition-opacity"
                        aria-label="Remove search filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={clearAll}
                  className="text-xs text-textSecondary hover:text-textError transition-colors font-medium underline shrink-0"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── On Sale Section ──────────────────────────────────────── */}
          {!hasActiveFilter && <SaleGrid />}

          {/* ── Main Product Grid ─────────────────────────────────────── */}
          <ProductGrid filters={filters} onPageChange={setPage} />
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </React.Suspense>
  );
}
