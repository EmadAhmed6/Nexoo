"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Calendar,
  AlertCircle,
  X,
  Power,
  Clock,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Upload,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/features/banners/hooks/useBanners";
import {
  Banner,
  BannerLinkType,
  BannerPosition,
  CreateBannerInput,
  UpdateBannerInput,
} from "@/features/banners/types/banner.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import { PRODUCT_CATEGORIES } from "@/features/products/types/categories";

const POSITION_LABELS: Record<BannerPosition, string> = {
  hero_home: "Home Hero Slider",
  hero_category: "Category Hero",
  hero_product: "Product Promo",
};

export default function AdminBannersPage() {
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  const { data: banners, isLoading } = useAdminBanners();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner.mutateAsync({
        bannerId: banner._id,
        data: { isActive: !banner.isActive },
      });
      toast.success(
        `Banner "${banner.title}" is now ${!banner.isActive ? "Active" : "Inactive"}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update banner status");
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteBanner.mutateAsync(bannerToDelete._id);
      toast.success("Banner deleted successfully");
      setBannerToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete banner");
    }
  };

  const filteredBanners = useMemo(() => {
    return banners?.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;

      if (filterPosition !== "all" && b.position !== filterPosition) return false;
      if (filterStatus === "active" && !b.isActive) return false;
      if (filterStatus === "inactive" && b.isActive) return false;

      return true;
    });
  }, [banners, search, filterPosition, filterStatus]);

  const stats = useMemo(() => {
    const total = banners?.length ?? 0;
    const active = banners?.filter((b) => b.isActive).length ?? 0;
    const heroHome = banners?.filter((b) => b.position === "hero_home").length ?? 0;
    const now = new Date();
    const scheduled =
      banners?.filter(
        (b) => b.startDate && new Date(b.startDate) > now
      ).length ?? 0;
    return { total, active, heroHome, scheduled };
  }, [banners]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-primary" />
            <span>Banner Management</span>
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Create, schedule, and showcase promotional banners across Nexoo.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-borderPrimary bg-bgSecondary flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-textPrimary">
              {stats.total}
            </p>
            <p className="text-xs text-textSecondary font-semibold">Total Banners</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-borderPrimary bg-bgSecondary flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-textPrimary">
              {stats.active}
            </p>
            <p className="text-xs text-textSecondary font-semibold">Active Now</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-borderPrimary bg-bgSecondary flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-textPrimary">
              {stats.heroHome}
            </p>
            <p className="text-xs text-textSecondary font-semibold">Home Sliders</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-borderPrimary bg-bgSecondary flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-textPrimary">
              {stats.scheduled}
            </p>
            <p className="text-xs text-textSecondary font-semibold">Scheduled</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or subtitle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Position & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Position Select */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-xs font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Positions</option>
            <option value="hero_home">Home Hero Slider</option>
            <option value="hero_category">Category Hero</option>
            <option value="hero_product">Product Promo</option>
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
            className="px-3 py-2 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-xs font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banners Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl border border-borderPrimary bg-bgSecondary animate-pulse"
            />
          ))}
        </div>
      ) : !filteredBanners || filteredBanners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-borderPrimary bg-bgSecondary/40">
          <ImageIcon className="w-12 h-12 text-textSecondary mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-textPrimary">No banners found</h3>
          <p className="text-xs text-textSecondary mt-1 max-w-sm mx-auto">
            {search || filterPosition !== "all" || filterStatus !== "all"
              ? "No banners match your active filters. Try resetting search."
              : "Get started by creating your first promotional hero banner."}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold shadow-md hover:bg-primaryHover transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className="group rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col shadow-lg"
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-black/40 overflow-hidden border-b border-borderPrimary">
                <Image
                  src={banner.image.url}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Priority Badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md">
                  <ArrowUpDown className="w-3 h-3 text-primary" />
                  <span>Priority {banner.priority}</span>
                </div>

                {/* Active Toggle Status Badge */}
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                    banner.isActive
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-black/60 text-textSecondary border-borderPrimary hover:bg-black/80"
                  }`}
                  title="Click to toggle active status"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      banner.isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                    }`}
                  />
                  <span>{banner.isActive ? "Active" : "Inactive"}</span>
                </button>

                {/* Position Badge at bottom-left of image */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-primary/90 text-black font-extrabold text-[10px] tracking-wide uppercase shadow">
                  {banner.position === "hero_home"
                    ? "Home Slider"
                    : banner.position === "hero_category"
                    ? "Category"
                    : "Product"}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-textPrimary leading-snug line-clamp-1">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-textSecondary mt-1 line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                {/* Metadata details */}
                <div className="space-y-2 pt-2 border-t border-borderPrimary/60 text-[11px] text-textSecondary">
                  {/* Link Target */}
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-textPrimary">Link:</span>
                    <span className="truncate">
                      {banner.linkType === "none"
                        ? "No Link (Informational)"
                        : `${banner.linkType.toUpperCase()}: ${
                            banner.linkValue || "Default"
                          }`}
                    </span>
                  </div>

                  {/* Dates Schedule if present */}
                  {(banner.startDate || banner.endDate) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-textSecondary shrink-0" />
                      <span className="truncate">
                        {banner.startDate
                          ? new Date(banner.startDate).toLocaleDateString()
                          : "Start"}{" "}
                        →{" "}
                        {banner.endDate
                          ? new Date(banner.endDate).toLocaleDateString()
                          : "No Expiry"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-borderPrimary">
                  <button
                    onClick={() => setEditBanner(banner)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-bgPrimary/80 text-textPrimary text-xs font-bold transition-all hover:border-primary/40 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(banner)}
                    className="p-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-red-500/10 hover:border-red-500/30 text-textSecondary hover:text-red-400 transition-all cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <BannerFormModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          mode="create"
        />
      )}

      {/* Edit Modal */}
      {editBanner && (
        <BannerFormModal
          isOpen={Boolean(editBanner)}
          onClose={() => setEditBanner(null)}
          mode="edit"
          initialBanner={editBanner}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(bannerToDelete)}
        onClose={() => setBannerToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteBanner.isPending}
        title="Delete Banner"
        itemName={bannerToDelete?.title}
        description="Are you sure you want to delete this banner? The image file will be permanently removed from Cloudinary."
      />
    </div>
  );
}

// ==========================================
// CREATE & EDIT MODAL
// ==========================================

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialBanner?: Banner;
}

function BannerFormModal({
  isOpen,
  onClose,
  mode,
  initialBanner,
}: BannerFormModalProps) {
  const [title, setTitle] = useState(initialBanner?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialBanner?.subtitle ?? "");
  const [position, setPosition] = useState<BannerPosition>(
    initialBanner?.position ?? "hero_home"
  );
  const [linkType, setLinkType] = useState<BannerLinkType>(
    initialBanner?.linkType ?? "none"
  );
  const [linkValue, setLinkValue] = useState(initialBanner?.linkValue ?? "");
  const [priority, setPriority] = useState<number>(initialBanner?.priority ?? 1);
  const [isActive, setIsActive] = useState<boolean>(initialBanner?.isActive ?? true);
  const [startDate, setStartDate] = useState(
    initialBanner?.startDate ? initialBanner.startDate.slice(0, 16) : ""
  );
  const [endDate, setEndDate] = useState(
    initialBanner?.endDate ? initialBanner.endDate.slice(0, 16) : ""
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialBanner?.image?.url ?? null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const isSubmitting = createBanner.isPending || updateBanner.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    if (mode === "create" && !selectedFile) {
      toast.error("Please upload a banner image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (subtitle.trim()) formData.append("subtitle", subtitle.trim());
      formData.append("position", position);
      formData.append("linkType", linkType);
      if (linkValue.trim()) formData.append("linkValue", linkValue.trim());
      formData.append("priority", String(priority));
      formData.append("isActive", String(isActive));
      if (startDate) formData.append("startDate", new Date(startDate).toISOString());
      if (endDate) formData.append("endDate", new Date(endDate).toISOString());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (mode === "create") {
        await createBanner.mutateAsync(formData);
        toast.success("Banner created successfully");
      } else if (initialBanner) {
        await updateBanner.mutateAsync({
          bannerId: initialBanner._id,
          data: formData,
        });
        toast.success("Banner updated successfully");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save banner");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl p-6 sm:p-7 overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-textPrimary tracking-tight">
              {mode === "create" ? "Create New Banner" : "Edit Banner"}
            </h2>
            <p className="text-xs text-textSecondary mt-0.5">
              Upload visuals and specify redirection links & schedule.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1.5">
              Banner Image {mode === "create" && <span className="text-red-400">*</span>}
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[16/7] w-full rounded-2xl border-2 border-dashed border-borderPrimary hover:border-primary/50 bg-bgPrimary/60 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all group"
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <Upload className="w-4 h-4" />
                    <span>Click to change image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-textPrimary">
                      Upload Banner Image
                    </p>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      PNG, JPG, or WEBP (Recommended 1920x800 or 1200x600)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1.5">
              Banner Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Mega Sale 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1.5">
              Subtitle / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Up to 50% discount on flagship smartphones & audio gear"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {/* Position & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                Display Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as BannerPosition)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="hero_home">Home Hero Slider</option>
                <option value="hero_category">Category Hero</option>
                <option value="hero_product">Product Promo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                Display Priority (Higher = First)
              </label>
              <input
                type="number"
                min={0}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Link Redirection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                Link Action
              </label>
              <select
                value={linkType}
                onChange={(e) => {
                  const val = e.target.value as BannerLinkType;
                  setLinkType(val);
                  if (val === "category" && !linkValue) {
                    setLinkValue(PRODUCT_CATEGORIES[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="none">None (Static Display)</option>
                <option value="category">Category Filter</option>
                <option value="product">Specific Product ID</option>
                <option value="external">External Web URL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                Target Value
              </label>
              {linkType === "category" ? (
                <select
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled={linkType === "none"}
                  placeholder={
                    linkType === "product"
                      ? "MongoDB Product ID"
                      : linkType === "external"
                      ? "https://example.com"
                      : "No target"
                  }
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 disabled:opacity-40"
                />
              )}
            </div>
          </div>

          {/* Scheduling Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary/60">
            <div>
              <p className="text-xs font-bold text-textPrimary">Activate Banner</p>
              <p className="text-[11px] text-textSecondary">
                Immediately display this banner to public visitors
              </p>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderPrimary">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{mode === "create" ? "Create Banner" : "Update Banner"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
