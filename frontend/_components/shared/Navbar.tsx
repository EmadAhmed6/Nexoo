"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  LogOut,
  UserPlus,
  Menu,
  X,
  Home,
  Package,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User as UserIcon,
  Search,
  LayoutDashboard,
  Bookmark,
} from "lucide-react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useCart } from "@/features/cart/hooks/useCart";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useAppStore } from "@/store/use-app-store";
import { ThemeToggle } from "@/_components/theme-toggle";
import { Text } from "@/_components/shared/Text";
import { CreateProductModal } from "@/features/products/components/CreateProductModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}#products`);
    } else {
      router.push("/");
    }
  };

  const { openCart } = useCartStore();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAppStore();

  const validCartItems = (cart?.cartItems ?? []).filter((item) =>
    Boolean(item && item.product),
  );
  const totalCartItems = validCartItems.reduce(
    (acc, item) => acc + item.productQuantity,
    0,
  );

  const wishlistCount = (wishlist?.products ?? []).length;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      desc: "Explore featured products & collections",
    },
    {
      label: "Products",
      href: "/#products",
      icon: Sparkles,
      desc: "Browse full luxury catalog",
    },
    ...(isAuthenticated
      ? [
          {
            label: "My Profile",
            href: "/profile",
            icon: UserIcon,
            desc: "Manage account settings & details",
          },
          {
            label: "My Orders",
            href: "/orders",
            icon: Package,
            desc: "Track shipments & order history",
          },
          {
            label: "My Wishlist",
            href: "/wishlist",
            icon: Bookmark,
            desc: "View saved products",
          },
        ]
      : []),
    ...(isAuthenticated && (user?.role === "Admin" || user?.role === "SuperAdmin")
      ? [
          {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            desc: "Manage products, coupons & users",
          },
        ]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-borderPrimary bg-bgSecondary/85 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo (+ Mobile Menu Trigger Button) */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Responsive Menu Button (Mobile only) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center justify-center p-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary text-xs font-bold transition-all shadow-sm group"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-9 w-24 sm:w-28 flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Nexo Logo"
                    priority
                    width={220}
                    height={220}
                    className="object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Wishlist Button (authenticated users only) */}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary transition-colors flex items-center justify-center"
                  aria-label="Open wishlist"
                  title="My Wishlist"
                >
                  <Bookmark className="w-5 h-5 text-textPrimary" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary transition-colors flex items-center justify-center"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5 text-textPrimary" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* User Auth Info / Links */}
              <div className="hidden sm:flex items-center gap-2">
                {isAuthenticated && user ? (
                  <div className="relative pl-2 border-l border-borderPrimary" ref={userMenuRef}>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-transparent hover:border-borderPrimary hover:bg-bgPrimary/60 transition-all">
                      {/* Clicking on avatar or name links directly to profile */}
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 group"
                        title="View & Edit Profile"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-black shadow-sm group-hover:scale-105 group-hover:border-primary transition-all">
                          {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col text-left">
                          <Text
                            size="xs"
                            font="bold"
                            className="leading-tight line-clamp-1 group-hover:text-primary transition-colors max-w-[120px]"
                          >
                            {user.fullName || user.username}
                          </Text>
                          <Text
                            size="xs"
                            color="secondary"
                            className="text-[10px] leading-none"
                          >
                            {user.role || "Member"}
                          </Text>
                        </div>
                      </Link>

                      {/* Dropdown toggle button */}
                      <button
                        onClick={() => setUserMenuOpen((prev) => !prev)}
                        className="p-1 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgSecondary transition-colors"
                        aria-label="Open user dropdown menu"
                        aria-expanded={userMenuOpen}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            userMenuOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Dropdown Menu Panel */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl border border-borderPrimary bg-bgSecondary p-2 shadow-2xl z-50 divide-y divide-borderPrimary"
                        >
                          {/* Header: Link to Profile */}
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bgPrimary transition-colors group mb-1.5"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                              {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-textPrimary truncate group-hover:text-primary transition-colors">
                                {user.fullName || user.username}
                              </p>
                              <p className="text-[10px] text-textSecondary truncate">{user.email}</p>
                              <span className="inline-block text-[10px] text-primary font-semibold mt-0.5">
                                Edit profile →
                              </span>
                            </div>
                          </Link>

                          {/* Menu Items */}
                          <div className="py-1.5 space-y-1">
                            {/* Profile Link */}
                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-primary" />
                              <span>My Profile</span>
                            </Link>

                            {/* Orders Link */}
                            <Link
                              href="/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                            >
                              <Package className="w-4 h-4 text-primary" />
                              <span>My Orders</span>
                            </Link>

                            {/* Wishlist Link */}
                            <Link
                              href="/wishlist"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                            >
                              <Bookmark className="w-4 h-4 text-primary" />
                              <span>My Wishlist</span>
                              {wishlistCount > 0 && (
                                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                                  {wishlistCount}
                                </span>
                              )}
                            </Link>

                            {/* Dashboard Link (if Admin or SuperAdmin) */}
                            {(user.role === "Admin" || user.role === "SuperAdmin") && (
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                <span>Dashboard</span>
                                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                                  Admin
                                </span>
                              </Link>
                            )}
                          </div>

                          {/* Logout Action */}
                          <div className="pt-1.5">
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-3.5 py-2 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textPrimary text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Navigation Sidebar Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-50"
              aria-hidden="true"
            />

            {/* Sidebar Panel (Slides in from the left) */}
            <motion.aside
              key="nav-sidebar"
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
              <div className="flex items-center justify-between px-6 py-5 border-b border-borderPrimary">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="relative h-8 w-24 flex items-center">
                    <Image
                      src="/logo.png"
                      alt="Nexo"
                      width={180}
                      height={180}
                      className="object-contain"
                    />
                  </div>
                </Link>

                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-3 mb-3">
                    Navigation
                  </p>
                  <nav className="space-y-1.5">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isActive
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-transparent hover:border-borderPrimary hover:bg-bgPrimary text-textPrimary"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`p-2 rounded-xl border ${
                                isActive
                                  ? "bg-primary text-black border-primary"
                                  : "bg-bgPrimary text-textSecondary border-borderPrimary group-hover:text-primary group-hover:border-primary/40"
                              } transition-colors`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold leading-tight">
                                {link.label}
                              </p>
                              <p className="text-[10px] text-textSecondary leading-tight mt-0.5">
                                {link.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                              isActive ? "text-primary" : "text-textSecondary"
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-textSecondary tracking-wider px-3 mb-3">
                    Quick Actions
                  </p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setCreateModalOpen(true);
                      }}
                      className="w-full group flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-borderPrimary hover:bg-bgPrimary text-textPrimary transition-all text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">
                            Create Product
                          </p>
                          <p className="text-[10px] text-textSecondary leading-tight mt-0.5">
                            Publish a new listing
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-textSecondary group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer / User Account */}
              <div className="p-5 border-t border-borderPrimary bg-bgPrimary/50 space-y-4">
                {isAuthenticated && user ? (
                  <div className="p-3.5 rounded-2xl border border-borderPrimary bg-bgPrimary flex items-center justify-between gap-3">
                    <Link
                      href="/profile"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                      title="View & Edit Profile"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-textPrimary truncate hover:text-primary transition-colors">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-[10px] text-textSecondary truncate">
                          {user.email}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setSidebarOpen(false);
                      }}
                      title="Sign Out"
                      className="p-2 rounded-xl text-textSecondary hover:text-textError hover:bg-textError/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setSidebarOpen(false)}
                      className="py-2.5 px-3 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold text-center transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setSidebarOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold text-center shadow-sm transition-all"
                    >
                      Join Nexo
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-textSecondary pt-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Nexo Certified Luxury</span>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Reusable Create Product Modal */}
      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
