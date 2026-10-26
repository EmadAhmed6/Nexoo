"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  X,
  DollarSign,
  Package,
  ImagePlus,
  Trash2,
  Pencil,
  RefreshCw,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Input } from "@/_components/shared/Input";
import { Text } from "@/_components/shared/Text";
import { Button } from "@/_components/shared/Button";
import { useUpdateProduct } from "@/features/products/hooks/useProducts";
import { Product } from "@/features/products/types/product.types";
import { PRODUCT_CATEGORIES } from "@/features/products/types/categories";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  stock?: number;
  category: string;
}

interface ImageSlot {
  id: string;
  source: "existing" | "new";
  url: string;
  file?: File;
  publicId?: string;
}

const CATEGORY_OPTIONS = [...PRODUCT_CATEGORIES];

export function EditProductModal({
  isOpen,
  onClose,
  product,
}: EditProductModalProps) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tCat = useTranslations("categories");
  const [images, setImages] = useState<ImageSlot[]>([]);
  const replacingIndexRef = useRef<number | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateProduct, isPending } = useUpdateProduct(product._id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      priceAfterDiscount: product.priceAfterDiscount,
      stock: product.stock,
      category: product.category,
    },
  });

  // Reset form & images when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: product.title,
        description: product.description,
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount,
        stock: product.stock,
        category: product.category,
      });

      if (product.productImages && product.productImages.length > 0) {
        setImages(
          product.productImages.map((img, idx) => ({
            id: img.publicId || `existing-${idx}`,
            source: "existing",
            url: img.url,
            publicId: img.publicId || "default",
          })),
        );
      } else {
        setImages([]);
      }
    }
  }, [product, reset, isOpen]);

  // Handle replacing a specific image slot
  const handleReplaceClick = (index: number) => {
    replacingIndexRef.current = index;
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = "";
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = replacingIndexRef.current;
    if (!file || targetIdx === null) return;

    const previewUrl = URL.createObjectURL(file);
    setImages((prev) =>
      prev.map((item, idx) => {
        if (idx === targetIdx) {
          if (item.source === "new") {
            URL.revokeObjectURL(item.url);
          }
          return {
            id: `new-${Date.now()}-${idx}`,
            source: "new",
            url: previewUrl,
            file,
          };
        }
        return item;
      }),
    );
    replacingIndexRef.current = null;
  };

  // Handle deleting an image slot
  const handleDeleteImage = (index: number) => {
    if (images.length <= 1) {
      toast.error(t("atLeastOneImage"));
      return;
    }

    setImages((prev) => {
      const target = prev[index];
      if (target?.source === "new") {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  // Handle adding new image(s) up to 5 total
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const availableSlots = 5 - images.length;

    if (availableSlots <= 0) {
      toast.error(t("maxImagesError"));
      return;
    }

    const filesToAdd = selectedFiles.slice(0, availableSlots);
    if (selectedFiles.length > availableSlots) {
      toast.info(t("imagesAddedOfMaximum", { count: availableSlots }));
    }

    const newSlots: ImageSlot[] = filesToAdd.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      source: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newSlots]);
    if (addFileInputRef.current) {
      addFileInputRef.current.value = "";
    }
  };

  const handleModalClose = () => {
    // Revoke any created blob URLs
    images.forEach((img) => {
      if (img.source === "new") {
        URL.revokeObjectURL(img.url);
      }
    });
    onClose();
  };

  const onSubmit = (data: ProductFormData) => {
    const currentImages: ImageSlot[] =
      images.length > 0
        ? images
        : (product.productImages || []).map((img, idx) => ({
            id: img.publicId || `existing-${idx}`,
            source: "existing" as const,
            url: img.url,
            publicId: img.publicId || "default",
          }));

    if (currentImages.length === 0) {
      toast.error(t("keepOneImage"));
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    if (
      data.priceAfterDiscount !== undefined &&
      !isNaN(Number(data.priceAfterDiscount)) &&
      Number(data.priceAfterDiscount) > 0
    ) {
      formData.append("priceAfterDiscount", String(data.priceAfterDiscount));
    }
    if (data.stock !== undefined) {
      formData.append("stock", String(data.stock));
    }
    formData.append("category", data.category);

    // Filter kept existing images and send as JSON
    const keptExistingImages = currentImages
      .filter((img) => img.source === "existing")
      .map((img) => ({
        url: img.url,
        publicId: img.publicId || "default",
      }));

    formData.append("existingImages", JSON.stringify(keptExistingImages));

    // Append newly uploaded or replaced files
    const newFiles = currentImages
      .filter((img) => img.source === "new" && img.file)
      .map((img) => img.file as File);

    newFiles.forEach((file) => {
      formData.append("productImages", file);
    });

    updateProduct(formData, {
      onSuccess: () => {
        toast.success(t("productUpdatedSuccess"), {
          description: t("productUpdatedDescription", { title: data.title }),
        });
        handleModalClose();
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : tCommon("tryAgain");
        toast.error(t("productUpdateFailed"), { description: message });
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="edit-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            key="edit-modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative z-10 w-full max-w-2xl bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-borderPrimary mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    <Text
                      as="h2"
                      size="2xl"
                      font="black"
                      className="tracking-tight"
                    >
                      {t("editProductHeading")}
                    </Text>
                  </div>
                  <Text size="xs" color="secondary" className="mt-1">
                    {t("updatingProduct")}{" "}
                    <span className="text-primary font-semibold">
                      {product.title}
                    </span>
                  </Text>
                </div>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Product Title */}
                <div>
                  <Input
                    label={`${t("product")} *`}
                    placeholder={t("productNameExample")}
                    error={errors.title?.message}
                    {...register("title", {
                      required: t("productTitleRequired"),
                      minLength: { value: 4, message: t("minFourCharacters") },
                      maxLength: { value: 100, message: t("maxHundredCharacters") },
                    })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-textPrimary2 mb-1.5">
                    {t("description")} *
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t("descriptionPlaceholder")}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary placeholder:text-textSecondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ringPrimary transition-all resize-none"
                    {...register("description", {
                      required: t("descriptionRequired"),
                      minLength: { value: 10, message: t("minTenCharacters") },
                      maxLength: {
                        value: 1000,
                        message: t("maxThousandCharacters"),
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-textError">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Price, Price After Discount & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label={`${t("originalPriceEgp")} *`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    icon={<DollarSign className="w-4 h-4 text-textSecondary" />}
                    error={errors.price?.message}
                    {...register("price", {
                      required: t("priceRequired"),
                      valueAsNumber: true,
                      min: {
                        value: 0.01,
                        message: t("positivePrice"),
                      },
                    })}
                  />

                  <Input
                    label={t("optionalDiscountPrice")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                    error={errors.priceAfterDiscount?.message}
                    {...register("priceAfterDiscount", {
                      valueAsNumber: true,
                      validate: (val, formVals) => {
                        if (!val) return true;
                        if (val >= formVals.price) {
                          return t("discountLessThanPrice");
                        }
                        return true;
                      },
                    })}
                  />

                  <Input
                    label={`${t("stockQuantity")} *`}
                    type="number"
                    placeholder="0"
                    icon={<Package className="w-4 h-4 text-textSecondary" />}
                    error={errors.stock?.message}
                    {...register("stock", {
                      required: t("stockRequired"),
                      valueAsNumber: true,
                      min: { value: 0, message: t("nonNegative") },
                    })}
                  />
                </div>

                {/* Category Selection */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-textPrimary2 mb-1.5">
                    {t("categoryRequired")}
                  </label>
                  <select
                    className="w-full py-2.5 px-3.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-ringPrimary transition-all cursor-pointer"
                    {...register("category", {
                      required: t("categoryRequiredError"),
                    })}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {tCat.has(cat.toLowerCase() as any) ? tCat(cat.toLowerCase() as any) : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Product Images Manager (Optional editing) */}
                <div className="pt-2 border-t border-borderPrimary">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-xs font-bold text-textPrimary">
                        {t("productImagesCount", { count: images.length })}
                      </label>
                      <p className="text-[11px] text-textSecondary">
                        {t("editingImagesOptional")}
                      </p>
                    </div>
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t("addImage")}
                      </button>
                    )}
                  </div>

                  {/* Hidden inputs for file actions */}
                  <input
                    ref={replaceFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReplaceFileChange}
                    className="hidden"
                  />
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddFiles}
                    className="hidden"
                  />

                  {/* Image Grid (Up to 5 images) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative group rounded-2xl overflow-hidden border border-borderPrimary bg-bgPrimary aspect-square flex flex-col justify-between"
                      >
                        {/* Image Preview */}
                        <Image
                          src={img.url}
                          alt={`Product image ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top Badges */}
                        <div className="relative z-10 flex items-center justify-between p-1.5 w-full">
                          <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white shadow">
                            {idx === 0 ? t("cover") : `#${idx + 1}`}
                          </span>
                          {img.source === "new" && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-extrabold shadow">
                              {t("new")}
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay with Action Buttons */}
                        <div className="relative z-10 p-1.5 w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Replace Button */}
                          <button
                            type="button"
                            title={t("replaceImage")}
                            onClick={() => handleReplaceClick(idx)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-white/20 hover:bg-primary hover:text-white dark:hover:text-black text-white text-[10px] font-bold backdrop-blur-md flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>{t("replaceImage")}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title={
                              images.length > 1
                                ? t("removeImage")
                                : t("atLeastOneImage")
                            }
                            disabled={images.length <= 1}
                            onClick={() => handleDeleteImage(idx)}
                            className="p-1 rounded-lg bg-textError/80 hover:bg-textError text-white text-[10px] backdrop-blur-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Image Card (if fewer than 5) */}
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-borderPrimary hover:border-primary/50 bg-bgPrimary/60 hover:bg-bgPrimary aspect-square flex flex-col items-center justify-center gap-1.5 text-textSecondary hover:text-primary transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-bgSecondary border border-borderPrimary flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-colors">
                          <ImagePlus className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold">
                          {t("addImage")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-borderPrimary">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleModalClose}
                    disabled={isPending}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isPending}
                    leftIcon={<Pencil className="w-4 h-4" />}
                  >
                    {isPending ? t("saving") : tCommon("saveChanges")}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
