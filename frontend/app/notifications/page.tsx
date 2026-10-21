"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Star,
  Sparkles,
  ExternalLink,
  Inbox,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { NotificationItem } from "@/features/notifications/types/notification.types";
import { cn } from "@/lib/utils";

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const { notifications, unreadCount, isLoading } = useNotifications();

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "order" | "review">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (activeTab === "unread" && item.isRead) return false;
    if (activeTab === "order" && item.type !== "order") return false;
    if (activeTab === "review" && item.type !== "review") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }

    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-5 h-5 text-emerald-500" />;
      case "review":
        return <Star className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "order":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
      case "review":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default:
        return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/50 text-textSecondary hover:text-textPrimary transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-textPrimary flex items-center gap-2.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary text-black font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-xs text-textSecondary mt-0.5">
                Stay updated with your orders, reviews, and account activity
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/50 text-textPrimary text-xs font-bold transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-primary" />
              <span>Mark all as read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete all notifications?")) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={deleteAllMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-red-500/50 hover:text-red-500 text-textSecondary text-xs font-bold transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bgSecondary border border-borderPrimary overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "all"
                ? "bg-primary text-black shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === "unread"
                ? "bg-primary text-black shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-black",
                  activeTab === "unread"
                    ? "bg-black/20 text-black"
                    : "bg-primary/20 text-primary"
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("order")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "order"
                ? "bg-primary text-black shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "review"
                ? "bg-primary text-black shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            Reviews
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs rounded-xl border border-borderPrimary bg-bgSecondary text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary/60 transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl border border-borderPrimary bg-bgSecondary/60 backdrop-blur-md overflow-hidden divide-y divide-borderPrimary/60 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-textSecondary">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm">Loading your notifications…</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-bgPrimary border border-borderPrimary flex items-center justify-center text-textSecondary mb-4 shadow-inner">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-textPrimary">
              No notifications found
            </h3>
            <p className="text-xs text-textSecondary mt-1 max-w-sm">
              {searchQuery
                ? `No notifications matching "${searchQuery}"`
                : activeTab === "unread"
                ? "You have caught up with all your notifications!"
                : "You don't have any notifications at the moment."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredNotifications.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "p-5 transition-all flex items-start gap-4 group hover:bg-bgPrimary/70 relative",
                  !item.isRead && "bg-primary/[0.03]"
                )}
              >
                {/* Unread indicator bar */}
                {!item.isRead && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                )}

                {/* Type Icon */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm",
                    getTypeBg(item.type)
                  )}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3
                      className={cn(
                        "text-sm font-bold text-textPrimary",
                        !item.isRead && "text-primary font-black"
                      )}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-textSecondary shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-textSecondary leading-relaxed">
                    {item.message}
                  </p>

                  {/* Context Actions */}
                  <div className="flex items-center gap-3 mt-3">
                    {item.type === "order" && (
                      <Link
                        href="/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        onClick={() => {
                          if (!item.isRead) markAsReadMutation.mutate(item._id);
                        }}
                      >
                        <span>View Orders</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => markAsReadMutation.mutate(item._id)}
                        className="inline-flex items-center gap-1 text-xs text-textSecondary hover:text-textPrimary font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete action button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteMutation.mutate(item._id)}
                    className="p-2 rounded-xl text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
