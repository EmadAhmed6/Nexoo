"use client";

import React, { useState, useRef, useCallback } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  LogOut,
  UserPlus,
  Menu,
  X,
  Search,
  LayoutDashboard,
  Bookmark,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
  Globe,
  ChevronDown,
  Sparkles,
  Home,
  Package,
  Bell,
  LifeBuoy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useCart } from "@/features/cart/hooks/useCart";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAppStore } from "@/store/use-app-store";
import { ThemeToggle } from "@/_components/theme-toggle";
import { LanguageSwitcher } from "@/_components/shared/LanguageSwitcher";
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from "@/features/products/types/categories";
import { SearchAutocomplete } from "@/features/products/components/SearchAutocomplete";
import { NotificationDropdown } from "@/features/notifications/components/NotificationDropdown";

const ALL_CATEGORIES = ["All", ...PRODUCT_CATEGORIES] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const t = useTranslations("nav");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");
  const tAdmin = useTranslations("admin");

  // Hover dropdown state with delay
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleProfileMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setProfileMenuOpen(true);
  }, []);

  const handleProfileMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setProfileMenuOpen(false), 180);
  }, []);


  const { openCart } = useCartStore();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAppStore();

  const validCartItems = (cart?.cartItems ?? []).filter((item) =>
    Boolean(item && item.product)
  );
  const totalCartItems = validCartItems.reduce(
    (acc, item) => acc + item.productQuantity,
    0
  );
  const wishlistCount = (wishlist?.products ?? []).length;

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
  const roleLabel = user?.role === "SuperAdmin"
    ? tAdmin("roleSuperAdmin")
    : user?.role === "Admin"
      ? tAdmin("roleAdmin")
      : t("member");
  const avatarUrl = user?.profilePicture?.url || user?.profileImage;

  // next-intl returns the locale-independent path here, so this also works
  // when an Arabic route is rendered as /ar/admin (or /ar/admin/).
  const cleanPathname = (pathname || "/").replace(/\/$/, "") || "/";
  if (
    cleanPathname === "/auth" ||
    cleanPathname.startsWith("/auth/") ||
    cleanPathname === "/admin" ||
    cleanPathname.startsWith("/admin/") ||
    cleanPathname === "/dashboard" ||
    cleanPathname.startsWith("/dashboard/")
  ) {
    return null;
  }

  // Category bar click handler — navigate to home with category filter via URL
  const handleCategoryClick = (cat: string) => {
    if (cat === "All") {
      router.push("/#products");
    } else {
      router.push(`/?category=${encodeURIComponent(cat)}#products`);
    }
  };

  // Translate category names
  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return tCat("all");
    const key = cat.toLowerCase() as any;
    try {
      if (tCat.has(key)) {
        return tCat(key);
      }
      return cat;
    } catch {
      return cat;
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HEADER — Two-row sticky nav
      ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full border-b border-borderPrimary bg-bgSecondary/95 backdrop-blur-md transition-colors duration-200">

        {/* ── Row 1: Logo / Search / Actions ──────────── */}
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 h-16">

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary transition-all shadow-sm"
              aria-label={t("openNavigationMenu")}
            >
              <Menu className="w-4 h-4 text-primary" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="relative h-16 w-28 sm:w-28 flex items-center">
                <Image
                  src="/logo.png"
                  alt="Nexoo Logo"
                  priority
                  fill
                  className="object-contain opacity-100 transition-opacity duration-300 ease-in-out dark:opacity-0"
                />
                <Image
                  src="/logo-white.png"
                  alt="Nexoo Logo"
                  priority
                  fill
                  className="object-contain opacity-0 transition-opacity duration-300 ease-in-out dark:opacity-100"
                />
              </div>
            </Link>

            {/* Search Bar with Autocomplete Suggestions */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <SearchAutocomplete
                placeholder={tCommon("search")}
                defaultValue={urlSearch}
              />
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0">

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher className="hidden md:inline-flex" />

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textSecondary hover:text-textPrimary transition-all flex items-center justify-center"
                  aria-label={t("wishlist")}
                  title={t("wishlist")}
                >
                  <Bookmark className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white dark:text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications Dropdown */}
              {isAuthenticated && <NotificationDropdown />}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textSecondary hover:text-textPrimary transition-all flex items-center justify-center"
                aria-label={t("openCart")}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white dark:text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* Profile Dropdown (hover-triggered) */}
              {isAuthenticated && user ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  {/* Avatar trigger */}
                  <button
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 transition-all group"
                    aria-label={t("openProfileMenu")}
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-black shadow-sm group-hover:scale-105 group-hover:border-primary transition-all overflow-hidden relative">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={user.fullName || user.username || "User avatar"}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-none">
                      <span className="text-[11px] font-bold text-textPrimary group-hover:text-primary transition-colors max-w-[90px] truncate">
                        {user.fullName || user.username}
                      </span>
                      <span className="text-[9px] text-textSecondary">
                        {roleLabel}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-textSecondary transition-transform duration-200 ${profileMenuOpen ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>

                  {/* Hover Dropdown */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.14 }}
                        onMouseEnter={handleProfileMouseEnter}
                        onMouseLeave={handleProfileMouseLeave}
                        className="absolute end-0 top-full mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-2xl border border-borderPrimary bg-bgSecondary shadow-2xl z-50 overflow-hidden"
                      >
                        {/* User header */}
                        <div className="px-4 py-3 border-b border-borderPrimary bg-bgPrimary/50 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-black shrink-0 overflow-hidden relative">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={user.fullName || user.username || "User avatar"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <span>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-textPrimary truncate">
                              {user.fullName || user.username}
                            </p>
                            <p className="text-[10px] text-textSecondary truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                          {/* Dashboard — admin/superAdmin only */}
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors group"
                            >
                              <LayoutDashboard className="w-4 h-4 shrink-0" />
                              <span>{t("dashboard")}</span>
                              <span className="ms-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                                {tAdmin("roleAdmin")}
                              </span>
                            </Link>
                          )}

                          {/* My Profile */}
                          <Link
                            href="/profile"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <UserIcon className="w-4 h-4 shrink-0 text-primary" />
                            <span>{t("profile")}</span>
                          </Link>

                          {/* Orders */}
                          <Link
                            href="/orders"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <Package className="w-4 h-4 shrink-0 text-primary" />
                            <span>{t("orders")}</span>
                          </Link>

                          {/* Wishlist */}
                          <Link
                            href="/wishlist"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <Bookmark className="w-4 h-4 shrink-0 text-primary" />
                            <span>{t("wishlist")}</span>
                            {wishlistCount > 0 && (
                              <span className="ms-auto min-w-5 h-5 px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold inline-flex items-center justify-center">
                                {wishlistCount > 99 ? "99+" : wishlistCount}
                              </span>
                            )}
                          </Link>

                          {/* Notifications */}
                          <Link
                            href="/notifications"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <Bell className="w-4 h-4 shrink-0 text-primary" />
                            <span>{t("notifications")}</span>
                          </Link>

                          {/* Support Tickets */}
                          <Link
                            href="/tickets"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <LifeBuoy className="w-4 h-4 shrink-0 text-primary" />
                            <span>{t("supportTickets")}</span>
                          </Link>

                          {/* Logout */}
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>{tCommon("logout")}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3.5 py-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t("signUp")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search bar with autocomplete */}
          <div className="sm:hidden pb-3">
            <SearchAutocomplete
              isMobile
              placeholder={tCommon("search")}
              defaultValue={urlSearch}
              onSelectResult={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>

        {/* ── Row 2: Categories Bar ───────────────────── */}
        <div className="w-full border-t border-borderPrimary bg-bgPrimary/30">
          <div className="px-4 sm:px-6 lg:px-10">
            <div className="relative flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
              {ALL_CATEGORIES.map((cat) => {
                const Icon = cat === "All" ? null : CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];
                const isHovered = hoveredCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`relative shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      isHovered
                        ? "bg-primary text-white dark:text-black"
                        : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary"
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isHovered ? "text-white dark:text-black" : "text-primary"}`} />}
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
              {/* Right fade */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-bgPrimary/80 to-transparent" />
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          MOBILE SLIDE-IN MENU
      ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-50"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.aside
              key="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={t("navigationMenu")}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 start-0 h-full w-full max-w-[340px] flex flex-col z-50 bg-bgSecondary border-e border-borderPrimary shadow-[12px_0_48px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <div className="relative h-8 w-24">
                    <Image src="/logo.png" alt="Nexoo" fill className="object-contain opacity-100 transition-opacity duration-300 ease-in-out dark:opacity-0" />
                    <Image src="/logo-white.png" alt="Nexoo" fill className="object-contain opacity-0 transition-opacity duration-300 ease-in-out dark:opacity-100" />
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("closeMenu")}
                  className="p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {/* Navigation */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-2 mb-2">
                    Navigation
                  </p>
                  <nav className="space-y-1">
                    {[
                      { label: t("home"), href: "/", icon: Home },
                      { label: t("products"), href: "/#products", icon: Sparkles },
                      ...(isAuthenticated ? [
                        { label: t("profile"), href: "/profile", icon: UserIcon },
                        { label: t("notifications"), href: "/notifications", icon: Bell },
                        { label: t("supportTickets"), href: "/tickets", icon: LifeBuoy },
                        { label: t("orders"), href: "/orders", icon: Package },
                        { label: t("wishlist"), href: "/wishlist", icon: Bookmark },
                      ] : []),
                      ...(isAdmin ? [{ label: t("dashboard"), href: "/admin", icon: LayoutDashboard }] : []),
                    ].map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isActive
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-transparent hover:border-borderPrimary hover:bg-bgPrimary text-textPrimary"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-xl border ${isActive ? "bg-primary text-white dark:text-black border-primary" : "bg-bgPrimary text-primary border-borderPrimary"}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-semibold">{link.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isActive ? "text-primary" : "text-textSecondary"}`} />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-2 mb-2">
                    {t("categories")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => {
                      const Icon = cat === "All" ? null : CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];
                      return (
                        <button
                          key={cat}
                          onClick={() => { handleCategoryClick(cat); setMobileMenuOpen(false); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textSecondary hover:text-primary hover:border-primary/40 text-xs font-semibold transition-all"
                        >
                          {Icon && <Icon className="w-3 h-3 text-primary" />}
                          {getCategoryLabel(cat)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-borderPrimary bg-bgPrimary/50 space-y-3">
                {isAuthenticated && user ? (
                  <div className="p-3 rounded-2xl border border-borderPrimary bg-bgPrimary flex items-center justify-between gap-3">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden relative">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={user.fullName || user.username || "User avatar"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          user.fullName ? user.fullName[0].toUpperCase() : "U"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-textPrimary truncate">{user.fullName || user.username}</p>
                        <p className="text-[10px] text-textSecondary truncate">{user.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      title={tCommon("logout")}
                      className="p-2 rounded-xl text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold text-center transition-all">
                      {t("signIn")}
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primaryHover text-white dark:text-black text-xs font-bold text-center transition-all">
                      {t("signUp")}
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-textSecondary px-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>{tHome("certifiedLuxury")}</span>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
