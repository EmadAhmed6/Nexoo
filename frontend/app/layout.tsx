import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { Providers } from "@/providers";
import { Navbar } from "@/_components/shared";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexo - Luxury E-Commerce",
  description: "Exclusive luxury e-commerce platform offering premium curated lifestyle goods.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-200 flex flex-col">
        <Providers>
          <React.Suspense fallback={<div className="h-16 w-full border-b border-borderPrimary bg-bgSecondary/85" />}>
            <Navbar />
          </React.Suspense>
          <div className="flex-1 flex flex-col">{children}</div>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
