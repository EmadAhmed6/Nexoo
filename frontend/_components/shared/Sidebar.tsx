"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Sparkles,
  Plus,
  ShoppingBag,
  LogOut,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  User,
  Compass,
  Layers,
  Bookmark,
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/store/use-app-store";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { CreateProductModal } from "@/features/products/components/CreateProductModal";
import { Text } from "@/_components/shared/Text";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export function Sidebar({
  className,
  onSelectCategory,
  selectedCategory,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAppStore();
  const { data: wishlist } = useWishlist();
  const { unreadCount } = useNotifications();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const wishlistCount = (wishlist?.products ?? []).length;
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const navLinks = [
    {
      label: t("home"),
      href: "/",
      icon: Home,
      isActive:
        pathname === "/" && (!selectedCategory || selectedCategory === "All"),
    },
    {
      label: t("products"),
      href: "/#products",
      icon: Sparkles,
      isActive:
        pathname === "/" && selectedCategory && selectedCategory !== "All",
    },
    ...(isAuthenticated
      ? [
          {
            label: t("notifications"),
            href: "/notifications",
            icon: Bell,
            isActive: pathname.startsWith("/notifications"),
            badge: unreadCount,
          },
          {
            label: t("orders"),
            href: "/orders",
            icon: Package,
            isActive: pathname.startsWith("/orders"),
          },
          {
            label: t("wishlist"),
            href: "/wishlist",
            icon: Bookmark,
            isActive: pathname.startsWith("/wishlist"),
            badge: wishlistCount,
          },
        ]
      : []),
  ];

  return (
    <>
      <aside
        className={cn(
          "w-60 lg:w-64 shrink-0 sticky top-24 self-start space-y-5 select-none",
          className,
        )}
      >
        {/* Main Navigation Card */}
        <div className="rounded-3xl border border-borderPrimary bg-bgSecondary/80 backdrop-blur-md p-4 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-3 mb-2 block">
              Menu
            </span>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.isActive;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200",
                      isActive
                        ? "bg-primary text-white dark:text-black shadow-[0_2px_16px_rgba(212,175,55,0.25)]"
                        : "text-textSecondary hover:text-textPrimary hover:bg-bgPrimary",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-transform group-hover:scale-110",
                          isActive ? "text-white dark:text-black" : "text-primary",
                        )}
                      />
                      <span>{link.label}</span>
                      {typeof link.badge === "number" && link.badge > 0 && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-black",
                          isActive
                            ? "bg-black/20 text-white dark:text-black"
                            : "bg-primary/20 text-primary",
                        )}>
                          {link.badge}
                        </span>
                      )}
                    </div>

                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5",
                        isActive
                          ? "text-white dark:text-black opacity-80"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="h-px w-full bg-borderPrimary" />

          {/* Quick Actions */}
          <div>
            <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-3 mb-2 block">
              Quick Actions
            </span>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-textPrimary hover:bg-bgPrimary border border-borderPrimary hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>New Product</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-textSecondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* User Account Section */}
          <div className="pt-1">
            {isAuthenticated && user ? (
              <div className="p-3 rounded-2xl bg-bgPrimary border border-borderPrimary space-y-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-textPrimary truncate leading-tight">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[10px] text-textSecondary truncate leading-tight mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-borderPrimary text-[11px]">
                  <Link
                    href="/orders"
                    className="text-primary hover:underline font-semibold"
                  >
                    {t("orders")}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-textSecondary hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{tCommon("logout")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  className="py-2 px-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold text-center transition-all"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/auth/register"
                  className="py-2 px-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold text-center shadow-sm transition-all"
                >
                  {t("signUp")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Reusable Create Product Modal */}
      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
