"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="p-8 sm:p-12 rounded-3xl border border-borderPrimary bg-bgSecondary space-y-6 shadow-xl">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-textPrimary tracking-tight">
            Payment Cancelled
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary max-w-sm mx-auto">
            You cancelled the payment transaction. No charges were made to your account.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primaryHover text-black text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Checkout Again</span>
          </Link>
          <Link
            href="/orders"
            className="px-6 py-3.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/40 text-textPrimary text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
