"use client";

import React, { useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Loader2,
  Heart,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleLikeProduct,
} from "@/features/products/hooks/useProducts";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useToggleWishlist, useIsInWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAppStore } from "@/store/use-app-store";
import { Button, Text } from "@/_components/shared";
import { EditProductModal } from "@/features/products/components/EditProductModal";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import { ProductReviewsSection } from "@/features/reviews/components/ProductReviewsSection";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, isError, error } = useProduct(productId);
  const addToCart = useAddToCart();
  const { user } = useAppStore();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct(productId);
  const toggleLike = useToggleLikeProduct();
  const inWishlist = useIsInWishlist(productId);
  const { toggleWishlist, isPending: isWishlistPending } = useToggleWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const directEditIndexRef = useRef<number | null>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = Boolean(
    user &&
      product &&
      (!product.userId ||
        product.userId === user._id ||
        user.role === "Admin" ||
        user.role === "SuperAdmin"),
  );

  const handleDelete = () => {
    deleteProduct(productId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        toast.success("Product deleted");
        router.push("/");
      },
      onError: () => {
        toast.error("Failed to delete product");
      },
    });
  };

  const handleTriggerImageEdit = (idx: number) => {
    directEditIndexRef.current = idx;
    if (directFileInputRef.current) {
      directFileInputRef.current.value = "";
      directFileInputRef.current.click();
    }
  };

  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = directEditIndexRef.current;
    if (!file || targetIdx === null || !product) return;

    setUploadingImageIndex(targetIdx);

    const formData = new FormData();
    formData.append("title", product.title);
    formData.append("description", product.description);
    formData.append("price", String(product.price));
    if (product.priceAfterDiscount && product.priceAfterDiscount > 0) {
      formData.append("priceAfterDiscount", String(product.priceAfterDiscount));
    }
    if (product.stock !== undefined) {
      formData.append("stock", String(product.stock));
    }
    formData.append("category", product.category);

    // Keep all existing images except the one being replaced
    const keptImages = (product.productImages || [])
      .filter((_, i) => i !== targetIdx)
      .map((img) => ({
        url: img.url,
        publicId: img.publicId,
      }));

    formData.append("existingImages", JSON.stringify(keptImages));
    formData.append("productImages", file);

    updateProduct(formData, {
      onSuccess: () => {
        toast.success("Image updated");
        setUploadingImageIndex(null);
        directEditIndexRef.current = null;
        if (directFileInputRef.current) {
          directFileInputRef.current.value = "";
        }
      },
      onError: () => {
        toast.error("Failed to update image");
        setUploadingImageIndex(null);
        directEditIndexRef.current = null;
        if (directFileInputRef.current) {
          directFileInputRef.current.value = "";
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse">
        <div className="h-6 w-32 bg-bgSecondary rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="w-full aspect-square bg-bgSecondary rounded-3xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-bgSecondary rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-bgSecondary rounded w-3/4" />
            <div className="h-6 bg-bgSecondary rounded w-1/4" />
            <div className="h-24 bg-bgSecondary rounded w-full" />
            <div className="h-12 bg-bgSecondary rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center border border-borderPrimary bg-bgSecondary rounded-3xl">
        <AlertCircle className="w-12 h-12 text-textError mx-auto mb-3" />
        <Text as="h2" size="xl" font="bold" className="mb-2">
          Product Not Found
        </Text>
        <Text size="sm" color="secondary" className="mb-6">
          {error instanceof Error
            ? error.message
            : "The requested product does not exist or has been removed."}
        </Text>
        <Button
          variant="primary"
          onClick={() => router.push("/")}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Store
        </Button>
      </div>
    );
  }

  const images =
    product.productImages && product.productImages.length > 0
      ? product.productImages
      : [
          {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
            publicId: "fallback",
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];

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

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/auth/login");
      return;
    }

    addToCart.mutate(
      { productId: product._id, productQuantity: quantity },
      {
        onSuccess: () => {
          setAdded(true);
          toast.success("Added to cart");
          setTimeout(() => setAdded(false), 2000);
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      },
    );
  };

  const isLiked = Boolean(
    user?._id &&
      product?.likes?.some(
        (id) =>
          (typeof id === "string" ? id : (id as { _id?: string })._id || id) ===
          user._id,
      ),
  );
  const likesCount = product?.likesCount ?? product?.likes?.length ?? 0;

  const handleToggleLike = () => {
    if (!user) {
      toast.error("Please sign in to like products");
      router.push("/auth/login");
      return;
    }
    toggleLike.mutate(productId, {
      onSuccess: () => {
        if (!isLiked) {
          toast.success("Added to liked products ❤️");
        } else {
          toast.info("Removed from liked products");
        }
      },
      onError: (err) => {
        toast.error((err as Error)?.message || "Failed to update like");
      },
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product._id, product.title);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Navigation Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span className="text-textSecondary/40 text-xs">/</span>
        <span className="text-xs text-textSecondary">{product.category}</span>
        <span className="text-textSecondary/40 text-xs">/</span>
        <span className="text-xs text-textPrimary font-medium truncate max-w-50">
          {product.title}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
        {/* Left Column: Interactive Image Gallery (Sticky/Fixed on scroll) */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start w-full lg:sticky lg:top-24 self-start">
          {/* Hidden File Input for direct image editing */}
          <input
            ref={directFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectImageUpload}
            className="hidden"
          />

          {/* Vertical Thumbnails List */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto w-full sm:w-14 sm:max-h-130 pb-1 sm:pb-0 scrollbar-none flex-shrink-0">
              {images.map((img, idx) => {
                const isSelected = selectedImageIndex === idx;
                const isUploading = uploadingImageIndex === idx;

                return (
                  <div
                    key={img.publicId || idx}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`group/thumb relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-bgSecondary cursor-pointer ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 shadow-sm"
                        : "border-borderPrimary opacity-60 hover:opacity-100 hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />

                    {/* Loading Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}

                    {/* Owner Edit Button on Thumbnail */}
                    {isOwner && !isUploading && (
                      <button
                        type="button"
                        title={`Edit image #${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerImageEdit(idx);
                        }}
                        disabled={uploadingImageIndex !== null}
                        className="absolute top-0.5 right-0.5 z-20 p-1 rounded-md bg-black/85 hover:bg-primary hover:text-black text-white shadow-sm backdrop-blur-md opacity-85 sm:opacity-0 group-hover/thumb:opacity-100 cursor-pointer disabled:opacity-50"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Large Display Image */}
          <div className="relative aspect-square flex-1 w-full rounded-3xl border border-borderPrimary bg-bgSecondary overflow-hidden shadow-sm group">
            <div className="relative w-full h-full">
              <Image
                src={currentImage.url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Loading Overlay on Main Image */}
            {uploadingImageIndex === selectedImageIndex && (
              <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-bold text-white">Updating image...</span>
              </div>
            )}

            {/* Owner Edit Current Image Button */}
            {isOwner && uploadingImageIndex === null && (
              <button
                type="button"
                title="Edit this image"
                onClick={() => handleTriggerImageEdit(selectedImageIndex)}
                className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-primary hover:text-black text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Image</span>
              </button>
            )}

            {/* Badges on Main Image (Fit-content, no minus sign) */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
              {discountPercentage > 0 && (
                <span className="w-fit inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary text-black font-black text-xs shadow-md">
                  {discountPercentage}% OFF
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="w-fit inline-flex items-center justify-center px-3 py-1 rounded-full bg-textError/90 text-white font-medium text-xs shadow-sm">
                  Only {product.stock} left in stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col space-y-6">
          {/* Category & Rating */}
          <div>
            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold mb-3">
              {product.category}
            </span>

            <Text
              as="h1"
              size="3xl"
              font="black"
              className="tracking-tight text-textPrimary leading-snug"
            >
              {product.title}
            </Text>

            <div className="flex items-center gap-2 mt-3 text-xs text-textSecondary">
              <a
                href="#reviews"
                className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
              >
                <Star className="w-4 h-4 fill-primary" />
                <span className="font-bold text-textPrimary text-sm">
                  {product.ratingAverage ?? (product as unknown as { ratings?: number }).ratings ?? 0}
                </span>
              </a>
              <span>•</span>
              <a
                href="#reviews"
                className="hover:underline hover:text-primary transition-colors cursor-pointer"
              >
                {product.ratingQuantity || 0} reviews
              </a>
              <span>•</span>
              <span
                className={
                  product.stock > 0
                    ? "text-emerald-500 font-semibold"
                    : "text-textError font-semibold"
                }
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} units)`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-5 rounded-2xl border border-borderPrimary bg-bgSecondary flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <Text as="span" size="3xl" font="black" color="accent">
                  {effectivePrice} EGP
                </Text>
                {product.priceAfterDiscount &&
                  product.priceAfterDiscount > 0 &&
                  product.priceAfterDiscount < product.price && (
                    <Text
                      as="span"
                      size="lg"
                      color="secondary"
                      className="line-through"
                    >
                      {product.price} EGP
                    </Text>
                  )}
              </div>
              <Text size="xs" color="secondary" className="mt-1">
                Prices include all applicable import fees and taxes.
              </Text>
            </div>

            {discountPercentage > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="w-fit inline-flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-400/20">
                  {discountPercentage}% OFF
                </span>
                <span className="text-[11px] text-textSecondary font-semibold">
                  Save{" "}
                  {(product.price - product.priceAfterDiscount!).toFixed(0)} EGP
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Text font="bold" size="sm" className="mb-2">
              Description & Specifications
            </Text>
            <Text size="sm" color="secondary" className="leading-relaxed">
              {product.description}
            </Text>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-borderPrimary">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-textPrimary2">
                Quantity:
              </span>
              <div className="flex items-center border border-borderPrimary rounded-xl bg-bgSecondary">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-textSecondary hover:text-textPrimary transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-textPrimary">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="p-2.5 text-textSecondary hover:text-textPrimary transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                leftIcon={
                  added ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )
                }
                className={
                  added
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-600"
                    : ""
                }
              >
                {added ? "Added to Cart!" : "Add to Cart"}
              </Button>

              {/* Like Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={toggleLike.isPending}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  isLiked
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-500 hover:bg-rose-500/25"
                    : "bg-bgSecondary border-borderPrimary text-textSecondary hover:text-rose-500 hover:border-rose-500/40"
                }`}
                title={isLiked ? "Unlike product" : "Like product"}
                aria-label="Like product"
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${
                    isLiked ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                {likesCount > 0 && (
                  <span className="text-xs font-bold">{likesCount}</span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isWishlistPending}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  inWishlist
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-bgSecondary border-borderPrimary text-textSecondary hover:text-primary hover:border-primary/40"
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {isWishlistPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Bookmark
                    className={`w-5 h-5 transition-transform ${
                      inWishlist ? "fill-primary text-primary" : ""
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2 pt-2 border-t border-borderPrimary">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/60 hover:text-primary text-textSecondary text-xs font-bold transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Product
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-textError/30 bg-textError/5 hover:bg-textError/15 text-textError text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>
              </div>
            )}
          </div>

          {/* Luxury Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-borderPrimary">
            <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-textPrimary">
                  Fast Shipping
                </p>
                <p className="text-[10px] text-textSecondary">
                  Within 24-48 hours
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-textPrimary">
                  100% Authentic
                </p>
                <p className="text-[10px] text-textSecondary">
                  Original certified
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-textPrimary">
                  Easy Returns
                </p>
                <p className="text-[10px] text-textSecondary">14 days policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews & Ratings Section */}
      <ProductReviewsSection
        productId={productId}
        ratingAverage={product.ratingAverage ?? (product as unknown as { ratings?: number }).ratings ?? 0}
        ratingQuantity={product.ratingQuantity ?? 0}
      />

      {/* Edit Product Modal */}
      {isOwner && editModalOpen && (
        <EditProductModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={product}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        productTitle={product.title}
      />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse">
          <div className="h-6 w-32 bg-bgSecondary rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="w-full aspect-square bg-bgSecondary rounded-3xl" />
            <div className="space-y-6">
              <div className="h-8 bg-bgSecondary rounded w-3/4" />
              <div className="h-6 bg-bgSecondary rounded w-1/4" />
              <div className="h-24 bg-bgSecondary rounded w-full" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
