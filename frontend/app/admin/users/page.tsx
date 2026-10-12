"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Search, Loader2, Shield, User as UserIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/lib/axios-client";
import { User } from "@/features/auth/types/auth.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";

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

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { data: users, isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();

  const filtered = users?.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-textPrimary tracking-tight">Users</h1>
        <p className="text-sm text-textSecondary mt-0.5">
          {users?.length ?? "—"} registered users
        </p>
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
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {filtered!.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.User;
                  const joinDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={user._id} className="hover:bg-bgPrimary/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile?userId=${user._id}`}
                          className="group/user flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover/user:border-primary transition-colors">
                            <span className="text-xs font-black text-primary">
                              {user.fullName?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-textPrimary group-hover/user:text-primary transition-colors">
                              {user.fullName}
                            </p>
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
                      <td className="px-4 py-3 text-xs text-textSecondary">{joinDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          {user.role !== "SuperAdmin" && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
