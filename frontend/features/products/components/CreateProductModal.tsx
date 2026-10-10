"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES } from "@/features/products/types/categories";
import { useCreateProduct } from "../hooks/useProducts";
import { Input, Button, Text } from "@/_components/shared";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  stock?: number;
  category: string;
}

const CATEGORY_OPTIONS = [...PRODUCT_CATEGORIES];

export function CreateProductModal({
  isOpen,
  onClose,
}: CreateProductModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const { mutate: createProduct, isPending } = useCreateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      priceAfterDiscount: undefined,
      stock: 10,
      category: CATEGORY_OPTIONS[0],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFileError("You can upload a maximum of 5 images.");
      return;
    }

    setSelectedFiles(files);

    // Create local object URLs for instant preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const handleModalClose = () => {
    reset();
    setSelectedFiles([]);
    setFilePreviews([]);
    setFileError(null);
    onClose();
  };

  const onSubmit = (data: ProductFormData) => {
    if (selectedFiles.length === 0) {
      setFileError("Please upload at least one product image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    if (data.priceAfterDiscount !== undefined && data.priceAfterDiscount > 0) {
      formData.append("priceAfterDiscount", String(data.priceAfterDiscount));
    }
    if (data.stock !== undefined) {
      formData.append("stock", String(data.stock));
    }
    formData.append("category", data.category);

    selectedFiles.forEach((file) => {
      formData.append("productImages", file);
    });

    createProduct(formData, {
      onSuccess: () => {
        toast.success("Product created successfully!", {
          description: `"${data.title}" is now available in the store.`,
        });
        handleModalClose();
      },
      onError: (err) => {
        toast.error("Failed to create product", {
          description: err.message || "An unexpected error occurred",
        });
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-borderPrimary mb-6">
              <div>
                <Text
                  as="h2"
                  size="2xl"
                  font="black"
                  className="tracking-tight"
                >
                  Add New Product
                </Text>
                <Text size="xs" color="secondary" className="mt-1">
                  Upload images and configure specifications for Nexo catalog.
                </Text>
              </div>

              <button
                onClick={handleModalClose}
                className="p-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Product Title */}
              <Input
                label="Product Title *"
                type="text"
                placeholder="e.g. Nexo Chrono Gold Watch"
                icon={<Layers className="w-4 h-4" />}
                error={errors.title?.message}
                {...register("title", {
                  required: "Product title is required",
                  minLength: {
                    value: 4,
                    message: "Title must be at least 4 characters",
                  },
                })}
              />

              {/* Description */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-textPrimary2 mb-1.5 select-none">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Describe the luxury specifications, materials, and features..."
                    className="w-full p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-ringPrimary placeholder:text-textSecondary/60 transition-all resize-none"
                    {...register("description", {
                      required: "Product description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                    })}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-xs text-textError flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.description.message}</span>
                  </p>
                )}
              </div>

              {/* Pricing & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Price (EGP) *"
                  type="number"
                  step="any"
                  placeholder="2500"
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.price?.message}
                  {...register("price", {
                    required: "Price is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Price must be >= 0" },
                  })}
                />

                <Input
                  label="Price After Discount (EGP)"
                  type="number"
                  step="any"
                  placeholder="1999"
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.priceAfterDiscount?.message}
                  {...register("priceAfterDiscount", {
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Price After Discount must be >= 0",
                    },
                  })}
                />

                <Input
                  label="Initial Stock *"
                  type="number"
                  placeholder="10"
                  icon={<Package className="w-4 h-4" />}
                  error={errors.stock?.message}
                  {...register("stock", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Stock must be >= 0" },
                  })}
                />
              </div>

              {/* Category Select */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-textPrimary2 mb-1.5 select-none">
                  Category *
                </label>
                <select
                  className="w-full py-2.5 px-3.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-ringPrimary transition-all cursor-pointer"
                  {...register("category", {
                    required: "Category is required",
                  })}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary2 mb-1.5 select-none">
                  Product Images (Max 5 files) *
                </label>
                <div className="relative border-2 border-dashed border-borderPrimary hover:border-primary/60 rounded-2xl p-6 text-center bg-bgPrimary transition-colors cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <Text size="xs" font="bold" className="text-textPrimary">
                      Click to upload or drag & drop images
                    </Text>
                    <Text size="xs" color="secondary" className="mt-1">
                      PNG, JPG, WEBP up to 5 files
                    </Text>
                  </div>
                </div>

                {fileError && (
                  <p className="mt-1.5 text-xs text-textError flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fileError}</span>
                  </p>
                )}

                {/* Previews */}
                {filePreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {filePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-borderPrimary group"
                      >
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-borderPrimary flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleModalClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  loadingText="Creating Product..."
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Product
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
