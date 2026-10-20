"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  Tag,
  ArrowRight,
  Package,
  CornerDownLeft,
} from "lucide-react";
import { useProductSuggestions } from "../hooks/useProducts";
import { CATEGORY_ICONS, ProductCategory } from "../types/categories";
import { Product } from "../types/product.types";

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isMobile?: boolean;
  onSelectResult?: () => void;
  defaultValue?: string;
}

export function SearchAutocomplete({
  placeholder = "Search for products, brands and categories…",
  className = "",
  inputClassName = "",
  isMobile = false,
  onSelectResult,
  defaultValue = "",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [debouncedTerm, setDebouncedTerm] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Debounce search query to prevent spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync if defaultValue changes (e.g. from URL)
  useEffect(() => {
    if (defaultValue && defaultValue !== searchTerm) {
      setSearchTerm(defaultValue);
      setDebouncedTerm(defaultValue.trim());
    }
  }, [defaultValue]);

  // Fetch suggestions
  const { data, isLoading, isFetching } = useProductSuggestions(debouncedTerm);

  const products = data?.products || [];
  const categories = data?.categories || [];
  const hasResults = products.length > 0 || categories.length > 0;
  const isQueryActive = debouncedTerm.length >= 1;
  const isBusy = isLoading || isFetching;

  // Build flattened list of items for keyboard navigation:
  // 1. Categories
  // 2. Products
  // 3. "Search all for '{searchTerm}'" action (if query active)
  type SuggestionItem =
    | { type: "category"; value: string }
    | { type: "product"; value: Product }
    | { type: "search_all"; value: string };

  const suggestionItems: SuggestionItem[] = [
    ...categories.map((cat): SuggestionItem => ({ type: "category", value: cat })),
    ...products.map((prod): SuggestionItem => ({ type: "product", value: prod })),
    ...(isQueryActive
      ? [{ type: "search_all" as const, value: debouncedTerm }]
      : []),
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedTerm]);

  const handleSelectCategory = (cat: string) => {
    setIsOpen(false);
    onSelectResult?.();
    router.push(`/?category=${encodeURIComponent(cat)}#products`);
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    onSelectResult?.();
    router.push(`/products/${productId}`);
  };

  const handleFullSearch = (query: string) => {
    const trimmed = query.trim();
    setIsOpen(false);
    onSelectResult?.();
    if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}#products`);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestionItems.length) {
      const selectedItem = suggestionItems[selectedIndex];
      if (selectedItem.type === "category") {
        handleSelectCategory(selectedItem.value);
        return;
      }
      if (selectedItem.type === "product") {
        handleSelectProduct(selectedItem.value._id);
        return;
      }
      if (selectedItem.type === "search_all") {
        handleFullSearch(searchTerm);
        return;
      }
    }
    handleFullSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestionItems.length === 0) {
      if (e.key === "ArrowDown" && searchTerm.trim().length >= 1) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestionItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestionItems.length - 1
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center relative group w-full">
        <Search
          className={`absolute ${
            isMobile ? "left-3.5 w-4 h-4" : "left-4 w-4 h-4"
          } text-textSecondary pointer-events-none group-focus-within:text-primary transition-colors z-10`}
        />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim().length >= 1) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className={
            inputClassName ||
            (isMobile
              ? "w-full pl-10 pr-24 py-2.5 rounded-2xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 placeholder:text-textSecondary/50 transition-all shadow-inner"
              : "w-full pl-11 pr-24 py-2.5 rounded-2xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 placeholder:text-textSecondary/50 transition-all shadow-inner")
          }
        />

        {/* Input Right Controls */}
        <div className="absolute right-2 flex items-center gap-1.5 z-10">
          {/* Loading Spinner */}
          {isBusy && (
            <div className="p-1 text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          )}

          {/* Clear Button */}
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-1 text-textSecondary hover:text-textPrimary rounded-full hover:bg-bgSecondary/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={
              isMobile
                ? "px-3 py-1 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primaryHover transition-colors shadow-sm"
                : "px-3.5 py-1.5 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primaryHover transition-colors shadow-sm"
            }
          >
            {isMobile ? "Go" : "Search"}
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown Modal */}
      <AnimatePresence>
        {isOpen && isQueryActive && (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-borderPrimary bg-bgSecondary/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[460px] flex flex-col"
          >
            <div className="overflow-y-auto flex-1 p-2.5 space-y-3.5 divide-y divide-borderPrimary/40">
              {/* Category Suggestions Section */}
              {categories.length > 0 && (
                <div className="space-y-1.5 pt-1 first:pt-0">
                  <div className="flex items-center gap-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-textSecondary">
                    <Tag className="w-3 h-3 text-primary" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1 pt-1">
                    {categories.map((category, catIdx) => {
                      const Icon =
                        CATEGORY_ICONS[category as ProductCategory] || Tag;
                      const isItemActive = selectedIndex === catIdx;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleSelectCategory(category)}
                          onMouseEnter={() => setSelectedIndex(catIdx)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isItemActive
                              ? "bg-primary text-black border-primary font-semibold shadow-sm"
                              : "bg-bgPrimary/70 hover:bg-primary/15 text-textPrimary hover:text-primary border-borderPrimary hover:border-primary/40"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Suggestions Section */}
              {products.length > 0 && (
                <div className="space-y-1 pt-2.5">
                  <div className="flex items-center justify-between px-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-textSecondary">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-primary" />
                      <span>Products</span>
                    </div>
                    <span className="text-[10px] font-normal text-textSecondary/70">
                      {products.length} found
                    </span>
                  </div>

                  <div className="space-y-1">
                    {products.map((product, prodIdx) => {
                      const globalIndex = categories.length + prodIdx;
                      const isItemActive = selectedIndex === globalIndex;
                      const image = product.productImages?.[0]?.url;
                      const hasImageError = imageErrors[product._id];
                      const effectivePrice =
                        product.priceAfterDiscount &&
                        product.priceAfterDiscount > 0
                          ? product.priceAfterDiscount
                          : product.price;
                      const hasDiscount =
                        Boolean(product.priceAfterDiscount) &&
                        product.priceAfterDiscount! > 0 &&
                        product.priceAfterDiscount! < product.price;

                      return (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSelectProduct(product._id)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                            isItemActive
                              ? "bg-primary/15 border border-primary/40 shadow-sm"
                              : "hover:bg-bgPrimary/60 border border-transparent"
                          }`}
                        >
                          {/* Product Image Thumbnail */}
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-bgPrimary border border-borderPrimary shrink-0 flex items-center justify-center">
                            {image && !hasImageError ? (
                              <Image
                                src={image}
                                alt={product.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                                onError={() =>
                                  setImageErrors((prev) => ({
                                    ...prev,
                                    [product._id]: true,
                                  }))
                                }
                              />
                            ) : (
                              <Package className="w-5 h-5 text-textSecondary/40" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs sm:text-sm font-semibold text-textPrimary truncate">
                                {product.title}
                              </p>
                              {product.category && (
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-bgPrimary border border-borderPrimary text-textSecondary shrink-0">
                                  {product.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Price */}
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs sm:text-sm font-bold text-primary">
                                  ${effectivePrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[11px] text-textSecondary line-through">
                                    ${product.price.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Stock status indicator */}
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                  product.stock > 0
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-rose-400 bg-rose-500/10"
                                }`}
                              >
                                {product.stock > 0 ? "In Stock" : "Out of stock"}
                              </span>
                            </div>
                          </div>

                          {/* Arrow indicator */}
                          <div
                            className={`shrink-0 transition-transform ${
                              isItemActive
                                ? "translate-x-0 opacity-100 text-primary"
                                : "-translate-x-1 opacity-0 text-textSecondary"
                            }`}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results Fallback */}
              {!isBusy && !hasResults && (
                <div className="py-6 px-4 text-center space-y-2">
                  <p className="text-sm font-medium text-textPrimary">
                    No results found for &ldquo;{debouncedTerm}&rdquo;
                  </p>
                  <p className="text-xs text-textSecondary max-w-xs mx-auto">
                    Try checking your spelling or search using another keyword or category name.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-2 border-t border-borderPrimary bg-bgPrimary/60 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleFullSearch(searchTerm)}
                onMouseEnter={() =>
                  setSelectedIndex(
                    suggestionItems.findIndex((it) => it.type === "search_all")
                  )
                }
                className={`flex-1 flex items-center justify-between py-2 px-3 rounded-xl transition-all ${
                  selectedIndex ===
                  suggestionItems.findIndex((it) => it.type === "search_all")
                    ? "bg-primary text-black font-semibold shadow-sm"
                    : "text-textPrimary hover:bg-bgSecondary hover:text-primary"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Search className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>
                    Search all products for &ldquo;
                    <span className="font-bold underline underline-offset-2">
                      {searchTerm.trim()}
                    </span>
                    &rdquo;
                  </span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] opacity-75 font-normal">
                  <span>Press</span>
                  <CornerDownLeft className="w-3 h-3" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
