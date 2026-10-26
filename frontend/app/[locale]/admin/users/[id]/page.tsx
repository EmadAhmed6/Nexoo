"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Trash2,
  Copy,
  Check,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiDelete, apiPut } from "@/lib/axios-client";
import { User } from "@/features/auth/types/auth.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import { useAppStore } from "@/store/use-app-store";

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  SuperAdmin: {
    label: "SuperAdmin",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
  },
  Admin: {
    label: "Admin",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
  User: {
    label: "User",
    color: "text-textSecondary",
    bg: "bg-bgPrimary border-borderPrimary",
  },
};

export default function AdminUserDetailPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAppStore();

  const userId = params?.id as string;

  const [copiedId, setCopiedId] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"User" | "Admin" | "SuperAdmin" | null>(null);

  // Fetch single user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const res = await apiGet<User>(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (newRole: "User" | "Admin" | "SuperAdmin") =>
      apiPut<User>(`/users/${userId}`, { role: newRole }),
    onSuccess: (res) => {
      queryClient.setQueryData(["admin", "user", userId], res.data);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("userRoleUpdated"));
      setSelectedRole(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || t("userRoleUpdateFailed"));
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: () => apiDelete<null>(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("userDeleted"));
      router.push("/admin/users");
    },
    onError: (err: any) => {
      toast.error(err?.message || t("deleteUserFailed"));
    },
  });

  const handleCopyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopiedId(true);
    toast.success(t("userIdCopied"));
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentRoleValue = selectedRole ?? user?.role ?? "User";
  const hasRoleChanged = selectedRole !== null && selectedRole !== user?.role;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-textSecondary">{t("loadingUserProfile")}</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-textPrimary">{t("userNotFound")}</h2>
        <p className="text-sm text-textSecondary">
          {t("userNotFoundDescription")}
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white dark:text-black font-bold text-sm hover:bg-primaryHover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToUsers")}
        </Link>
      </div>
    );
  }

  const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.User;
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("backToUsers")}</span>
        </Link>

        {user.role !== "SuperAdmin" && (
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("deleteUserTitle")}</span>
          </button>
        )}
      </div>

      {/* Hero User Banner */}
      <div className="relative rounded-3xl border border-borderPrimary bg-bgSecondary p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-primary text-3xl font-black shadow-lg shadow-primary/10 flex-shrink-0">
            {user.fullName ? user.fullName[0].toUpperCase() : "U"}
          </div>

          {/* User Headline */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
                {user.fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-bold ${roleStyle.bg} ${roleStyle.color}`}
              >
                {user.role === "User" ? (
                  <UserIcon className="w-3 h-3" />
                ) : (
                  <Shield className="w-3 h-3" />
                )}
                {user.role === "SuperAdmin" ? t("roleSuperAdmin") : user.role === "Admin" ? t("roleAdmin") : t("roleUser")}
              </span>
            </div>

            <p className="text-sm text-textSecondary font-medium">
              @{user.username}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-textSecondary pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t("memberSince")} {joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information Card */}
        <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 space-y-4">
          <h2 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            {t("accountInformation")}
          </h2>

          <div className="space-y-3 text-sm divide-y divide-borderPrimary/60">
            {/* User ID */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-textSecondary font-medium">{t("userIdLabel")}</span>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-textPrimary hover:text-primary transition-colors p-1 rounded-lg hover:bg-bgPrimary"
                title={t("clickCopyId")}
              >
                <span>{user._id}</span>
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-textSecondary" />
                )}
              </button>
            </div>

            {/* Email */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-textSecondary font-medium">{t("emailColumn")}</span>
              <a
                href={`mailto:${user.email}`}
                className="text-xs font-semibold text-textPrimary hover:text-primary transition-colors"
              >
                {user.email}
              </a>
            </div>

            {/* Phone */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-textSecondary font-medium">{t("phoneColumn")}</span>
              <span className="text-xs font-semibold text-textPrimary">
                {user.phone || t("notProvided")}
              </span>
            </div>

            {/* Registered At */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-textSecondary font-medium">{t("joined")}</span>
              <span className="text-xs font-semibold text-textPrimary">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Role & Permissions Card */}
        <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 space-y-4">
          <h2 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {t("rolePermissions")}
          </h2>

          <p className="text-xs text-textSecondary leading-relaxed">
            {t("rolePermissionDescription")}
          </p>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider">
              {t("assignedRole")}
            </label>
            <div className="flex gap-2">
              <select
                value={currentRoleValue}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "User" | "Admin" | "SuperAdmin")
                }
                disabled={currentUser?.role !== "SuperAdmin" && user.role === "SuperAdmin"}
                className="flex-1 px-3 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors"
              >
                <option value="User">{t("standardMember")}</option>
                <option value="Admin">{t("storeManager")}</option>
                {currentUser?.role === "SuperAdmin" && (
                  <option value="SuperAdmin">{t("fullControl")}</option>
                )}
              </select>

              {hasRoleChanged && (
                <button
                  onClick={() => updateRoleMutation.mutate(selectedRole)}
                  disabled={updateRoleMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {updateRoleMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{tCommon("save")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 space-y-4">
        <h2 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          {t("savedAddresses")}
        </h2>

        {!user.addresses?.length ? (
          <div className="py-8 text-center text-xs text-textSecondary">
            {t("noSavedAddresses")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map((addr, idx) => (
              <div
                key={addr._id || idx}
                className="p-4 rounded-xl border border-borderPrimary bg-bgPrimary space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-textPrimary">{t("addressNumber", { count: idx + 1 })}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold">
                      {t("defaultAddress")}
                    </span>
                  )}
                </div>
                <p className="text-textSecondary">{addr.street}</p>
                <p className="text-textSecondary">
                  {addr.city}, {addr.state} {addr.postalCode && `(${addr.postalCode})`}
                </p>
                {addr.phone && (
                  <p className="text-textSecondary flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3 text-primary" />
                    {addr.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteUserMutation.mutate()}
        isPending={deleteUserMutation.isPending}
        title={t("deleteUserTitle")}
        itemName={user.fullName}
        description={t("userDeleteDetailConfirm", { name: user.fullName })}
        noticeText={t("userErasedNotice")}
      />
    </div>
  );
}
