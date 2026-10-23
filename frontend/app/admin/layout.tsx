"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
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
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Tickets", href: "/admin/tickets", icon: LifeBuoy },
];

function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAppStore();
  const router = useRouter();

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
          "fixed top-0 left-0 h-screen w-64 bg-bgSecondary border-r border-borderPrimary z-40 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-borderPrimary">
          <div>
            <span className="text-lg font-black text-primary tracking-tight">
              NEXO
            </span>
            <p className="text-[10px] text-textSecondary font-semibold uppercase tracking-widest mt-0.5">
              Admin Panel
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
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-primary">
                {user?.fullName?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-textPrimary truncate">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-textSecondary truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
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
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-borderPrimary">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
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
  const { user, isAuthenticated } = useAppStore();
  const router = useRouter();

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

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-borderPrimary bg-bgSecondary sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-textPrimary">Dashboard</span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
