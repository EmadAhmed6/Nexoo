"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useProducts, useDeleteProduct } from "@/features/products/hooks/useProducts";
import { CreateProductModal } from "@/features/products/components/CreateProductModal";
import { EditProductModal } from "@/features/products/components/EditProductModal";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import { Product } from "@/features/products/types/product.types";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({ page, limit: 10, search });
  const deleteProduct = useDeleteProduct();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct.mutateAsync(productToDelete._id);
      toast.success("Product deleted successfully");
      setProductToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">Products</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            {data?.totalProducts ?? "—"} total products in the catalog
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-bgSecondary border border-borderPrimary text-sm font-semibold text-textPrimary hover:border-primary/50 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">Loading products...</span>
          </div>
        ) : !data?.products?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Rating</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {data.products.map((product) => {
                  const imgUrl = product.productImages?.[0]?.url;
                  const hasDiscount =
                    product.priceAfterDiscount &&
                    product.priceAfterDiscount > 0 &&
                    product.priceAfterDiscount < product.price;

                  return (
                    <tr key={product._id} className="hover:bg-bgPrimary/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${product._id}`}
                          className="group/product flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-borderPrimary flex-shrink-0 bg-bgPrimary group-hover/product:border-primary/50 transition-colors">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={product.title} fill className="object-cover group-hover/product:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-textSecondary" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-textPrimary line-clamp-1 max-w-[200px] group-hover/product:text-primary transition-colors">
                            {product.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-bgPrimary border border-borderPrimary text-xs text-textSecondary font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-primary">{product.price} EGP</span>
                          {hasDiscount && (
                            <span className="block text-[11px] text-emerald-400 font-semibold">
                              Sale: {product.priceAfterDiscount} EGP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold ${
                            product.stock === 0
                              ? "text-red-400"
                              : product.stock <= 5
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                          <span className="text-xs font-semibold text-textPrimary">
                            {product.ratingAverage?.toFixed(1) ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditProduct(product)}
                            className="p-1.5 rounded-lg text-textSecondary hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-textSecondary">
            Page {data.currentPage} of {data.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-borderPrimary text-textSecondary hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded-lg border border-borderPrimary text-textSecondary hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateProductModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      {editProduct && (
        <EditProductModal
          isOpen={!!editProduct}
          product={editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteProduct.isPending}
        title="Delete Product"
        productTitle={productToDelete?.title}
      />
    </div>
  );
}
