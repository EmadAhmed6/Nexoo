"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Tag,
  ArrowLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { useMyTickets } from "@/features/tickets/hooks/useTickets";
import { TicketItem, TicketStatus } from "@/features/tickets/types/ticket.types";
import { CreateTicketModal } from "@/features/tickets/components/CreateTicketModal";
import { TicketDetailModal } from "@/features/tickets/components/TicketDetailModal";

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const { tickets, isLoading, openCount } = useMyTickets();

  const [activeTab, setActiveTab] = useState<"all" | TicketStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const filteredTickets = tickets.filter((t) => {
    if (activeTab !== "all" && t.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchOrder = t.order?.toLowerCase().includes(q);
      return matchSub || matchCat || matchOrder;
    }
    return true;
  });

  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "closed":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "text-red-500 bg-red-500/10";
      case "High":
        return "text-orange-500 bg-orange-500/10";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "Low":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-textSecondary bg-bgPrimary";
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </button>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-borderPrimary bg-gradient-to-br from-bgSecondary via-bgSecondary/80 to-primary/5 p-6 sm:p-8">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Customer Help & Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
              Support Tickets
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              Have questions about your order, shipping, or payment? Create a ticket and chat directly with our support team to get everything sorted out quickly.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 pt-6 border-t border-borderPrimary grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-bgPrimary/60 border border-borderPrimary p-3.5">
              <p className="text-[11px] font-semibold text-textSecondary">Total Inquiries</p>
              <p className="text-lg sm:text-2xl font-black text-textPrimary mt-0.5">
                {tickets.length}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-3.5">
              <p className="text-[11px] font-semibold text-blue-500">Active / Open</p>
              <p className="text-lg sm:text-2xl font-black text-blue-500 mt-0.5">
                {openCount}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-3.5">
              <p className="text-[11px] font-semibold text-emerald-500">Resolved</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-500 mt-0.5">
                {resolvedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { label: "All Tickets", value: "all" },
                { label: "Open", value: "open" },
                { label: "In Progress", value: "in_progress" },
                { label: "Resolved", value: "resolved" },
                { label: "Closed", value: "closed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-bgSecondary text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/80 border border-borderPrimary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-textSecondary absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by subject..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-borderPrimary bg-bgSecondary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-textSecondary">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading your support tickets...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                onClick={() => setSelectedTicketId(ticket._id)}
                whileHover={{ y: -2 }}
                className="group relative cursor-pointer rounded-2xl border border-borderPrimary bg-bgSecondary p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadge(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority} Priority
                      </span>
                      <span className="text-[10px] font-medium text-textSecondary uppercase px-2 py-0.5 rounded-full bg-bgPrimary border border-borderPrimary">
                        {ticket.category}
                      </span>
                      {ticket.order && (
                        <span className="text-[10px] text-textSecondary flex items-center gap-1 font-mono">
                          <Package className="w-3 h-3 text-primary" />
                          Order: {ticket.order.slice(-6)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors truncate">
                      {ticket.subject}
                    </h3>

                    <div className="flex items-center gap-4 text-[11px] text-textSecondary">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        {ticket.messages?.length || 1} message
                        {(ticket.messages?.length || 1) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex items-center gap-2 sm:self-center">
                    <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Thread <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            /* Empty State */
            <div className="py-16 rounded-3xl border border-dashed border-borderPrimary bg-bgSecondary/40 text-center flex flex-col items-center justify-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-textPrimary">No tickets found</h3>
              <p className="text-xs text-textSecondary max-w-sm">
                {searchQuery
                  ? "No support tickets match your search criteria. Try modifying your query."
                  : "You don't have any support tickets currently. Need assistance? Open a new ticket anytime."}
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Support Ticket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        isAdminView={false}
      />
    </div>
  );
}
