"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Loader2,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Heart,
  Star,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useWishlist,
  useClearWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/hooks/useWishlist";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useAppStore } from "@/store/use-app-store";
import { Text } from "@/_components/shared/Text";
import { Sidebar } from "@/_components/shared";
import { Product } from "@/features/products/types/product.types";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const { data: wishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAppStore();
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const addToCart = useAddToCart();
  const [addedIds, setAddedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  const products = (wishlist?.products ?? []) as Product[];

  const handleRemove = (productId: string, title: string) => {
    removeFromWishlist.mutate(productId, {
      onSuccess: () => toast.info(`Removed "${title}" from wishlist`),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  const handleClearAll = () => {
    clearWishlist.mutate(undefined, {
      onSuccess: () => toast.info("Wishlist cleared"),
      onError: () => toast.error("Failed to clear wishlist"),
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart.mutate(
      { productId: product._id, productQuantity: 1 },
      {
        onSuccess: () => {
          setAddedIds((prev) => new Set(prev).add(product._id));
          toast.success(`Added "${product.title}" to cart`);
          setTimeout(
            () =>
              setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(product._id);
                return next;
              }),
            2000,
          );
        },
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex gap-8">
      {/* Sidebar */}
      <Sidebar className="hidden lg:block" />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Bookmark className="w-5 h-5 fill-primary" />
              </div>
              <Text as="h1" size="2xl" font="black" className="tracking-tight">
                My Wishlist
              </Text>
            </div>
            <Text size="sm" color="secondary">
              {isLoading
                ? "Loading..."
                : products.length === 0
                  ? "No saved items yet"
                  : `${products.length} saved item${products.length !== 1 ? "s" : ""}`}
            </Text>
          </div>

          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearWishlist.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-textError/30 bg-textError/5 hover:bg-textError/15 text-textError text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {clearWishlist.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              Clear All
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-borderPrimary bg-bgSecondary overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-bgPrimary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-bgPrimary rounded w-3/4" />
                  <div className="h-3 bg-bgPrimary rounded w-1/2" />
                  <div className="h-8 bg-bgPrimary rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-24 px-8 rounded-3xl border border-dashed border-borderPrimary bg-bgSecondary/50"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Bookmark className="w-9 h-9 text-primary" strokeWidth={1.5} />
            </div>
            <Text as="h2" size="xl" font="bold" className="mb-2">
              Your wishlist is empty
            </Text>
            <Text size="sm" color="secondary" className="mb-6 max-w-xs">
              Save products you love by clicking the bookmark icon on any product
              card.
            </Text>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-bold text-sm hover:bg-primaryHover transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Discover Products
            </Link>
          </motion.div>
        )}

        {/* Product Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {products.map((product) => {
                const effectivePrice =
                  product.priceAfterDiscount && product.priceAfterDiscount > 0
                    ? product.priceAfterDiscount
                    : product.price;
                const discountPct =
                  product.priceAfterDiscount &&
                  product.priceAfterDiscount > 0 &&
                  product.priceAfterDiscount < product.price
                    ? Math.round(
                        ((product.price - product.priceAfterDiscount) /
                          product.price) *
                          100,
                      )
                    : 0;
                const imageUrl = product.productImages?.[0]?.url;
                const isAdded = addedIds.has(product._id);
                const isRemoving =
                  removeFromWishlist.isPending &&
                  (removeFromWishlist.variables as string) === product._id;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-3xl border border-borderPrimary bg-bgSecondary overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${product._id}`}
                      className="relative aspect-[4/3] w-full bg-bgPrimary overflow-hidden block"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-textSecondary">
                          <AlertCircle className="w-10 h-10 opacity-30" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
                        {discountPct > 0 && (
                          <span className="px-3 py-1 rounded-full bg-primary text-black font-black text-xs shadow-md">
                            {discountPct}% OFF
                          </span>
                        )}
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-textError/90 text-white font-bold text-[11px] shadow-sm">
                            Only {product.stock} left
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-textError/90 text-white font-bold text-[11px] shadow-sm">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/70 text-white backdrop-blur-md pointer-events-none">
                        {product.category}
                      </span>
                    </Link>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        {/* Rating & Likes */}
                        <div className="flex items-center justify-between mb-2 text-xs text-textSecondary">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                            <span className="font-bold text-primary text-xs">
                              {product.ratingAverage || "—"}
                            </span>
                            <span className="text-[11px]">
                              ({product.ratingQuantity || 0} reviews)
                            </span>
                          </div>
                          {(product.likesCount ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
                              <Heart className="w-3 h-3 fill-rose-500" />
                              <span>{product.likesCount}</span>
                            </div>
                          )}
                        </div>

                        <Link href={`/products/${product._id}`}>
                          <h3 className="text-sm font-extrabold text-textPrimary hover:text-primary transition-colors line-clamp-1 mb-1 tracking-tight">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Price & Actions */}
                      <div className="pt-3.5 border-t border-borderPrimary flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-primary">
                              {effectivePrice} EGP
                            </span>
                            {product.priceAfterDiscount &&
                              product.priceAfterDiscount < product.price && (
                                <span className="text-xs text-textSecondary line-through">
                                  {product.price} EGP
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Remove from wishlist */}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(product._id, product.title)
                            }
                            disabled={isRemoving}
                            className="p-2 rounded-xl border border-textError/30 bg-textError/5 hover:bg-textError/15 text-textError transition-all cursor-pointer disabled:opacity-50"
                            title="Remove from wishlist"
                            aria-label="Remove from wishlist"
                          >
                            {isRemoving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Add to cart */}
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={
                              product.stock === 0 || addToCart.isPending
                            }
                            className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                              isAdded
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-bgPrimary border-borderPrimary hover:border-primary text-textPrimary hover:text-primary hover:bg-primary/10"
                            }`}
                            title={
                              product.stock === 0
                                ? "Out of Stock"
                                : "Add to cart"
                            }
                            aria-label="Add to cart"
                          >
                            {isAdded ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
