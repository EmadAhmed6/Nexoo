"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { SaleGrid } from "@/features/products/components/SaleGrid";
import { ProductFilters } from "@/features/products/types/product.types";
import {
  PRODUCT_CATEGORIES,
  CATEGORY_ICONS,
} from "@/features/products/types/categories";
import { Sidebar } from "@/_components/shared";

import { useSearchParams } from "next/navigation";

const ALL_TABS = ["All", ...PRODUCT_CATEGORIES] as const;

function HomeContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchQuery(q);
      setDebouncedSearch(q.trim());
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
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full flex flex-col md:flex-row items-start gap-8">
        {/* Desktop Sidebar Aside */}
        <Sidebar
          className="hidden md:block"
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* Main Content Area */}
        <section
          id="products"
          className="flex-1 min-w-0 w-full space-y-12"
        >
        {/* ── Search & Filters Row ─────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-borderPrimary bg-bgSecondary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 placeholder:text-textSecondary/50 transition-all"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Right chips */}
            <div className="flex items-center gap-2 shrink-0">
              {/* In Stock toggle */}
              <button
                onClick={handleInStockToggle}
                className={`relative inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold border transition-all duration-200 ${
                  inStockOnly
                    ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                    : "border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/30"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                In Stock
              </button>

              {/* Clear all (only when something active) */}
              <AnimatePresence>
                {hasActiveFilter && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textError hover:border-textError/40 transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Filter icon — placeholder for future filter drawer */}
              <button className="p-3 rounded-2xl border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/30 transition-all">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Category Pills ───────────────────────────────────────────── */}
          <div className="relative">
            {/* Scrollable pills row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
              {ALL_TABS.map((cat) => {
                const isSelected = selectedCategory === cat;
                const Icon =
                  cat === "All"
                    ? null
                    : CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];

                return (
                  <motion.button
                    key={cat}
                    layout
                    onClick={() => handleCategoryChange(cat)}
                    className={`relative shrink-0 snap-start inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                      isSelected
                        ? "bg-primary text-black border-primary shadow-[0_0_14px_rgba(212,175,55,0.3)] scale-[1.03]"
                        : "border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/30 hover:bg-bgPrimary"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-black" : "text-textSecondary"}`}
                      />
                    )}
                    {cat}
                  </motion.button>
                );
              })}
            </div>

            {/* Fade-out on the right edge */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-bgPrimary to-transparent" />
          </div>

          {/* Active filter summary badge */}
          <AnimatePresence>
            {hasActiveFilter && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 flex-wrap"
              >
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange("All")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bgSecondary border border-borderPrimary text-textSecondary text-xs font-semibold">
                    "{searchQuery.trim()}"
                    <button onClick={() => handleSearchChange("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    In Stock Only
                    <button onClick={handleInStockToggle}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── On Sale Section ──────────────────────────────────────────── */}
        {!hasActiveFilter && <SaleGrid />}

        {/* ── Main Product Grid ────────────────────────────────────────── */}
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
