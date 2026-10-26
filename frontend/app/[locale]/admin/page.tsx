"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import {
  Users,
  Package,
  Tag,
  TrendingUp,
  ArrowRight,
  ShoppingCart,
  Image as ImageIcon,
  LifeBuoy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCoupons } from "@/features/coupons/hooks/useCoupons";
import { useAdminOrderOverview } from "@/features/orders/hooks/useOrders";
import { useBannerOverview } from "@/features/banners/hooks/useBanners";
import { useTicketOverview } from "@/features/tickets/hooks/useTickets";

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
      className="group relative p-5 sm:p-6 rounded-2xl border border-borderPrimary bg-bgSecondary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col justify-between gap-4 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-textSecondary group-hover:text-primary group-hover:bg-primary/10 transition-all shrink-0">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight truncate">
          {value}
        </p>
        <p className="text-xs sm:text-sm text-textSecondary font-medium mt-1 truncate">
          {label}
        </p>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const t = useTranslations("admin");

  const { data: productsData } = useProducts({ limit: 1 });
  const { data: coupons } = useCoupons();
  const { data: orderOverview } = useAdminOrderOverview();
  const { data: bannerOverview } = useBannerOverview();
  const { data: ticketOverview } = useTicketOverview();

  const activeCoupons = coupons?.filter((c) => c.isActive).length ?? 0;
  const activeBanners = bannerOverview?.activeBanners ?? 0;
  const pendingOrders = orderOverview?.pendingOrders ?? 0;
  const openTickets = (ticketOverview?.openTickets ?? 0) + (ticketOverview?.inprogressTickets ?? 0);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
          {t("overviewTitle")}
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          {t("overviewSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          label={t("totalOrders")}
          value={orderOverview?.totalOrders ?? "—"}
          icon={ShoppingCart}
          href="/admin/orders"
          color="text-amber-400"
          bg="bg-amber-400/10 border border-amber-400/20"
        />
        <StatCard
          label={t("totalProducts")}
          value={productsData?.totalProducts ?? "—"}
          icon={Package}
          href="/admin/products"
          color="text-blue-400"
          bg="bg-blue-400/10 border border-blue-400/20"
        />
        <StatCard
          label={t("activeCoupons")}
          value={activeCoupons}
          icon={Tag}
          href="/admin/coupons"
          color="text-emerald-400"
          bg="bg-emerald-400/10 border border-emerald-400/20"
        />
        <StatCard
          label={t("activeBanners")}
          value={activeBanners}
          icon={ImageIcon}
          href="/admin/banners"
          color="text-primary"
          bg="bg-primary/10 border border-primary/20"
        />
        <StatCard
          label={t("totalBanners")}
          value={bannerOverview?.totalBanners ?? "—"}
          icon={TrendingUp}
          href="/admin/banners"
          color="text-purple-400"
          bg="bg-purple-400/10 border border-purple-400/20"
        />
        <StatCard
          label={t("openTickets")}
          value={openTickets}
          icon={LifeBuoy}
          href="/admin/tickets"
          color="text-rose-400"
          bg="bg-rose-400/10 border border-rose-400/20"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-3">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{t("orders")}</span>
            {pendingOrders > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                {pendingOrders}
              </span>
            )}
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <Package className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{t("products")}</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{t("users")}</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{t("coupons")}</span>
          </Link>
          <Link
            href="/admin/banners"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <ImageIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{t("banners")}</span>
          </Link>
          <Link
            href="/admin/tickets"
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-borderPrimary bg-bgSecondary hover:border-primary/40 transition-all text-sm font-semibold text-textPrimary hover:text-primary min-w-0"
          >
            <LifeBuoy className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{t("tickets")}</span>
            {openTickets > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-400/10 text-rose-400 border border-rose-400/20 shrink-0">
                {openTickets}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
