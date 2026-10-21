"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "../hooks/useNotifications";
import { NotificationItem } from "../types/notification.types";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return past.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item._id);
    }

    if (item.type === "order") {
      setIsOpen(false);
      router.push("/orders");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-emerald-500" />;
      case "review":
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "order":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "review":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textSecondary hover:text-textPrimary hover:border-primary/50 transition-all flex items-center justify-center group",
          isOpen && "border-primary/60 text-primary shadow-sm"
        )}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-[340px] sm:w-[390px] rounded-3xl border border-borderPrimary bg-bgSecondary shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-borderPrimary bg-bgPrimary/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textPrimary leading-none">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    {unreadCount > 0
                      ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                      : "All caught up"}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Mark all read / Clear */}
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="p-1.5 rounded-lg text-textSecondary hover:text-primary hover:bg-bgPrimary transition-colors text-xs flex items-center gap-1 font-medium"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Read all</span>
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all notifications?")) {
                        deleteAllMutation.mutate();
                      }
                    }}
                    disabled={deleteAllMutation.isPending}
                    className="p-1.5 rounded-lg text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Segmented Filter: All vs Unread */}
            <div className="px-4 py-2 bg-bgPrimary/30 border-b border-borderPrimary flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                  filter === "all"
                    ? "bg-primary text-black shadow-sm"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                  filter === "unread"
                    ? "bg-primary text-black shadow-sm"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary"
                )}
              >
                Unread
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      filter === "unread"
                        ? "bg-black/20 text-black"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notification List Container */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-borderPrimary/60">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-textSecondary">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Loading notifications…</span>
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-bgPrimary border border-borderPrimary flex items-center justify-center text-textSecondary mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-textPrimary">
                    {filter === "unread"
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </p>
                  <p className="text-xs text-textSecondary mt-1 max-w-[240px]">
                    {filter === "unread"
                      ? "You have read all your notifications!"
                      : "When you receive order updates or activity, they will appear here."}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      "p-4 transition-all duration-150 cursor-pointer flex items-start gap-3 relative group hover:bg-bgPrimary/60",
                      !item.isRead && "bg-primary/[0.04]"
                    )}
                  >
                    {/* Unread dot indicator */}
                    {!item.isRead && (
                      <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-primary shadow-sm" />
                    )}

                    {/* Icon Badge */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                        getTypeBg(item.type)
                      )}
                    >
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Body content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={cn(
                            "text-xs truncate",
                            !item.isRead
                              ? "font-bold text-textPrimary"
                              : "font-medium text-textSecondary"
                          )}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-textSecondary shrink-0">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-textSecondary mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.type === "order" && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-2">
                          <span>View order details</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Action buttons (hover) */}
                    <div
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-bgSecondary/90 p-1 rounded-lg border border-borderPrimary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!item.isRead && (
                        <button
                          onClick={() => markAsReadMutation.mutate(item._id)}
                          className="p-1 rounded text-textSecondary hover:text-primary hover:bg-bgPrimary"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="p-1 rounded text-textSecondary hover:text-red-500 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-bgPrimary/40 border-t border-borderPrimary text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1.5"
                >
                  <span>View all notifications</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
