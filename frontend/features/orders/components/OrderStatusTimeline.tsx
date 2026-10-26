"use client";

import React, { useState } from "react";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
} from "lucide-react";
import { Order, IOrderStatusHistory } from "../types/order.types";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  order: Order;
  className?: string;
  defaultExpanded?: boolean;
}

const STEPS = [
  {
    status: "Pending",
    label: "Order Placed",
    description: "We have received your order",
    icon: Clock,
  },
  {
    status: "Processing",
    label: "Processing",
    description: "Preparing your package",
    icon: Package,
  },
  {
    status: "Shipped",
    label: "On the Way",
    description: "Handed over to delivery courier",
    icon: Truck,
  },
  {
    status: "Delivered",
    label: "Delivered",
    description: "Package received safely",
    icon: CheckCircle2,
  },
] as const;

function formatDateTime(dateStr?: string | Date) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function OrderStatusTimeline({
  order,
  className,
  defaultExpanded = false,
}: OrderStatusTimelineProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const currentStatus = order.orderStatus?.status || "Pending";
  const isCancelled = currentStatus === "Cancelled";

  // Compute step indices for normal flow
  const statusOrder = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentStepIndex = statusOrder.indexOf(currentStatus);

  // Compile history entries: if statusHistory has records, use them sorted ascending
  const historyList: IOrderStatusHistory[] =
    order.statusHistory && order.statusHistory.length > 0
      ? [...order.statusHistory].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
      : [
          {
            status: order.orderStatus?.status || "Pending",
            timestamp: order.createdAt,
            note: "Order placed successfully",
          },
        ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-borderPrimary bg-bgPrimary/50 p-4 sm:p-5 space-y-4",
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-textPrimary tracking-tight uppercase">
            Order Tracking & Status History
          </h4>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 transition-colors"
        >
          <span>{expanded ? "Hide Details" : "View Timeline"}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Cancelled Banner */}
      {isCancelled ? (
        <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 flex items-center gap-3 text-red-500">
          <XCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">This order was Cancelled</span>
            <span className="text-[11px] text-red-400">
              {order.orderStatus?.updatedAt
                ? `Updated on ${formatDateTime(order.orderStatus.updatedAt)}`
                : "No further action is required."}
            </span>
          </div>
        </div>
      ) : (
        /* Progress Stepper for Normal Order Flow */
        <div className="relative pt-2 pb-1">
          {/* Connector Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-borderPrimary hidden sm:block -z-0" />
          <div
            className="absolute top-6 left-6 h-0.5 bg-primary hidden sm:block transition-all duration-500 -z-0"
            style={{
              width: `calc(${
                currentStepIndex <= 0
                  ? 0
                  : (currentStepIndex / (STEPS.length - 1)) * 100
              }% - 3rem)`,
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.status}
                  className="flex flex-col items-start sm:items-center text-left sm:text-center group"
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 mb-2 shrink-0",
                      isCompleted &&
                        "bg-primary border-primary text-white dark:text-black shadow-sm",
                      isCurrent &&
                        "bg-primary/20 border-primary text-primary ring-4 ring-primary/10 shadow-sm animate-pulse",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-bgSecondary border-borderPrimary text-textSecondary",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors",
                      isCurrent ? "text-primary" : "text-textPrimary",
                    )}
                  >
                    {step.label}
                  </span>

                  {/* Short Subtitle */}
                  <span className="text-[10px] text-textSecondary mt-0.5 hidden sm:block max-w-[120px] leading-tight">
                    {step.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Detailed Activity Log */}
      {expanded && (
        <div className="pt-3 border-t border-borderPrimary space-y-3 animate-in fade-in duration-200">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block">
            Activity Timeline ({historyList.length}{" "}
            {historyList.length === 1 ? "entry" : "entries"})
          </span>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-borderPrimary">
            {historyList.map((entry, idx) => {
              const isLast = idx === historyList.length - 1;
              return (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <span
                    className={cn(
                      "absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-bgSecondary transition-colors",
                      isLast
                        ? "border-primary bg-primary"
                        : "border-borderPrimary group-hover:border-primary/50",
                    )}
                  />

                  <div className="rounded-xl border border-borderPrimary bg-bgSecondary/60 p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-textPrimary flex items-center gap-2">
                        <span>Status changed to:</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide",
                            entry.status === "Delivered" &&
                              "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                            entry.status === "Shipped" &&
                              "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                            entry.status === "Processing" &&
                              "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                            entry.status === "Pending" &&
                              "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                            entry.status === "Cancelled" &&
                              "bg-red-500/10 text-red-500 border border-red-500/20",
                          )}
                        >
                          {entry.status}
                        </span>
                      </span>

                      <span className="text-[10px] text-textSecondary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDateTime(entry.timestamp)}</span>
                      </span>
                    </div>

                    {/* Note if added by admin */}
                    {entry.note && (
                      <div className="text-xs text-textSecondary bg-bgPrimary/70 rounded-lg p-2 mt-1.5 border border-borderPrimary flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="italic leading-relaxed">
                          &quot;{entry.note}&quot;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
