"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { Text } from "@/_components/shared/Text";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  productTitle?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
  productTitle,
}: DeleteConfirmModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="delete-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!isPending) onClose();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Dialog Card */}
          <motion.div
            key="delete-modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Red Ambient Glow at the top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-textError/15 blur-2xl rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Trash Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-textError/15 border border-textError/30 flex items-center justify-center text-textError mb-4 shadow-lg shadow-textError/10">
                <Trash2 className="w-7 h-7" />
              </div>

              {/* Modal Title */}
              <Text as="h3" size="xl" font="black" className="tracking-tight text-textPrimary">
                Delete Product
              </Text>

              {/* Warning Description */}
              <p className="mt-2 text-sm text-textSecondary leading-relaxed">
                Are you sure you want to delete{" "}
                {productTitle ? (
                  <span className="font-semibold text-textPrimary">
                    &quot;{productTitle}&quot;
                  </span>
                ) : (
                  "this product"
                )}
                ? This action cannot be undone and will permanently remove this item from the store.
              </p>

              {/* Alert Notice */}
              <div className="mt-4 w-full p-3 rounded-xl bg-textError/5 border border-textError/20 flex items-center gap-2.5 text-left">
                <AlertTriangle className="w-4 h-4 text-textError flex-shrink-0" />
                <span className="text-xs text-textError font-medium">
                  All associated data and images will be permanently deleted.
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-bgPrimary/80 text-textSecondary hover:text-textPrimary text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-textError hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-textError/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
