"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BannerSlide {
  id: number;
  badge: string;
  badgeColor: string;
  heading: string;
  subheading: string;
  cta: string;
  ctaHref: string;
  gradient: string;
  accentColor: string;
  pattern: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 1,
    badge: "⚡ Flash Sale",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    heading: "Up to 50% Off\nHot Deals Today",
    subheading: "Exclusive discounts on premium electronics, fashion & more — limited time only.",
    cta: "Shop Now",
    ctaHref: "/#products",
    gradient: "from-[#1a0a00] via-[#0f1115] to-[#0f1115]",
    accentColor: "#ef4444",
    pattern: "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(239,68,68,0.12) 0%, transparent 70%)",
  },
  {
    id: 2,
    badge: "✨ New Collection",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
    heading: "Discover Luxury\nFashion & Style",
    subheading: "Curated collections of premium clothing, shoes and accessories from top brands.",
    cta: "Explore Collection",
    ctaHref: "/#products",
    gradient: "from-[#0a0a1a] via-[#0f1115] to-[#0f1115]",
    accentColor: "#d4af37",
    pattern: "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(212,175,55,0.1) 0%, transparent 70%)",
  },
  {
    id: 3,
    badge: "🔖 Discount Codes",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    heading: "Use Code NEXOO15\nfor Extra 15% Off",
    subheading: "Apply your promo code at checkout on orders over $99. Don't miss this deal.",
    cta: "Start Shopping",
    ctaHref: "/#products",
    gradient: "from-[#00100a] via-[#0f1115] to-[#0f1115]",
    accentColor: "#10b981",
    pattern: "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(16,185,129,0.10) 0%, transparent 70%)",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [autoplay, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-none"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      style={{ minHeight: "280px" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className={`relative flex items-center justify-between bg-gradient-to-r ${slide.gradient} px-8 sm:px-14 lg:px-20 py-10 sm:py-16`}
          style={{
            backgroundImage: `${slide.pattern}, linear-gradient(to right, ${slide.gradient.replace("from-", "").replace("via-", "").replace("to-", "")})`,
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[90px] opacity-20 pointer-events-none"
            style={{ background: slide.accentColor }}
          />
          <div
            className="absolute right-20 top-1/4 w-[200px] h-[200px] rounded-full blur-[60px] opacity-10 pointer-events-none"
            style={{ background: slide.accentColor }}
          />

          {/* Geometric decoration */}
          <div className="absolute right-8 sm:right-16 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-3 opacity-20">
            <div className="w-24 h-24 rounded-3xl border-2 rotate-12" style={{ borderColor: slide.accentColor }} />
            <div className="w-16 h-16 rounded-2xl border rotate-45" style={{ borderColor: slide.accentColor }} />
            <div className="w-10 h-10 rounded-xl border rotate-12" style={{ borderColor: slide.accentColor }} />
          </div>

          {/* Text Content */}
          <div className="relative z-10 max-w-lg">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${slide.badgeColor}`}
            >
              {slide.badge}
            </motion.span>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-textPrimary leading-tight tracking-tight whitespace-pre-line mb-3"
            >
              {slide.heading}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-textSecondary leading-relaxed mb-6 max-w-md"
            >
              {slide.subheading}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3"
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group"
                style={{
                  background: slide.accentColor,
                  color: "#000",
                  boxShadow: `0 8px 24px ${slide.accentColor}40`,
                }}
              >
                {slide.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/#products"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold border border-borderPrimary bg-bgPrimary/60 text-textSecondary hover:text-textPrimary hover:border-primary/40 transition-all"
              >
                Browse All
              </Link>
            </motion.div>
          </div>

          {/* Stats chips — right side desktop */}
          <div className="hidden lg:flex flex-col gap-3 relative z-10 shrink-0">
            {[
              { icon: Zap, label: "Flash Deals", value: "50% OFF" },
              { icon: Tag, label: "New Arrivals", value: "500+" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-borderPrimary bg-bgSecondary/60 backdrop-blur-md"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${slide.accentColor}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: slide.accentColor }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-textPrimary">{value}</p>
                  <p className="text-[10px] text-textSecondary">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl border border-borderPrimary bg-bgSecondary/80 backdrop-blur-sm text-textSecondary hover:text-textPrimary hover:border-primary/40 transition-all flex items-center justify-center z-20 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl border border-borderPrimary bg-bgSecondary/80 backdrop-blur-sm text-textSecondary hover:text-textPrimary hover:border-primary/40 transition-all flex items-center justify-center z-20 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-borderPrimary hover:bg-textSecondary"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
