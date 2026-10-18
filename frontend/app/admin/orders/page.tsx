"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Loader2,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  MapPin,
  Calendar,
  X,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Filter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminOrders,
  useAdminOrderOverview,
  useUpdateAdminOrderStatus,
} from "@/features/orders/hooks/useOrders";
import {
  Order,
  IOrderUser,
  AdminOrderFilterParams,
} from "@/features/orders/types/order.types";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  Pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    icon: Clock,
  },
  Processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: Package,
  },
  Shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: CheckCircle,
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
};

const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchField, setSearchField] = useState<
    "all" | "customerName" | "orderId" | "email" | "phone"
  >("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce search and price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
    }, 400);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 400);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  // Reset page to 1 whenever any filter or search changes
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    searchField,
    filterStatus,
    filterPayment,
    debouncedMinPrice,
    debouncedMaxPrice,
    limit,
  ]);

  // Construct query parameters for server-side filtering & pagination
  const queryParams: AdminOrderFilterParams = useMemo(() => {
    const params: AdminOrderFilterParams = {
      page,
      limit,
    };

    if (filterStatus && filterStatus !== "all") {
      params.orderStatus = filterStatus;
    }

    if (filterPayment === "paid") {
      params.isPaid = true;
    } else if (filterPayment === "unpaid") {
      params.isPaid = false;
    }

    const trimmed = debouncedSearch.trim();
    if (trimmed) {
      if (searchField === "orderId") {
        params.orderId = trimmed;
      } else if (searchField === "customerName") {
        params.customerName = trimmed;
      } else if (searchField === "email") {
        params.email = trimmed;
      } else if (searchField === "phone") {
        params.phone = trimmed;
      } else {
        // Smart automatic field matching
        if (trimmed.includes("@")) {
          params.email = trimmed;
        } else if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
          params.orderId = trimmed;
        } else if (/^\+?[0-9]{8,15}$/.test(trimmed)) {
          params.phone = trimmed;
        } else {
          params.customerName = trimmed;
        }
      }
    }

    if (debouncedMinPrice && !isNaN(Number(debouncedMinPrice))) {
      params.minPrice = Number(debouncedMinPrice);
    }
    if (debouncedMaxPrice && !isNaN(Number(debouncedMaxPrice))) {
      params.maxPrice = Number(debouncedMaxPrice);
    }

    return params;
  }, [
    page,
    limit,
    filterStatus,
    filterPayment,
    debouncedSearch,
    searchField,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  const {
    data: orders,
    isLoading,
    isFetching,
  } = useAdminOrders(queryParams);
  const { data: overview } = useAdminOrderOverview();
  const updateStatusMutation = useUpdateAdminOrderStatus();

  // Server-side filtered orders
  const displayedOrders = useMemo(() => orders || [], [orders]);

  const hasActiveFilters = Boolean(
    search ||
      filterStatus !== "all" ||
      filterPayment !== "all" ||
      minPrice ||
      maxPrice ||
      searchField !== "all" ||
      page > 1,
  );

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSearchField("all");
    setFilterStatus("all");
    setFilterPayment("all");
    setMinPrice("");
    setDebouncedMinPrice("");
    setMaxPrice("");
    setDebouncedMaxPrice("");
    setShowPriceFilter(false);
    setPage(1);
  };

  const getStatusCount = (st: string) => {
    if (!overview) return undefined;
    switch (st) {
      case "Pending":
        return overview.pendingOrders;
      case "Processing":
        return overview.processingOrders;
      case "Delivered":
        return overview.deliveredOrders ?? overview.DeliveredOrders;
      case "Cancelled":
        return overview.cancelledOrders;
      default:
        return undefined;
    }
  };

  // Known total count from overview when no free-form text or price filters are active
  const totalCount = useMemo(() => {
    if (!overview) return undefined;
    if (debouncedSearch.trim() || debouncedMinPrice || debouncedMaxPrice) {
      return undefined;
    }
    if (filterStatus === "all" && filterPayment === "all") {
      return overview.totalOrders;
    }
    if (filterStatus !== "all" && filterPayment === "all") {
      return getStatusCount(filterStatus);
    }
    return undefined;
  }, [
    overview,
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    filterStatus,
    filterPayment,
  ]);

  const totalPages =
    totalCount !== undefined
      ? Math.max(1, Math.ceil(totalCount / limit))
      : undefined;

  const handleQuickStatusChange = async (
    orderId: string,
    newStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        payload: { orderStatus: newStatus },
      });
      toast.success(`Order status changed to ${newStatus}`);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: {
                  ...prev.orderStatus,
                  status: newStatus,
                  isDelivered: newStatus === "Delivered",
                },
              }
            : null,
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Monitor, fulfill and update customer orders across the platform
          </p>
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating results...</span>
          </div>
        )}
      </div>

      {/* Metrics Row (Powered by getOrderOverview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Total Orders</p>
              <p className="text-xl font-black text-textPrimary">
                {overview?.totalOrders ?? (orders ? orders.length : "—")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Pending Orders</p>
              <p className="text-xl font-black text-amber-400">
                {overview?.pendingOrders ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Delivered</p>
              <p className="text-xl font-black text-emerald-400">
                {overview?.deliveredOrders ?? overview?.DeliveredOrders ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-borderPrimary bg-bgSecondary">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-textSecondary font-medium">Paid Volume</p>
              <p className="text-xl font-black text-textPrimary">
                {overview?.totalPaidAmount !== undefined
                  ? `${overview.totalPaidAmount.toLocaleString()} EGP`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Server Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Target field selector */}
          <div className="flex items-center">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">Auto-detect Field</option>
              <option value="customerName">Customer Name</option>
              <option value="orderId">Order ID</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                searchField === "orderId"
                  ? "Search by Order ID (24-character ID)..."
                  : searchField === "customerName"
                    ? "Search by Customer Name / Username..."
                    : searchField === "email"
                      ? "Search by Customer Email..."
                      : searchField === "phone"
                        ? "Search by Phone number..."
                        : "Search by customer name, order ID, email, or phone..."
              }
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPriceFilter((prev) => !prev)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              showPriceFilter || minPrice || maxPrice
                ? "border-primary bg-primary/10 text-primary"
                : "border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Price Range</span>
            {(minPrice || maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          {/* Payment filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 rounded-xl border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textError hover:border-textError/40 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible Price Range inputs */}
        {showPriceFilter && (
          <div className="p-3 rounded-xl border border-borderPrimary bg-bgPrimary/60 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
            <span className="font-semibold text-textSecondary flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Price Bounds (EGP):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price"
                className="w-28 px-2.5 py-1.5 rounded-lg border border-borderPrimary bg-bgSecondary text-textPrimary text-xs focus:outline-none focus:border-primary"
              />
              <span className="text-textSecondary">—</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price"
                className="w-28 px-2.5 py-1.5 rounded-lg border border-borderPrimary bg-bgSecondary text-textPrimary text-xs focus:outline-none focus:border-primary"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-[11px] text-textSecondary hover:text-textError underline"
              >
                Clear price
              </button>
            )}
          </div>
        )}

        {/* Status Filter Chips with Overview Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-primary text-black shadow-sm"
                : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
            }`}
          >
            All ({overview?.totalOrders ?? orders?.length ?? 0})
          </button>
          {ORDER_STATUS_OPTIONS.map((st) => {
            const overviewCount = getStatusCount(st);
            const fallbackCount =
              orders?.filter((o) => o.orderStatus?.status === st).length ?? 0;
            const count = overviewCount !== undefined ? overviewCount : fallbackCount;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-primary text-black shadow-sm"
                    : "border border-borderPrimary bg-bgSecondary text-textSecondary hover:text-textPrimary"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm text-textSecondary">Loading orders...</span>
          </div>
        ) : !displayedOrders.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingCart className="w-10 h-10 text-textSecondary" strokeWidth={1.5} />
            <p className="text-sm text-textSecondary font-medium">No orders found</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borderPrimary bg-bgPrimary/50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Total (EGP)
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderPrimary">
                {displayedOrders.map((order) => {
                  const status =
                    STATUS_CONFIG[order.orderStatus?.status] || STATUS_CONFIG.Pending;
                  const StatusIcon = status.icon;
                  const user =
                    typeof order.user === "object"
                      ? (order.user as IOrderUser)
                      : null;
                  const orderDate = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  );

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-bgPrimary/30 transition-colors"
                    >
                      {/* Order ID & Date */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono font-bold text-xs text-primary hover:underline"
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </button>
                          <div className="flex items-center gap-1 text-[11px] text-textSecondary">
                            <Calendar className="w-3 h-3" />
                            <span>{orderDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-primary">
                              {user?.fullName?.[0]?.toUpperCase() ?? "U"}
                            </span>
                          </div>
                          <div className="min-w-0 max-w-[150px]">
                            <p className="font-semibold text-textPrimary text-xs truncate">
                              {user?.fullName || "Guest Customer"}
                            </p>
                            <p className="text-[10.5px] text-textSecondary truncate">
                              {user?.email || order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.orderItems.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="relative w-6 h-6 rounded-md border border-borderPrimary bg-bgPrimary overflow-hidden"
                              >
                                <Image
                                  src={
                                    item.productImage?.[0]?.url ||
                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60"
                                  }
                                  alt={item.productTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-textSecondary font-medium">
                            {order.orderItems.reduce(
                              (sum, i) => sum + i.productQuantity,
                              0,
                            )}{" "}
                            items
                          </span>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-textPrimary text-xs">
                          {order.pricing?.totalOrderPrice?.toFixed(2)} EGP
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                              order.payment.isPaid
                                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                                : "bg-amber-400/10 border-amber-400/30 text-amber-400"
                            }`}
                          >
                            <CreditCard className="w-3 h-3" />
                            {order.payment.isPaid ? "Paid" : "Unpaid"}
                          </span>
                          <p className="text-[10px] text-textSecondary font-medium">
                            {order.payment.paymentMethod}
                          </p>
                        </div>
                      </td>

                      {/* Order Status with Quick Change */}
                      <td className="px-4 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus.status}
                            disabled={updateStatusMutation.isPending}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                order._id,
                                e.target.value as any,
                              )
                            }
                            className={`appearance-none pl-6 pr-6 py-1 rounded-full border text-xs font-bold cursor-pointer focus:outline-none transition-all ${status.bg} ${status.color}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-bgSecondary text-textPrimary">
                                {st}
                              </option>
                            ))}
                          </select>
                          <StatusIcon className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${status.color}`} />
                          <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${status.color}`} />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 hover:text-primary text-textSecondary text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {displayedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-xs text-textSecondary">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-borderPrimary bg-bgSecondary text-xs text-textPrimary font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            {totalCount !== undefined ? (
              <span className="ml-2 font-medium">
                Showing {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, totalCount)} of {totalCount} orders
              </span>
            ) : (
              <span className="ml-2 font-medium">
                Page {page} ({displayedOrders.length} orders on this page)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading || isFetching}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textSecondary hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 rounded-lg bg-bgSecondary border border-borderPrimary text-xs font-bold text-textPrimary min-w-[32px] text-center shadow-sm">
              {totalPages !== undefined ? `${page} / ${totalPages}` : page}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={
                isLoading ||
                isFetching ||
                (totalPages !== undefined
                  ? page >= totalPages
                  : displayedOrders.length < limit)
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textSecondary hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleQuickStatusChange}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}

// ── ORDER DETAILS MODAL ──────────────────────────────────────────────────────────
function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
  ) => Promise<void>;
  isUpdating: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus.status);
  const user = typeof order.user === "object" ? (order.user as IOrderUser) : null;
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
  const StatusIcon = status.icon;

  if (!isOpen) return null;

  const handleSaveStatus = async () => {
    if (currentStatus === order.orderStatus.status) {
      toast.info("Status unchanged");
      return;
    }
    await onUpdateStatus(order._id, currentStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderPrimary">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg text-primary">
                #{order._id.slice(-8).toUpperCase()}
              </span>
              <div
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${status.bg} ${status.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{order.orderStatus.status}</span>
              </div>
            </div>
            <p className="text-xs text-textSecondary mt-0.5">
              Full Order ID: <span className="font-mono">{order._id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change Status Control Box */}
        <div className="p-4 rounded-xl border border-borderPrimary bg-bgPrimary/60 space-y-3">
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider">
            Update Order Status
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as any)}
              className="flex-1 px-3 py-2 rounded-xl border border-borderPrimary bg-bgSecondary text-xs font-semibold text-textPrimary focus:outline-none focus:border-primary transition-colors"
            >
              {ORDER_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={isUpdating || currentStatus === order.orderStatus.status}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Status</span>
            </button>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer Info */}
          <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-textPrimary">
              <UserIcon className="w-3.5 h-3.5 text-primary" />
              <span>Customer Information</span>
            </div>
            <div className="space-y-1 text-textSecondary">
              <p>
                <strong className="text-textPrimary">Name:</strong>{" "}
                {user?.fullName || "N/A"}
              </p>
              <p>
                <strong className="text-textPrimary">Email:</strong>{" "}
                {user?.email || "N/A"}
              </p>
              {user?.username && (
                <p>
                  <strong className="text-textPrimary">Username:</strong> @
                  {user.username}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-3.5 rounded-xl border border-borderPrimary bg-bgPrimary space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-textPrimary">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Shipping Address</span>
            </div>
            <div className="space-y-1 text-textSecondary">
              <p>
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}
              </p>
              <p>
                {order.shippingAddress.country}{" "}
                {order.shippingAddress.postalCode &&
                  `(${order.shippingAddress.postalCode})`}
              </p>
              <p>
                <strong className="text-textPrimary">Phone:</strong>{" "}
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
            Order Items ({order.orderItems.length})
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {order.orderItems.map((item, idx) => {
              const imgUrl =
                item.productImage?.[0]?.url ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60";
              const productId =
                typeof item.product === "object"
                  ? item.product?._id
                  : item.product;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-borderPrimary bg-bgSecondary flex-shrink-0">
                    <Image
                      src={imgUrl}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-textPrimary truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-[11px] text-textSecondary">
                      Qty: {item.productQuantity} × {item.productPrice.toFixed(2)} EGP
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-textPrimary">
                      {(item.productQuantity * item.productPrice).toFixed(2)} EGP
                    </span>
                    {productId && (
                      <Link
                        href={`/products/${productId}`}
                        target="_blank"
                        className="p-1 rounded-md text-textSecondary hover:text-primary transition-colors"
                        title="View product"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-xl border border-borderPrimary bg-bgPrimary/80 space-y-2 text-xs">
          <div className="flex justify-between text-textSecondary">
            <span>Items Subtotal:</span>
            <span>{order.pricing?.itemsPrice?.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Shipping:</span>
            <span>{order.pricing?.shippingPrice?.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Tax:</span>
            <span>{order.pricing?.taxPrice?.toFixed(2)} EGP</span>
          </div>
          {Boolean(order.pricing?.discountPrice && order.pricing.discountPrice > 0) && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Coupon Discount:</span>
              <span>-{(order.pricing?.discountPrice ?? 0).toFixed(2)} EGP</span>
            </div>
          )}
          <div className="border-t border-borderPrimary pt-2 flex justify-between font-black text-sm text-textPrimary">
            <span>Total:</span>
            <span className="text-primary">
              {order.pricing?.totalOrderPrice?.toFixed(2)} EGP
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-borderPrimary hover:bg-bgPrimary text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
