"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  MessageSquare,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Trash2,
  Package,
} from "lucide-react";
import {
  useTicketDetails,
  useAddTicketMessage,
  useUpdateTicket,
  useUpdateTicketStatus,
  useDeleteTicket,
} from "../hooks/useTickets";
import { TicketItem, TicketMessage, TicketStatus } from "../types/ticket.types";
import { useAppStore } from "@/store/use-app-store";

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  isAdminView?: boolean;
}

export function TicketDetailModal({
  ticketId,
  onClose,
  isAdminView = false,
}: TicketDetailModalProps) {
  const { data: ticket, isLoading } = useTicketDetails(ticketId);
  const addMessageMutation = useAddTicketMessage();
  const updateTicketMutation = useUpdateTicket();
  const updateTicketStatusMutation = useUpdateTicketStatus();
  const deleteTicketMutation = useDeleteTicket();
  const currentUser = useAppStore((s) => s.user);

  const [replyText, setReplyText] = useState("");

  if (!ticketId) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticketId) return;

    await addMessageMutation.mutateAsync({
      id: ticketId,
      content: replyText.trim(),
    });
    setReplyText("");
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId) return;
    if (isAdminView) {
      await updateTicketStatusMutation.mutateAsync({
        id: ticketId,
        status: newStatus,
      });
    } else {
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        data: { status: newStatus },
      });
    }
  };

  const handleDelete = async () => {
    if (!ticketId) return;
    if (confirm("Are you sure you want to delete this ticket?")) {
      await deleteTicketMutation.mutateAsync(ticketId);
      onClose();
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-borderPrimary bg-bgSecondary shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-borderPrimary bg-bgPrimary/40 flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                    ticket?.status || "open"
                  )}`}
                >
                  {ticket?.status?.replace("_", " ")}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadge(
                    ticket?.priority || "Medium"
                  )}`}
                >
                  {ticket?.priority} Priority
                </span>
                <span className="text-[10px] font-medium text-textSecondary uppercase px-2 py-0.5 rounded-full bg-bgPrimary border border-borderPrimary">
                  {ticket?.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-textPrimary truncate">
                {ticket?.subject || "Loading Ticket..."}
              </h2>
              {ticket?.order && (
                <p className="text-[11px] text-textSecondary flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  Order: <span className="font-mono text-textPrimary">{ticket.order}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                title="Delete Ticket"
                className="p-1.5 rounded-lg text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick status bar for Admin or Owner */}
          <div className="px-5 py-2.5 bg-bgPrimary/20 border-b border-borderPrimary flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-textSecondary">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Opened:{" "}
                {ticket?.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "..."}
              </span>
            </div>

            {/* Change status control */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-textSecondary">Status:</span>
              <select
                value={ticket?.status || "open"}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="text-[11px] font-semibold bg-bgPrimary border border-borderPrimary rounded-lg px-2 py-1 text-textPrimary focus:outline-none focus:border-primary"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-textSecondary">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Loading conversation...</p>
              </div>
            ) : ticket?.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((msg: any, idx: number) => {
                const isMsgObject = typeof msg === "object" && msg !== null;
                const senderObj = isMsgObject ? msg.sender : null;
                const isStaff =
                  senderObj?.role === "Admin" || senderObj?.role === "SuperAdmin";
                const isMe =
                  (senderObj?._id && senderObj._id === currentUser?._id) ||
                  (!isStaff && !isAdminView);

                const senderName = isMsgObject
                  ? `${senderObj?.firstName || ""} ${senderObj?.lastName || ""}`.trim() ||
                    (isStaff ? "Support Staff" : "User")
                  : "Message";

                return (
                  <div
                    key={isMsgObject ? msg._id || idx : idx}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-textSecondary">
                      {isStaff ? (
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <ShieldCheck className="w-3 h-3" />
                          {senderName} (Support)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-textPrimary">
                          <User className="w-3 h-3" />
                          {senderName}
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        {isMsgObject && msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isMe
                          ? "bg-primary text-white rounded-br-xs"
                          : isStaff
                          ? "bg-primary/10 border border-primary/20 text-textPrimary rounded-bl-xs"
                          : "bg-bgPrimary border border-borderPrimary text-textPrimary rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {isMsgObject ? msg.content : typeof msg === "string" ? msg : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-textSecondary text-xs">
                No messages recorded in this ticket yet.
              </div>
            )}
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleSendReply}
            className="p-4 border-t border-borderPrimary bg-bgPrimary/30 flex items-center gap-3"
          >
            <input
              type="text"
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                ticket?.status === "closed"
                  ? "This ticket is closed. Sending a message will notify support."
                  : "Write your reply or inquiry..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={addMessageMutation.isPending || !replyText.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{addMessageMutation.isPending ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
