"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Plus, LogOut, UserPlus, Menu, X } from "lucide-react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAppStore } from "@/store/use-app-store";
import { ThemeToggle } from "@/_components/theme-toggle";
import { Text } from "@/_components/shared/Text";
import { CreateProductModal } from "@/features/products/components/CreateProductModal";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { openCart } = useCartStore();
  const { data: cart } = useCart();
  const { user, isAuthenticated, logout } = useAppStore();

  const totalCartItems =
    cart?.cartItems?.reduce((acc, item) => acc + item.productQuantity, 0) ?? 0;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/#products" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-borderPrimary bg-bgSecondary/85 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-10 w-28 sm:w-32 flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Nexo Logo"
                    priority
                    width={250}
                    height={250}
                  />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? "text-primary font-bold"
                          : "text-textSecondary hover:text-textPrimary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Add Product Button */}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                title="Add New Product"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

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
                  <div className="flex items-center gap-2.5 pl-2 border-l border-borderPrimary">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col text-left">
                        <Text
                          size="xs"
                          font="bold"
                          className="leading-tight line-clamp-1"
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
                    </div>

                    <button
                      onClick={logout}
                      className="p-2 rounded-xl text-textSecondary hover:text-textError hover:bg-bgPrimary transition-colors"
                      title="Sign Out"
                      aria-label="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
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

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary md:hidden text-textPrimary"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-borderPrimary bg-bgSecondary px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-textPrimary hover:bg-bgPrimary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-borderPrimary flex flex-col gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-bgPrimary">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-textPrimary">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] text-textSecondary">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-textError hover:bg-textError/10 rounded-lg text-xs flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-borderPrimary text-textPrimary text-xs font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary text-black text-xs font-bold"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Reusable Create Product Modal */}
      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
