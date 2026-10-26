"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTranslations } from "next-intl";
import {
  useUserProfile,
  useUpdateUser,
  useDeleteUser,
  useUploadProfilePicture,
  useDeleteProfilePicture,
} from "@/features/user/hooks/useUser";
import { UserAddressesSection } from "@/features/user/components/UserAddressesSection";
import { ChangePasswordSection } from "@/features/user/components/ChangePasswordSection";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Loader2,
  Sparkles,
  LayoutDashboard,
  Package,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  LifeBuoy,
  Camera,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isAuthenticated, logout } = useAppStore();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  const queryUserId = searchParams.get("userId");
  const isAdmin = authUser?.role === "Admin" || authUser?.role === "SuperAdmin";
  const currentAuthId = authUser?._id || (authUser as any)?.id;
  const isOtherUser = Boolean(queryUserId && queryUserId !== currentAuthId && isAdmin);
  const targetUserId = isOtherUser ? queryUserId! : currentAuthId;

  const { data: profileUser, isLoading: isFetching } = useUserProfile(targetUserId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const uploadPictureMutation = useUploadProfilePicture();
  const deletePictureMutation = useDeleteProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const user = profileUser || (!isOtherUser ? authUser : null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const payload: Record<string, string> = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      await updateUserMutation.mutateAsync({
        userId: user._id,
        payload,
      });

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Member";

  const isUserAdmin = user.role === "Admin" || user.role === "SuperAdmin";

  const handleConfirmDelete = async () => {
    if (!user?._id) return;
    try {
      await deleteUserMutation.mutateAsync(user._id);
      toast.success(isOtherUser ? "User deleted successfully" : "Your account has been deleted");
      setDeleteModalOpen(false);
      if (isOtherUser) {
        router.push("/admin/users");
      } else {
        logout();
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner when viewing another user */}
      {isOtherUser && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <UserIcon className="w-4 h-4" />
            <span>{t("viewingUser")}: {user.fullName} (@{user.username})</span>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("backToUsers")}</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
          <span>{isOtherUser ? t("userProfileTitle") : t("title")}</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          {isOtherUser
            ? `${t("manageAccount")} ${user.fullName}.`
            : t("manageOwn")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 text-center space-y-4">
            <div className="relative inline-block group">
              {/* Avatar circle */}
              <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto text-primary text-3xl font-black shadow-lg overflow-hidden">
                {user.profilePicture?.url ? (
                  <Image
                    src={user.profilePicture.url}
                    alt={user.fullName}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  user.fullName ? user.fullName[0].toUpperCase() : "U"
                )}
              </div>

              {/* Upload overlay — own profile only */}
              {!isOtherUser && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPictureMutation.isPending}
                    className="absolute inset-0 w-24 h-24 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer mx-auto"
                    title={t("uploadPhoto")}
                  >
                    {uploadPictureMutation.isPending ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* Remove picture button */}
                  {user.profilePicture?.url && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await deletePictureMutation.mutateAsync(user._id);
                          toast.success("Profile picture removed");
                        } catch (err: any) {
                          toast.error(err?.message || "Failed to remove picture");
                        }
                      }}
                      disabled={deletePictureMutation.isPending}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-bgSecondary flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                      title={t("deletePhoto")}
                    >
                      {deletePictureMutation.isPending ? (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </button>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image must be less than 5MB");
                        return;
                      }
                      try {
                        await uploadPictureMutation.mutateAsync({ userId: user._id, file });
                        toast.success("Profile picture updated!");
                      } catch (err: any) {
                        toast.error(err?.message || "Failed to upload picture");
                      }
                      e.target.value = "";
                    }}
                  />
                </>
              )}

              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-bgSecondary flex items-center justify-center" title="Active">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Upload hint */}
            {!isOtherUser && (
              <p className="text-[10px] text-textSecondary -mt-2">
                {t("hoverToChange")}
              </p>
            )}

            <div>
              <h2 className="text-lg font-bold text-textPrimary leading-tight">
                {user.fullName}
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">@{user.username}</p>
            </div>

            <div className="pt-2 border-t border-borderPrimary flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  user.role === "SuperAdmin"
                    ? "bg-purple-400/10 border-purple-400/30 text-purple-400"
                    : user.role === "Admin"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-bgPrimary border-borderPrimary text-textSecondary"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user.role}</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-left pt-2">
              <div className="flex items-center gap-2.5 text-textSecondary">
                <Mail className="w-4 h-4 text-textSecondary flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2.5 text-textSecondary">
                  <Phone className="w-4 h-4 text-textSecondary flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-textSecondary">
                <Calendar className="w-4 h-4 text-textSecondary flex-shrink-0" />
                <span>{t("joined")} {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-4 space-y-2">
            <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider px-2">
              {t("quickShortcuts")}
            </p>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t("adminDashboard")}</span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider">{t("access")}</span>
              </Link>
            )}
            <Link
              href="/orders"
              className="flex items-center justify-between p-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-textSecondary" />
                <span>{t("myOrders")}</span>
              </div>
              <span className="text-textSecondary text-xs">View →</span>
            </Link>

            <Link
              href="/tickets"
              className="flex items-center justify-between p-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="w-4 h-4 text-textSecondary" />
                <span>{t("supportTickets")}</span>
              </div>
              <span className="text-textSecondary text-xs">Help →</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 sm:p-8">
            <h3 className="text-lg font-bold text-textPrimary tracking-tight mb-1">
              {t("personalInfo")}
            </h3>
            <p className="text-xs text-textSecondary mb-6">
              {t("personalInfoSubtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                    {t("fullName")}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                    {t("username")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary font-bold text-xs pointer-events-none">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                    {t("emailAddress")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                    {t("phoneNumber")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="e.g. +20 100 000 0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-borderPrimary flex items-center justify-end">
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-sm font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tCommon("savingChanges")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {tCommon("saveChanges")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          {!isOtherUser && <ChangePasswordSection userId={user._id} />}

          {/* Addresses Section */}
          <UserAddressesSection userId={user._id} />

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isOtherUser ? t("dangerZoneUser") : t("dangerZone")}</span>
                </h3>
                <p className="text-xs text-textSecondary mt-1">
                  {isOtherUser ? t("dangerZoneUserDesc") : t("dangerZoneDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/40 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-colors cursor-pointer w-fit"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isOtherUser ? t("deleteUser") : t("deleteMyAccount")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={deleteUserMutation.isPending}
        title={isOtherUser ? t("deleteUser") : t("dangerZone")}
        itemName={user.fullName}
        description={
          isOtherUser
            ? `Are you sure you want to delete user "${user.fullName}"? All their personal data and access will be permanently erased.`
            : "Are you sure you want to delete your account? This action cannot be undone and your data will be permanently removed."
        }
        noticeText="This user account will be permanently deleted."
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
