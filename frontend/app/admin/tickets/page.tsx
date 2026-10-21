"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Clock,
  User,
  ShieldAlert,
  ChevronRight,
  Trash2,
  Package,
  AlertTriangle,
  Mail,
  CheckCircle2,
} from "lucide-react";
import {
  useAllTickets,
  useUpdateTicketStatus,
  useDeleteTicket,
} from "@/features/tickets/hooks/useTickets";
import { TicketItem, TicketStatus } from "@/features/tickets/types/ticket.types";
import { TicketDetailModal } from "@/features/tickets/components/TicketDetailModal";

export default function AdminTicketsPage() {
  const { tickets, isLoading } = useAllTickets();
  const updateTicketStatusMutation = useUpdateTicketStatus();
  const deleteTicketMutation = useDeleteTicket();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const userObj = typeof t.user === "object" ? t.user : null;
      const matchUser =
        userObj?.email?.toLowerCase().includes(q) ||
        userObj?.firstName?.toLowerCase().includes(q) ||
        userObj?.lastName?.toLowerCase().includes(q);
      return matchSubject || matchUser;
    }
    return true;
  });

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  const handleStatusChange = async (
    e: React.MouseEvent,
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    e.stopPropagation();
    await updateTicketStatusMutation.mutateAsync({
      id: ticketId,
      status: newStatus,
    });
  };

  const handleDelete = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this ticket?")) {
      await deleteTicketMutation.mutateAsync(ticketId);
    }
  };

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textPrimary flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" />
            <span>Support Tickets Management</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Review customer inquiries, reply as support staff, and update resolution statuses.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-4">
          <p className="text-xs font-semibold text-textSecondary">Total Tickets</p>
          <p className="text-2xl font-black text-textPrimary mt-1">{tickets.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs font-semibold text-blue-500">Open Tickets</p>
          <p className="text-2xl font-black text-blue-500 mt-1">{openTickets}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold text-amber-500">In Progress</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{inProgressTickets}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold text-emerald-500">Resolved</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{resolvedTickets}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-bgSecondary p-3 rounded-2xl border border-borderPrimary">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { label: "All", value: "all" },
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in_progress" },
              { label: "Resolved", value: "resolved" },
              { label: "Closed", value: "closed" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-textSecondary hover:text-textPrimary hover:bg-bgPrimary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-textSecondary absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer or subject..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-textSecondary">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading support tickets...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const userObj = typeof ticket.user === "object" ? ticket.user : null;
            const userName = userObj
              ? `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || userObj.email
              : "User";

            return (
              <motion.div
                key={ticket._id}
                onClick={() => setSelectedTicketId(ticket._id)}
                whileHover={{ y: -1 }}
                className="cursor-pointer rounded-2xl border border-borderPrimary bg-bgSecondary p-4 sm:p-5 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Ticket & User info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
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
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] font-medium text-textSecondary uppercase px-2 py-0.5 rounded-full bg-bgPrimary border border-borderPrimary">
                        {ticket.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-textPrimary truncate">
                      {ticket.subject}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-textSecondary">
                      <span className="flex items-center gap-1 font-semibold text-textPrimary">
                        <User className="w-3 h-3 text-primary" />
                        {userName}
                      </span>
                      {userObj?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {userObj.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        {ticket.messages?.length || 1} msg
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 lg:self-center">
                    <select
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(
                          e as any,
                          ticket._id,
                          e.target.value as TicketStatus
                        )
                      }
                      className="text-xs font-semibold bg-bgPrimary border border-borderPrimary rounded-xl px-2.5 py-1.5 text-textPrimary focus:outline-none focus:border-primary"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      onClick={(e) => handleDelete(e, ticket._id)}
                      title="Delete Ticket"
                      className="p-2 rounded-xl text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all">
                      <span>Thread</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-16 text-center text-textSecondary text-xs rounded-2xl border border-dashed border-borderPrimary">
            No support tickets found matching the filter.
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        isAdminView={true}
      />
    </div>
  );
}
