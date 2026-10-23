"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/lib/axios-client";
import { User } from "@/features/auth/types/auth.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";
import { useBanUser, useUnbanUser } from "@/features/user/hooks/useUser";

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

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  SuperAdmin: { label: "SuperAdmin", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
  Admin: { label: "Admin", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  User: { label: "User", color: "text-textSecondary", bg: "bg-bgPrimary border-borderPrimary" },
};

const BAN_PRESETS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "1 Year", days: 365 },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [banDurationDays, setBanDurationDays] = useState<number>(7);
  const [filterBanned, setFilterBanned] = useState<"all" | "active" | "banned">("all");

  const { data: users, isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const filtered = users?.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterBanned === "banned") return Boolean(u.isBanned);
    if (filterBanned === "active") return !u.isBanned;
    return true;
  });

  const bannedCount = users?.filter((u) => u.isBanned).length ?? 0;

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete._id);
      toast.success("User deleted successfully");
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  const handleConfirmBan = async () => {
    if (!userToBan) return;
    if (!banDurationDays || banDurationDays <= 0) {
      toast.error("Please enter a valid ban duration");
      return;
    }
    try {
      await banUser.mutateAsync({
        userId: userToBan._id,
        banDuration: banDurationDays,
      });
      toast.success(`User "${userToBan.fullName}" has been banned for ${banDurationDays} days`);
      setUserToBan(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to ban user");
    }
  };

  const handleUnban = async (user: User) => {
    try {
      await unbanUser.mutateAsync(user._id);
      toast.success(`User "${user.fullName}" unbanned successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to unban user");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">Users</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            {users?.length ?? "—"} registered users • {bannedCount} currently banned
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bgSecondary border border-borderPrimary text-xs font-semibold">
          <button
            onClick={() => setFilterBanned("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBanned === "all"
                ? "bg-primary text-black font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            All ({users?.length ?? 0})
          </button>
          <button
            onClick={() => setFilterBanned("active")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBanned === "active"
                ? "bg-primary text-black font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Active ({(users?.length ?? 0) - bannedCount})
          </button>
          <button
            onClick={() => setFilterBanned("banned")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBanned === "banned"
                ? "bg-red-500 text-white font-bold"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Banned ({bannedCount})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or username..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">Loading users...</span>
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {filtered.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.User;
                  const joinDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const isBanned = Boolean(user.isBanned);
                  const banExpiryDate = user.banExpires
                    ? new Date(user.banExpires).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-bgPrimary/30 transition-colors ${
                        isBanned ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile?userId=${user._id}`}
                          className="group/user flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                            isBanned
                              ? "bg-red-500/15 border-red-500/30 text-red-400"
                              : "bg-primary/15 border-primary/30 text-primary group-hover/user:border-primary"
                          }`}>
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
                                  BANNED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-textSecondary">@{user.username}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-xs">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${roleStyle.bg} ${roleStyle.color}`}
                        >
                          {user.role === "User" ? (
                            <UserIcon className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isBanned ? (
                          <div className="inline-flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold bg-red-500/10 border-red-500/30 text-red-400">
                              <Ban className="w-3 h-3" />
                              Banned
                            </span>
                            {banExpiryDate && (
                              <span className="text-[10px] text-red-400/70 font-medium">
                                until {banExpiryDate}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-textSecondary">{joinDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role !== "SuperAdmin" && (
                            <>
                              {isBanned ? (
                                <button
                                  onClick={() => handleUnban(user)}
                                  disabled={unbanUser.isPending}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 transition-colors cursor-pointer"
                                  title="Lift ban and restore user access"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Unban</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setUserToBan(user);
                                    setBanDurationDays(7);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer"
                                  title="Ban user temporarily"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Ban</span>
                                </button>
                              )}

                              <button
                                onClick={() => setUserToDelete(user)}
                                className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                                title="Delete user"
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
                  <h3 className="text-lg font-bold text-textPrimary">Ban User</h3>
                  <p className="text-xs text-textSecondary">
                    Suspends access to login and features
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
              <p className="text-xs font-bold text-textPrimary">{userToBan.fullName}</p>
              <p className="text-xs text-textSecondary">{userToBan.email}</p>
              <p className="text-[11px] text-textSecondary">@{userToBan.username}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Select Ban Duration</span>
              </label>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2">
                {BAN_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setBanDurationDays(preset.days)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      banDurationDays === preset.days
                        ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                        : "bg-bgPrimary border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom days input */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-textSecondary">
                  Or enter custom duration (days):
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={banDurationDays}
                    onChange={(e) => setBanDurationDays(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2 rounded-xl border border-borderPrimary bg-bgPrimary text-sm text-textPrimary focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-textSecondary pointer-events-none">
                    days
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/20 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  The user will be immediately logged out and forbidden from making requests until{" "}
                  <strong>
                    {new Date(Date.now() + banDurationDays * 86400000).toLocaleDateString()}
                  </strong>
                  . You can unban them at any time.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToBan(null)}
                className="px-4 py-2 rounded-xl border border-borderPrimary bg-bgPrimary text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={banUser.isPending}
                onClick={handleConfirmBan}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {banUser.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Ban</span>
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
        title="Delete User"
        itemName={userToDelete?.fullName}
        description={`Are you sure you want to delete user "${userToDelete?.fullName}"? All their account data and access will be permanently removed.`}
        noticeText="This user account will be permanently deleted."
      />
    </div>
  );
}
