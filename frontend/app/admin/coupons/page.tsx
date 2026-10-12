"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Copy,
  Calendar,
  Percent,
  Banknote,
  AlertCircle,
  X,
  Power,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/features/coupons/hooks/useCoupons";
import { Coupon, CreateCouponPayload } from "@/features/coupons/types/coupon.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";

export default function AdminCouponsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: coupons, isLoading } = useCoupons();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon.mutateAsync({
        couponId: coupon._id,
        payload: { isActive: !coupon.isActive },
      });
      toast.success(
        `Coupon "${coupon.couponCode}" is now ${!coupon.isActive ? "Active" : "Inactive"}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleDeleteClick = (coupon: Coupon) => {
    if (coupon.usedCount > 0) {
      toast.error("Cannot delete a coupon that has already been used");
      return;
    }
    setCouponToDelete(coupon);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon.mutateAsync(couponToDelete._id);
      toast.success("Coupon deleted successfully");
      setCouponToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons?.filter((c) => {
    const matchesSearch = c.couponCode.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === "active") return c.isActive;
    if (filterStatus === "inactive") return !c.isActive;
    return true;
  });

  const now = new Date();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">Coupons</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Create, manage discounts and promotional coupon codes
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-borderPrimary bg-bgSecondary text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === "all"
                ? "bg-primary text-black"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            All ({coupons?.length ?? 0})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === "active"
                ? "bg-primary text-black"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Active ({coupons?.filter((c) => c.isActive).length ?? 0})
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === "inactive"
                ? "bg-primary text-black"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Inactive ({coupons?.filter((c) => !c.isActive).length ?? 0})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">Loading coupons...</span>
          </div>
        ) : !filteredCoupons?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Tag className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary">No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Validity Period
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expireDate) < now;
                  const isDepleted = coupon.usedCount >= coupon.usageLimit;
                  const usagePercent = Math.min(
                    100,
                    Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                  );

                  return (
                    <tr key={coupon._id} className="hover:bg-bgPrimary/30 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm tracking-wide text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                            {coupon.couponCode}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.couponCode)}
                            title="Copy code"
                            className="p-1 rounded-md text-textSecondary hover:text-primary hover:bg-bgPrimary transition-colors"
                          >
                            {copiedCode === coupon.couponCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bgPrimary border border-borderPrimary text-xs font-bold text-textPrimary">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-primary" />
                              <span>{coupon.discountValue}% OFF</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{coupon.discountValue} EGP OFF</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3.5">
                        <div className="w-36 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-textSecondary font-medium">Used</span>
                            <span
                              className={`font-bold ${
                                isDepleted ? "text-red-400" : "text-textPrimary"
                              }`}
                            >
                              {coupon.usedCount} / {coupon.usageLimit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-bgPrimary rounded-full overflow-hidden border border-borderPrimary">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDepleted
                                  ? "bg-red-400"
                                  : usagePercent > 70
                                  ? "bg-amber-400"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-textSecondary">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {new Date(coupon.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              –{" "}
                              {new Date(coupon.expireDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-bold">
                              <Clock className="w-3 h-3" /> Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              Valid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          disabled={updateCoupon.isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                            coupon.isActive
                              ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20"
                              : "bg-textSecondary/10 border-borderPrimary text-textSecondary hover:bg-textSecondary/20"
                          }`}
                          title="Click to toggle status"
                        >
                          <Power className="w-3 h-3" />
                          <span>{coupon.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditCoupon(coupon)}
                            className="p-1.5 rounded-lg text-textSecondary hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit coupon"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(coupon)}
                            disabled={coupon.usedCount > 0}
                            className={`p-1.5 rounded-lg transition-colors ${
                              coupon.usedCount > 0
                                ? "text-textSecondary/40 cursor-not-allowed"
                                : "text-textSecondary hover:text-red-400 hover:bg-red-400/10"
                            }`}
                            title={
                              coupon.usedCount > 0
                                ? "Cannot delete: already used"
                                : "Delete coupon"
                            }
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

      {/* Create Modal */}
      {createModalOpen && (
        <CreateCouponModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editCoupon && (
        <EditCouponModal
          coupon={editCoupon}
          isOpen={!!editCoupon}
          onClose={() => setEditCoupon(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteCoupon.isPending}
        title="Delete Coupon"
        itemName={couponToDelete?.couponCode}
        description={`Are you sure you want to delete coupon "${couponToDelete?.couponCode}"? This action cannot be undone.`}
        noticeText="Customers will no longer be able to use this coupon."
      />
    </div>
  );
}

// ── CREATE COUPON MODAL ──────────────────────────────────────────────────────────
function CreateCouponModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createCoupon = useCreateCoupon();

  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    couponCode: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    usageLimit: 10,
    startDate: todayStr,
    expireDate: nextMonthStr,
    isActive: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.couponCode.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (formData.discountType === "percentage") {
      if (formData.discountValue < 1 || formData.discountValue > 100) {
        toast.error("Percentage discount must be between 1 and 100");
        return;
      }
    } else {
      if (formData.discountValue <= 0) {
        toast.error("Fixed discount must be greater than 0");
        return;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.expireDate)) {
      toast.error("Start date must be before expiration date");
      return;
    }

    try {
      const payload: CreateCouponPayload = {
        couponCode: formData.couponCode.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        usageLimit: Number(formData.usageLimit) || 10,
        startDate: formData.startDate,
        expireDate: formData.expireDate,
        isActive: formData.isActive,
      };

      await createCoupon.mutateAsync(payload);
      toast.success("Coupon created successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create coupon");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-borderPrimary">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-textPrimary">Create New Coupon</h2>
              <p className="text-xs text-textSecondary">Add a promotional discount code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Coupon Code */}
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
              Coupon Code
            </label>
            <input
              type="text"
              required
              value={formData.couponCode}
              onChange={(e) =>
                setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
              }
              placeholder="e.g. SUMMER20, VIP50"
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary font-mono font-bold text-primary placeholder:text-textSecondary uppercase focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: "percentage" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.discountType === "percentage"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-borderPrimary bg-bgPrimary text-textSecondary hover:text-textPrimary"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: "fixed" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.discountType === "fixed"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-borderPrimary bg-bgPrimary text-textSecondary hover:text-textPrimary"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                Fixed Amount (EGP)
              </button>
            </div>
          </div>

          {/* Discount Value & Usage Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                {formData.discountType === "percentage" ? "Discount (%)" : "Discount (EGP)"}
              </label>
              <input
                type="number"
                min={1}
                max={formData.discountType === "percentage" ? 100 : undefined}
                required
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Expire Date
              </label>
              <input
                type="date"
                required
                value={formData.expireDate}
                onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Status Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-textPrimary">
              Active immediately upon creation
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderPrimary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCoupon.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold transition-all disabled:opacity-50"
            >
              {createCoupon.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── EDIT COUPON MODAL ────────────────────────────────────────────────────────────
function EditCouponModal({
  coupon,
  isOpen,
  onClose,
}: {
  coupon: Coupon;
  isOpen: boolean;
  onClose: () => void;
}) {
  const updateCoupon = useUpdateCoupon();

  const [formData, setFormData] = useState({
    couponCode: coupon.couponCode,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    usageLimit: coupon.usageLimit,
    startDate: new Date(coupon.startDate).toISOString().split("T")[0],
    expireDate: new Date(coupon.expireDate).toISOString().split("T")[0],
    isActive: coupon.isActive,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.discountType === "percentage") {
      if (formData.discountValue < 1 || formData.discountValue > 100) {
        toast.error("Percentage discount must be between 1 and 100");
        return;
      }
    } else {
      if (formData.discountValue <= 0) {
        toast.error("Fixed discount must be greater than 0");
        return;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.expireDate)) {
      toast.error("Start date must be before expiration date");
      return;
    }

    try {
      await updateCoupon.mutateAsync({
        couponId: coupon._id,
        payload: {
          couponCode: formData.couponCode.trim().toUpperCase(),
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          usageLimit: Number(formData.usageLimit),
          startDate: formData.startDate,
          expireDate: formData.expireDate,
          isActive: formData.isActive,
        },
      });
      toast.success("Coupon updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update coupon");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-borderPrimary">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-textPrimary">Edit Coupon</h2>
              <p className="text-xs text-textSecondary">Modify discount settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Coupon Code */}
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
              Coupon Code
            </label>
            <input
              type="text"
              required
              value={formData.couponCode}
              onChange={(e) =>
                setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary font-mono font-bold text-primary uppercase focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: "percentage" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.discountType === "percentage"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-borderPrimary bg-bgPrimary text-textSecondary hover:text-textPrimary"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: "fixed" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.discountType === "fixed"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-borderPrimary bg-bgPrimary text-textSecondary hover:text-textPrimary"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                Fixed Amount (EGP)
              </button>
            </div>
          </div>

          {/* Discount Value & Usage Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                {formData.discountType === "percentage" ? "Discount (%)" : "Discount (EGP)"}
              </label>
              <input
                type="number"
                min={1}
                max={formData.discountType === "percentage" ? 100 : undefined}
                required
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                min={coupon.usedCount || 1}
                required
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
              {coupon.usedCount > 0 && (
                <p className="text-[10px] text-textSecondary mt-1">
                  Already used: {coupon.usedCount} times
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                Expire Date
              </label>
              <input
                type="date"
                required
                value={formData.expireDate}
                onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Status Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-textPrimary">Coupon is Active</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderPrimary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCoupon.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold transition-all disabled:opacity-50"
            >
              {updateCoupon.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
