"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, HelpCircle, Tag, AlertTriangle } from "lucide-react";
import { useCreateTicket } from "../hooks/useTickets";
import { TicketCategory, TicketPriority } from "../types/ticket.types";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("product");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState("");

  const createTicketMutation = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    await createTicketMutation.mutateAsync({
      subject: subject.trim(),
      category,
      priority,
      message: message.trim(),
      order: order.trim() || undefined,
    });

    // Reset and close
    setSubject("");
    setMessage("");
    setOrder("");
    setCategory("product");
    setPriority("Medium");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl border border-borderPrimary bg-bgSecondary p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-borderPrimary pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-textPrimary">Create Support Ticket</h3>
                <p className="text-xs text-textSecondary">Describe your issue and we'll help you promptly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Delay in order delivery or item damaged"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category & Priority grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="payment">Payment & Billing</option>
                    <option value="product">Product Issue</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                  <Tag className="w-3.5 h-3.5 text-textSecondary absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <AlertTriangle className="w-3.5 h-3.5 text-textSecondary absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Optional Order ID */}
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1">
                Order ID <span className="text-textSecondary font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="e.g., 664fa1e2b5c7e1234567890b"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1">
                Detailed Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                minLength={3}
                maxLength={1000}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the problem in detail with any specifics that can help us resolve it quickly..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-xs text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-textSecondary">
                  {message.length}/1000
                </span>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-borderPrimary">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-bgPrimary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTicketMutation.isPending || !subject.trim() || !message.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
