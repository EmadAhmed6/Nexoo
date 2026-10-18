"use client";

import React from "react";
import Link from "next/link";
import { Users, Package, Tag, TrendingUp, ArrowRight, ShoppingCart } from "lucide-react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCoupons } from "@/features/coupons/hooks/useCoupons";
import { useAdminOrderOverview } from "@/features/orders/hooks/useOrders";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, href, color, bg }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-2xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all duration-200 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black text-textPrimary">{value}</p>
        <p className="text-xs text-textSecondary font-medium">{label}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default function AdminPage() {
  const { data: productsData } = useProducts({ limit: 1 });
  const { data: coupons } = useCoupons();
  const { data: orderOverview } = useAdminOrderOverview();

  const activeCoupons = coupons?.filter((c) => c.isActive).length ?? 0;
  const pendingOrders = orderOverview?.pendingOrders ?? 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          Manage your store — orders, users, products, and coupons from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={orderOverview?.totalOrders ?? "—"}
          icon={ShoppingCart}
          href="/admin/orders"
          color="text-amber-400"
          bg="bg-amber-400/10 border border-amber-400/20"
        />
        <StatCard
          label="Total Products"
          value={productsData?.totalProducts ?? "—"}
          icon={Package}
          href="/admin/products"
          color="text-blue-400"
          bg="bg-blue-400/10 border border-blue-400/20"
        />
        <StatCard
          label="Active Coupons"
          value={activeCoupons}
          icon={Tag}
          href="/admin/coupons"
          color="text-primary"
          bg="bg-primary/10 border border-primary/20"
        />
        <StatCard
          label="Total Coupons"
          value={coupons?.length ?? "—"}
          icon={TrendingUp}
          href="/admin/coupons"
          color="text-emerald-400"
          bg="bg-emerald-400/10 border border-emerald-400/20"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>Manage Orders</span>
            {pendingOrders > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {pendingOrders} new
              </span>
            )}
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary"
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>Manage Products</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="flex items-center gap-3 p-4 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Manage Coupons</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
