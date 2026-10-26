"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  Users,
  Search,
  Loader2,
  Shield,
  User as UserIcon,
  Trash2,
  Ban,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Mail,
  UserCheck,
  UserMinus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/lib/axios-client";
import { User } from "@/features/auth/types/auth.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import {
  useBanUser,
  useUnbanUser,
  useToggleAdminStatus,
} from "@/features/user/hooks/useUser";

function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await apiGet<User[]>("/users");
      return res.data ?? [];
    },
  });
}

function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiDelete<null>(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

const ROLE_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
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

const BAN_PRESETS = [
  { label: "banPresetDay", days: 1 },
  { label: "banPresetDays3", days: 3 },
  { label: "banPresetDays7", days: 7 },
  { label: "banPresetDays30", days: 30 },
  { label: "banPresetDays90", days: 90 },
  { label: "banPresetYear", days: 365 },
];

export default function AdminUsersPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const roleLabel = (role: string) => role === "SuperAdmin"
    ? t("roleSuperAdmin")
    : role === "Admin"
      ? t("roleAdmin")
      : t("roleUser");
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [userToToggleAdmin, setUserToToggleAdmin] = useState<User | null>(null);
  const [banDurationDays, setBanDurationDays] = useState<number>(7);
  const [filterRole, setFilterRole] = useState<
    "all" | "active" | "admins" | "banned"
  >("all");

  const { data: users, isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const toggleAdmin = useToggleAdminStatus();

  // Appointed admins (role === "Admin", excluding SuperAdmin)
  const appointedAdmins = users?.filter((u) => u.role === "Admin") ?? [];
  const superAdmins = users?.filter((u) => u.role === "SuperAdmin") ?? [];
  const totalAdminsCount = appointedAdmins.length + superAdmins.length;
  const bannedCount = users?.filter((u) => u.isBanned).length ?? 0;
  const activeCount = (users?.length ?? 0) - bannedCount;

  const filtered = users?.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRole === "banned") return Boolean(u.isBanned);
    if (filterRole === "active") return !u.isBanned;
    if (filterRole === "admins") return u.role === "Admin" || u.role === "SuperAdmin";
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete._id);
      toast.success(t("userDeleted"));
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || t("deleteUserFailed"));
    }
  };

  const handleConfirmBan = async () => {
    if (!userToBan) return;
    if (!banDurationDays || banDurationDays <= 0) {
      toast.error(t("validBanDuration"));
      return;
    }
    try {
      await banUser.mutateAsync({
        userId: userToBan._id,
        banDuration: banDurationDays,
      });
      toast.success(
        t("userBannedToast", { name: userToBan.fullName, days: banDurationDays })
      );
      setUserToBan(null);
    } catch (err: any) {
      toast.error(err?.message || t("banUserFailed"));
    }
  };

  const handleUnban = async (user: User) => {
    try {
      await unbanUser.mutateAsync(user._id);
      toast.success(t("userUnbannedToast", { name: user.fullName }));
    } catch (err: any) {
      toast.error(err?.message || t("unbanUserFailed"));
    }
  };

  const handleConfirmToggleAdmin = async () => {
    if (!userToToggleAdmin) return;
    const willBecomeAdmin = userToToggleAdmin.role !== "Admin";
    try {
      const res = await toggleAdmin.mutateAsync(userToToggleAdmin._id);
      toast.success(
        res?.message ||
          (willBecomeAdmin
            ? t("userPromotedToast", { name: userToToggleAdmin.fullName })
            : t("adminRevokedToast", { name: userToToggleAdmin.fullName }))
      );
      setUserToToggleAdmin(null);
    } catch (err: any) {
      toast.error(err?.message || t("adminStatusFailed"));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            {t("usersManagement")}
          </h1>
          <p className="text-sm text-textSecondary mt-0.5">
            {t("usersPageSubtitle")}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-bgSecondary border border-borderPrimary text-xs font-semibold">
          <button
            onClick={() => setFilterRole("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterRole === "all"
                ? "bg-primary text-white dark:text-black font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {t("usersFilterAll", { count: users?.length ?? 0 })}
          </button>
          <button
            onClick={() => setFilterRole("active")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterRole === "active"
                ? "bg-primary text-white dark:text-black font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {t("usersFilterActive", { count: activeCount })}
          </button>
          <button
            onClick={() => setFilterRole("admins")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterRole === "admins"
                ? "bg-purple-500 text-white font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            <Shield className="w-3 h-3" />
            {t("usersFilterAdmins", { count: totalAdminsCount })}
          </button>
          <button
            onClick={() => setFilterRole("banned")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterRole === "banned"
                ? "bg-red-500 text-white font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {t("usersFilterBanned", { count: bannedCount })}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("totalUsers")}
            </span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-textPrimary">
            {users?.length ?? 0}
          </p>
          <p className="text-[11px] text-textSecondary">{t("registeredAccounts")}</p>
        </div>

        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("appointedAdmins")}
            </span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-purple-400">
              {appointedAdmins.length}
            </p>
            {superAdmins.length > 0 && (
              <span className="text-[11px] text-purple-400/70 font-semibold">
                (+{superAdmins.length} {t("roleSuperAdmin")})
              </span>
            )}
          </div>
          <p className="text-[11px] text-textSecondary">{t("activeAdministrators")}</p>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("activeUsers")}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-textPrimary">{activeCount}</p>
          <p className="text-[11px] text-textSecondary">{t("goodStandingAccounts")}</p>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary/60 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("bannedUsers")}
            </span>
            <Ban className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">{bannedCount}</p>
          <p className="text-[11px] text-textSecondary">{t("suspendedAccounts")}</p>
        </div>
      </div>

      {/* Dedicated Section: Appointed Admins / المدراء المعينون */}
      <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-b from-purple-500/[0.07] to-bgSecondary p-6 space-y-5 shadow-xl shadow-purple-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-textPrimary tracking-tight">
                  {t("appointedAdmins")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  {appointedAdmins.length}
                </span>
              </div>
              <p className="text-xs text-textSecondary">
                {t("appointedAdminsSubtitle")}
              </p>
            </div>
          </div>

          {filterRole !== "admins" && (
            <button
              onClick={() => setFilterRole("admins")}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{t("viewInTable")}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Admins Grid or Empty State */}
        {appointedAdmins.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-500/30 bg-bgPrimary/40 p-8 text-center space-y-2">
            <Shield className="w-8 h-8 mx-auto text-purple-400/50" />
            <p className="text-sm font-bold text-textPrimary">
              {t("noAppointedAdmins")}
            </p>
            <p className="text-xs text-textSecondary max-w-md mx-auto">
              {t("promoteUsersTip")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {appointedAdmins.map((admin) => (
              <div
                key={admin._id}
                className="group p-4 rounded-2xl border border-borderPrimary bg-bgSecondary hover:border-purple-500/40 transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/profile?userId=${admin._id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm flex-shrink-0 group-hover:border-purple-400 transition-colors">
                      {admin.fullName?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-textPrimary truncate group-hover:text-purple-400 transition-colors">
                        {admin.fullName}
                      </p>
                      <p className="text-[11px] text-textSecondary truncate">
                        @{admin.username}
                      </p>
                    </div>
                  </Link>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 flex-shrink-0">
                    {t("roleAdmin")}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-textSecondary">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-textSecondary flex-shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-textSecondary flex-shrink-0" />
                    <span>
                      {t("joined")} {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-borderPrimary/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/users/${admin._id}`}
                    className="text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    {t("manageProfile")}
                  </Link>

                  <button
                    onClick={() => setUserToToggleAdmin(admin)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 transition-colors cursor-pointer"
                    title={t("demoteStandardUser")}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>{t("revokeAdmin")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchAllUsers")}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* All Users Directory Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-borderPrimary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
              {filterRole === "admins"
                ? t("administratorsList")
                : filterRole === "banned"
                ? t("bannedUsersList")
                : filterRole === "active"
                ? t("activeUsersList")
                : t("allUsersDirectory")}
            </h3>
          </div>
          <span className="text-xs text-textSecondary">
            {t("showingResults", { count: filtered?.length ?? 0 })}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">{t("loadingUsers")}</span>
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary">{t("noUsers")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {t("user")}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {t("emailColumn")}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {tCommon("status")}
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {t("joined")}
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {filtered.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.User;
                  const joinDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const isBanned = Boolean(user.isBanned);
                  const banExpiryDate = user.banExpires
                    ? new Date(user.banExpires).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  const isSuperAdmin = user.role === "SuperAdmin";
                  const isAdmin = user.role === "Admin";

                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-bgPrimary/30 transition-colors ${
                        isBanned
                          ? "bg-red-500/[0.03]"
                          : isAdmin
                          ? "bg-purple-500/[0.02]"
                          : ""
                      }`}
                    >
                      {/* User Column */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile?userId=${user._id}`}
                          className="group/user flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                              isBanned
                                ? "bg-red-500/15 border-red-500/30 text-red-400"
                                : isAdmin
                                ? "bg-purple-500/20 border-purple-500/40 text-purple-400 group-hover/user:border-purple-400"
                                : "bg-primary/15 border-primary/30 text-primary group-hover/user:border-primary"
                            }`}
                          >
                            <span className="text-xs font-black">
                              {user.fullName?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-textPrimary group-hover/user:text-primary transition-colors">
                                {user.fullName}
                              </p>
                              {isBanned && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                                  {t("banned").toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-textSecondary">
                              @{user.username}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Email Column */}
                      <td className="px-4 py-3 text-textSecondary text-xs">
                        {user.email}
                      </td>

                      {/* Role Column */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${roleStyle.bg} ${roleStyle.color}`}
                        >
                          {user.role === "User" ? (
                            <UserIcon className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {roleLabel(user.role)}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-3">
                        {isBanned ? (
                          <div className="inline-flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold bg-red-500/10 border-red-500/30 text-red-400">
                              <Ban className="w-3 h-3" />
                              {t("banned")}
                            </span>
                            {banExpiryDate && (
                              <span className="text-[10px] text-red-400/70 font-medium">
                                {t("untilDate", { date: banExpiryDate })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {tCommon("active")}
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3 text-xs text-textSecondary">
                        {joinDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-purple-400/80 bg-purple-400/10 border border-purple-400/20">
                              {t("roleSuperAdmin")}
                            </span>
                          ) : (
                            <>
                              {/* Toggle Admin Role Button */}
                              {isAdmin ? (
                                <button
                                  onClick={() => setUserToToggleAdmin(user)}
                                  disabled={toggleAdmin.isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 border border-purple-400/30 transition-colors cursor-pointer"
                                  title={t("demoteStandardUser")}
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span>{t("revokeAdmin")}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setUserToToggleAdmin(user)}
                                  disabled={toggleAdmin.isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors cursor-pointer"
                                  title={t("promoteAdminTitle")}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{t("makeAdminTitle")}</span>
                                </button>
                              )}

                              {/* Ban / Unban Button */}
                              {isBanned ? (
                                <button
                                  onClick={() => handleUnban(user)}
                                  disabled={unbanUser.isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 transition-colors cursor-pointer"
                                  title={t("unbanUserTitle")}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{t("unban")}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setUserToBan(user);
                                    setBanDurationDays(7);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer"
                                  title={t("banUserTitle")}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>{t("banUser")}</span>
                                </button>
                              )}

                              {/* Delete User Button */}
                              <button
                                onClick={() => setUserToDelete(user)}
                                className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                                title={t("deleteUserTitle")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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

      {/* Toggle Admin Modal */}
      {userToToggleAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    userToToggleAdmin.role === "Admin"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-textPrimary tracking-tight">
                    {userToToggleAdmin.role === "Admin"
                      ? t("revokeAdminPrivileges")
                      : t("promoteToAdmin")}
                  </h3>
                  <p className="text-xs text-textSecondary">
                    {userToToggleAdmin.role === "Admin"
                      ? t("revertStandardAccount")
                      : t("grantDashboardPermissions")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserToToggleAdmin(null)}
                className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target User Summary Card */}
            <div className="p-3.5 rounded-2xl bg-bgPrimary border border-borderPrimary space-y-1">
              <p className="text-sm font-bold text-textPrimary">
                {userToToggleAdmin.fullName}
              </p>
              <p className="text-xs text-textSecondary">
                {userToToggleAdmin.email}
              </p>
              <p className="text-[11px] text-textSecondary">
                @{userToToggleAdmin.username}
              </p>
            </div>

            {/* Warning / Explanation */}
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                userToToggleAdmin.role === "Admin"
                  ? "bg-red-500/[0.06] border-red-500/20 text-red-200"
                  : "bg-purple-500/[0.06] border-purple-500/20 text-purple-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {userToToggleAdmin.role === "Admin" ? (
                  <>
                    {t("confirmDemoteNotice", { name: userToToggleAdmin.fullName })}
                  </>
                ) : (
                  <>
                    {t("confirmPromoteNotice", { name: userToToggleAdmin.fullName })}
                  </>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToToggleAdmin(null)}
                className="px-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                disabled={toggleAdmin.isPending}
                onClick={handleConfirmToggleAdmin}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
                  userToToggleAdmin.role === "Admin"
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                    : "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20"
                }`}
              >
                {toggleAdmin.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>
                  {userToToggleAdmin.role === "Admin"
                    ? t("confirmDemote")
                    : t("confirmMakeAdmin")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {userToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">{t("banUser")}</h3>
                  <p className="text-xs text-textSecondary">
                    {t("banLoginNotice")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserToBan(null)}
                className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-bgPrimary border border-borderPrimary space-y-1">
              <p className="text-xs font-bold text-textPrimary">
                {userToBan.fullName}
              </p>
              <p className="text-xs text-textSecondary">{userToBan.email}</p>
              <p className="text-[11px] text-textSecondary">
                @{userToBan.username}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{t("selectBanDuration")}</span>
              </label>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2">
                {BAN_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setBanDurationDays(preset.days)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      banDurationDays === preset.days
                        ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                        : "bg-bgPrimary border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40"
                    }`}
                  >
                    {t(preset.label as any)}
                  </button>
                ))}
              </div>

              {/* Custom days input */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-textSecondary">
                  {t("customBanDuration")}
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={banDurationDays}
                    onChange={(e) =>
                      setBanDurationDays(Math.max(1, Number(e.target.value)))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-borderPrimary bg-bgPrimary text-sm text-textPrimary focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-textSecondary pointer-events-none">
                    {t("days")}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/20 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {t("banUntilNotice", {
                    date: new Date(Date.now() + banDurationDays * 86400000).toLocaleDateString(locale),
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToBan(null)}
                className="px-4 py-2 rounded-xl border border-borderPrimary bg-bgPrimary text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                disabled={banUser.isPending}
                onClick={handleConfirmBan}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {banUser.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>{t("confirmBan")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteUser.isPending}
        title={t("deleteUserTitle")}
        itemName={userToDelete?.fullName}
        description={t("userDeleteConfirm", { name: userToDelete?.fullName || "" })}
        noticeText={t("usersDeletedPermanently")}
      />
    </div>
  );
}
