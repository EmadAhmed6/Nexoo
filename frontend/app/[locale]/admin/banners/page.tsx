"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
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

export default function AdminBannersPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

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
        t("bannerStatusChanged", {
          title: banner.title,
          status: !banner.isActive ? tCommon("active") : tCommon("inactive"),
        })
      );
    } catch (err: any) {
      toast.error(err?.message || t("bannerStatusUpdateFailed"));
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteBanner.mutateAsync(bannerToDelete._id);
      toast.success(t("bannerDeleted"));
      setBannerToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || t("bannerDeleteFailed"));
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
    const scheduled = now
      ? banners?.filter((b) => b.startDate && new Date(b.startDate) > now).length ?? 0
      : 0;
    return { total, active, heroHome, scheduled };
  }, [banners, now]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-primary" />
            <span>{t("bannersManagement")}</span>
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            {t("bannersSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("createBanner")}</span>
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
            <p className="text-xs text-textSecondary font-semibold">{t("totalBanners")}</p>
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
            <p className="text-xs text-textSecondary font-semibold">{t("activeNow")}</p>
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
            <p className="text-xs text-textSecondary font-semibold">{t("homeSliders")}</p>
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
            <p className="text-xs text-textSecondary font-semibold">{t("scheduledBanners")}</p>
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
            placeholder={t("searchBannersPlaceholder")}
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
            <option value="all">{t("allPositions")}</option>
            <option value="hero_home">{t("bannerPositionHome")}</option>
            <option value="hero_category">{t("bannerPositionCategory")}</option>
            <option value="hero_product">{t("bannerPositionProduct")}</option>
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
            className="px-3 py-2 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-xs font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">{t("allStatus")}</option>
            <option value="active">{t("activeOnly")}</option>
            <option value="inactive">{t("inactiveOnly")}</option>
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
          <h3 className="text-base font-bold text-textPrimary">{t("noBanners")}</h3>
          <p className="text-xs text-textSecondary mt-1 max-w-sm mx-auto">
            {search || filterPosition !== "all" || filterStatus !== "all"
              ? t("bannersNoFilterMatch")
              : t("bannersEmptyHint")}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white dark:text-black text-xs font-bold shadow-md hover:bg-primaryHover transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("createFirstBanner")}</span>
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
                  <span>{t("bannerPriority", { priority: banner.priority })}</span>
                </div>

                {/* Active Toggle Status Badge */}
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                    banner.isActive
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-black/60 text-textSecondary border-borderPrimary hover:bg-black/80"
                  }`}
                  title={t("toggleBannerStatus")}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      banner.isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                    }`}
                  />
                  <span>{banner.isActive ? tCommon("active") : tCommon("inactive")}</span>
                </button>

                {/* Position Badge at bottom-left of image */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-primary/90 text-white dark:text-black font-extrabold text-[10px] tracking-wide uppercase shadow">
                  {banner.position === "hero_home"
                    ? t("homeSlider")
                    : banner.position === "hero_category"
                    ? t("positionCategory")
                    : t("positionProduct")}
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
                    <span className="font-semibold text-textPrimary">{t("linkLabel")}</span>
                    <span className="truncate">
                      {banner.linkType === "none"
                        ? t("noLinkInfo")
                        : `${banner.linkType.toUpperCase()}: ${
                            banner.linkValue || t("defaultTarget")
                          }`}
                    </span>
                  </div>

                  {/* Dates Schedule if present */}
                  {(banner.startDate || banner.endDate) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-textSecondary shrink-0" />
                      <span className="truncate">
                        {banner.startDate
                          ? new Date(banner.startDate).toLocaleDateString(locale)
                          : t("startDateShort")}{" "}
                        →{" "}
                        {banner.endDate
                          ? new Date(banner.endDate).toLocaleDateString(locale)
                          : t("noExpiry")}
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
                    <span>{tCommon("edit")}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(banner)}
                    className="p-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-red-500/10 hover:border-red-500/30 text-textSecondary hover:text-red-400 transition-all cursor-pointer"
                    title={t("deleteBanner")}
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
        title={t("deleteBanner")}
        itemName={bannerToDelete?.title}
        description={t("deleteBannerConfirm")}
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
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tCat = useTranslations("categories");
  const categoryLabel = (category: string) => {
    const key = category.toLowerCase() as any;
    return tCat.has(key) ? tCat(key) : category;
  };
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
      toast.error(t("bannerTitleRequired"));
      return;
    }

    if (mode === "create" && !selectedFile) {
      toast.error(t("uploadBannerRequired"));
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
        toast.success(t("bannerCreatedToast"));
      } else if (initialBanner) {
        await updateBanner.mutateAsync({
          bannerId: initialBanner._id,
          data: formData,
        });
        toast.success(t("bannerUpdatedToast"));
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.message || t("bannerSaveFailed"));
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
              {mode === "create" ? t("createNewBanner") : t("editBanner")}
            </h2>
            <p className="text-xs text-textSecondary mt-0.5">
              {t("bannerModalSubtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1.5">
              {t("bannerImage")} {mode === "create" && <span className="text-red-400">*</span>}
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[16/7] w-full rounded-2xl border-2 border-dashed border-borderPrimary hover:border-primary/50 bg-bgPrimary/60 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all group"
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt={t("previewImage")}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                    <Upload className="w-4 h-4" />
                    <span>{t("changeImage")}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-textPrimary">
                      {t("uploadBannerImage")}
                    </p>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      {t("bannerImageTypes")}
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
              {t("bannerTitle")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("bannerTitleExample")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1.5">
              {t("bannerSubtitle")}
            </label>
            <textarea
              rows={2}
              placeholder={t("bannerSubtitleExample")}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {/* Position & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                {t("displayPosition")}
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as BannerPosition)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="hero_home">{t("bannerPositionHome")}</option>
                <option value="hero_category">{t("bannerPositionCategory")}</option>
                <option value="hero_product">{t("bannerPositionProduct")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                {t("displayPriority")}
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
                {t("linkAction")}
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
                <option value="none">{t("noneStatic")}</option>
                <option value="category">{t("categoryFilter")}</option>
                <option value="product">{t("specificProductId")}</option>
                <option value="external">{t("externalWebUrl")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">
                {t("targetValue")}
              </label>
              {linkType === "category" ? (
                <select
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled={linkType === "none"}
                  placeholder={
                    linkType === "product"
                      ? t("mongoProductId")
                      : linkType === "external"
                      ? "https://example.com"
                      : t("noTarget")
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
                {t("startDateOptional")}
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
                {t("endDateOptional")}
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
              <p className="text-xs font-bold text-textPrimary">{t("activateBanner")}</p>
              <p className="text-[11px] text-textSecondary">
                {t("bannerPublicNotice")}
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
              {tCommon("cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tCommon("savingChanges")}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{mode === "create" ? t("createBannerAction") : t("updateBannerAction")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
