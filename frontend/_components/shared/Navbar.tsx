"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useCart } from "@/features/cart/hooks/useCart";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAppStore } from "@/store/use-app-store";
import { ThemeToggle } from "@/_components/theme-toggle";
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

  // Category bar click handler — navigate to home with category filter via URL
  const handleCategoryClick = (cat: string) => {
    if (cat === "All") {
      router.push("/#products");
    } else {
      router.push(`/?category=${encodeURIComponent(cat)}#products`);
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
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4 text-primary" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="relative h-9 w-24 sm:w-28 flex items-center">
                <Image
                  src="/logo.png"
                  alt="Nexoo Logo"
                  priority
                  width={220}
                  height={220}
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Search Bar with Autocomplete Suggestions */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <SearchAutocomplete
                placeholder="Search for products, brands and categories…"
                defaultValue={urlSearch}
              />
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0">

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language */}
              <button
                className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textSecondary hover:text-textPrimary transition-all text-xs font-semibold"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden lg:inline">EN</span>
                <ChevronDown className="w-3 h-3 hidden lg:inline" />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textSecondary hover:text-textPrimary transition-all flex items-center justify-center"
                  aria-label="My Wishlist"
                  title="My Wishlist"
                >
                  <Bookmark className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
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
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
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
                    aria-label="Open profile menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-black shadow-sm group-hover:scale-105 group-hover:border-primary transition-all">
                      {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-none">
                      <span className="text-[11px] font-bold text-textPrimary group-hover:text-primary transition-colors max-w-[90px] truncate">
                        {user.fullName || user.username}
                      </span>
                      <span className="text-[9px] text-textSecondary">
                        {user.role || "Member"}
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
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-borderPrimary bg-bgSecondary shadow-2xl z-50 overflow-hidden"
                      >
                        {/* User header */}
                        <div className="px-4 py-3 border-b border-borderPrimary bg-bgPrimary/50">
                          <p className="text-xs font-bold text-textPrimary truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-[10px] text-textSecondary truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu items — ONLY these 3 */}
                        <div className="p-1.5 space-y-0.5">
                          {/* Dashboard — admin/superAdmin only */}
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors group"
                            >
                              <LayoutDashboard className="w-4 h-4 shrink-0" />
                              <span>Dashboard</span>
                              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                                Admin
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
                            <span>My Profile</span>
                          </Link>

                          {/* Notifications */}
                          <Link
                            href="/notifications"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                          >
                            <Bell className="w-4 h-4 shrink-0 text-primary" />
                            <span>Notifications</span>
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
                            <span>Logout</span>
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
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3.5 py-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search bar with autocomplete */}
          <div className="sm:hidden pb-3">
            <SearchAutocomplete
              isMobile
              placeholder="Search products…"
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
                        ? "bg-primary text-black"
                        : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary"
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isHovered ? "text-black" : "text-primary"}`} />}
                    {cat}
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
              aria-label="Navigation Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-full w-full max-w-[340px] flex flex-col z-50 bg-bgSecondary border-r border-borderPrimary shadow-[12px_0_48px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <div className="relative h-8 w-24">
                    <Image src="/logo.png" alt="Nexoo" width={180} height={180} className="object-contain" />
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
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
                      { label: "Home", href: "/", icon: Home },
                      { label: "Products", href: "/#products", icon: Sparkles },
                      ...(isAuthenticated ? [
                        { label: "My Profile", href: "/profile", icon: UserIcon },
                        { label: "Notifications", href: "/notifications", icon: Bell },
                        { label: "My Orders", href: "/orders", icon: Package },
                        { label: "Wishlist", href: "/wishlist", icon: Bookmark },
                      ] : []),
                      ...(isAdmin ? [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] : []),
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
                            <div className={`p-1.5 rounded-xl border ${isActive ? "bg-primary text-black border-primary" : "bg-bgPrimary text-primary border-borderPrimary"}`}>
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
                    Categories
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
                          {cat}
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
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-textPrimary truncate">{user.fullName || user.username}</p>
                        <p className="text-[10px] text-textSecondary truncate">{user.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      title="Sign Out"
                      className="p-2 rounded-xl text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold text-center transition-all">
                      Sign In
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold text-center transition-all">
                      Join Nexoo
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-textSecondary px-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Nexoo Certified Luxury</span>
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
