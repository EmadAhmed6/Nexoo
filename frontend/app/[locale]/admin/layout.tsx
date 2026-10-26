"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAppStore } from "@/store/use-app-store";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Menu,
  X,
  LogOut,
  ChevronRight,
  LifeBuoy,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { LanguageSwitcher } from "@/_components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/_components/theme-toggle";

function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const { logout, user } = useAppStore();
  const router = useRouter();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const roleLabel = user?.role === "SuperAdmin"
    ? t("roleSuperAdmin")
    : user?.role === "Admin"
      ? t("roleAdmin")
      : t("roleUser");

  const NAV_ITEMS = [
    { label: t("overview"), href: "/admin", icon: LayoutDashboard },
    { label: t("orders"), href: "/admin/orders", icon: ShoppingCart },
    { label: t("users"), href: "/admin/users", icon: Users },
    { label: t("products"), href: "/admin/products", icon: Package },
    { label: t("coupons"), href: "/admin/coupons", icon: Tag },
    { label: t("banners"), href: "/admin/banners", icon: ImageIcon },
    { label: t("tickets"), href: "/admin/tickets", icon: LifeBuoy },
  ];

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-screen w-64 bg-bgSecondary z-40 flex flex-col transition-transform duration-300",
          locale === "ar" ? "right-0 border-l border-borderPrimary" : "left-0 border-r border-borderPrimary",
          isOpen ? "translate-x-0" : locale === "ar" ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-borderPrimary">
          <div className="min-w-0">
            <Link href="/" onClick={onClose} aria-label={tNav("home")} className="block relative w-full h-12">
              <Image
                src="/logo.png"
                alt="Nexoo"
                fill
                priority
                className="object-contain object-start opacity-100 transition-opacity duration-300 ease-in-out dark:opacity-0"
              />
              <Image
                src="/logo-white.png"
                alt="Nexoo"
                fill
                priority
                className="object-contain object-start opacity-0 transition-opacity duration-300 ease-in-out dark:opacity-100"
              />
            </Link>
            <p className="text-[10px] text-textSecondary font-semibold uppercase tracking-widest mt-0.5">
              {t("adminPanelLabel")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-borderPrimary">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bgPrimary border border-borderPrimary">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
              {user?.profilePicture?.url || user?.profileImage ? (
                <Image
                  src={user.profilePicture?.url || user.profileImage!}
                  alt={user?.fullName || "Admin avatar"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-xs font-black text-primary">
                  {user?.fullName?.[0]?.toUpperCase() ?? "A"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-textPrimary truncate">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-textSecondary truncate">
                {user?.role ? roleLabel : null}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href ||
              (href !== "/admin" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bgPrimary",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-primary" : "",
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ms-auto text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-borderPrimary space-y-2">
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-bgPrimary border border-borderPrimary">
            <span className="text-xs font-semibold text-textSecondary">{tCommon("theme")}</span>
            <ThemeToggle />
          </div>
          <LanguageSwitcher className="w-full justify-center" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{tCommon("logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const locale = useLocale();
  const { user, isAuthenticated } = useAppStore();
  const router = useRouter();
  const t = useTranslations("nav");

  // Client-side auth guard
  React.useEffect(() => {
    if (
      !isAuthenticated ||
      (user?.role !== "Admin" && user?.role !== "SuperAdmin")
    ) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex bg-bgPrimary">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-w-0 ${locale === "ar" ? "lg:pr-64" : "lg:pl-64"}`}>
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-borderPrimary bg-bgSecondary sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-textPrimary">{t("dashboard")}</span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
