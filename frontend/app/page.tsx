"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { SaleGrid } from "@/features/products/components/SaleGrid";
import { ProductFilters } from "@/features/products/types/product.types";
const CATEGORIES = [
  "All",
  "Watches & Accessories",
  "Luxury Fragrances",
  "Eyewear",
  "Leather Goods",
  "Clothing",
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Compute active filters (no discount filter — sale products have their own section)
  const filters: ProductFilters = {
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: searchQuery.trim() || undefined,
    inStock: inStockOnly ? "true" : undefined,
  };

  // Are any filters active (besides default)?
  const hasActiveFilter =
    selectedCategory !== "All" || searchQuery.trim().length > 0 || inStockOnly;

  return (
    <div className="flex-1 flex flex-col">
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-14"
      >
        {/* Filter controls toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input
                type="text"
                placeholder="Search products by title, category, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-ringPrimary placeholder:text-textSecondary/60 transition-all"
              />
            </div>

            {/* Quick Toggle Badges */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  inStockOnly
                    ? "bg-primary text-black border-primary"
                    : "border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
                }`}
              >
                In Stock Only
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-primary text-black font-bold shadow-sm"
                      : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* On Sale Section — only show when no active search/filter */}
        {!hasActiveFilter && <SaleGrid />}

        {/* Main Product Grid */}
        <ProductGrid filters={filters} />
      </section>
    </div>
  );
}
