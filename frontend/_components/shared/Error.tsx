"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  message?: string;
}

export function Error({ message }: ErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex items-start gap-1.5 mt-1.5 text-xs text-textError leading-snug overflow-hidden"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
