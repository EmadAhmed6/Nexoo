import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/_components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bgPrimary text-textPrimary transition-colors duration-300">
      {/* Auth Main Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
