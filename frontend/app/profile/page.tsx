"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useUserProfile, useUpdateUser, useDeleteUser } from "@/features/user/hooks/useUser";
import { UserAddressesSection } from "@/features/user/components/UserAddressesSection";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Package,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isAuthenticated, logout } = useAppStore();

  const queryUserId = searchParams.get("userId");
  const isAdmin = authUser?.role === "Admin" || authUser?.role === "SuperAdmin";
  const isOtherUser = Boolean(queryUserId && queryUserId !== authUser?._id && isAdmin);
  const targetUserId = isOtherUser ? queryUserId! : authUser?._id;

  const { data: profileUser, isLoading: isFetching } = useUserProfile(targetUserId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const user = profileUser || (!isOtherUser ? authUser : null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
        password: "",
        confirmPassword: "",
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

    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      const payload: Record<string, string> = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await updateUserMutation.mutateAsync({
        userId: user._id,
        payload,
      });

      toast.success("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
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
            <span>Viewing User Profile: {user.fullName} (@{user.username})</span>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Users</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
          <span>{isOtherUser ? "User Profile" : "My Profile"}</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          {isOtherUser
            ? `Manage account details and credentials for ${user.fullName}.`
            : "Manage your personal information, credentials, and account settings."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto text-primary text-3xl font-black shadow-lg">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-bgSecondary flex items-center justify-center" title="Active">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

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
                <span>Joined {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-4 space-y-2">
            <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider px-2">
              Quick Shortcuts
            </p>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider">Access</span>
              </Link>
            )}
            <Link
              href="/orders"
              className="flex items-center justify-between p-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-textSecondary" />
                <span>My Orders</span>
              </div>
              <span className="text-textSecondary text-xs">View →</span>
            </Link>

            <Link
              href="/tickets"
              className="flex items-center justify-between p-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="w-4 h-4 text-textSecondary" />
                <span>Support Tickets</span>
              </div>
              <span className="text-textSecondary text-xs">Help →</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 sm:p-8">
            <h3 className="text-lg font-bold text-textPrimary tracking-tight mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-textSecondary mb-6">
              Update your account details and password anytime.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                    Full Name
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
                    Username
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
                    Email Address
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
                    Phone Number
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

              {/* Password Section */}
              <div className="pt-4 border-t border-borderPrimary space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span>Change Password (Optional)</span>
                  </h4>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Leave blank if you do not want to change your password.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-borderPrimary flex items-center justify-end">
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-sm font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Addresses Section */}
          <UserAddressesSection userId={user._id} />

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isOtherUser ? "Delete User Account" : "Delete Account"}</span>
                </h3>
                <p className="text-xs text-textSecondary mt-1">
                  {isOtherUser
                    ? "Permanently delete this user's account and all their associated data from the store."
                    : "Once you delete your account, there is no going back. Please be certain."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/40 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs font-bold transition-colors cursor-pointer w-fit"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isOtherUser ? "Delete User" : "Delete My Account"}</span>
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
        title={isOtherUser ? "Delete User" : "Delete Account"}
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
