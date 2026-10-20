"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle2,
  Flame,
} from "lucide-react";

interface HeroSlide {
  id: string;
  badge: string;
  badgeIcon: React.ElementType;
  badgeColor: string;
  title: string;
  highlightText: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  imageUrl: string;
  imageAlt: string;
  accentGlow: string;
  productFeatures: string[];
  floatingCard: {
    title: string;
    subtitle: string;
    rating?: number;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "smartwatch-titanium",
    badge: "Special Release 2026",
    badgeIcon: Sparkles,
    badgeColor: "bg-primary/15 text-primary border-primary/30",
    title: "Next-Generation",
    highlightText: "Ultra Luxury Smartwatch",
    subtitle:
      "Crafted with grade-5 aerospace titanium, sapphire crystal display, and advanced cellular biometric monitoring. Engineered for precision and endurance.",
    price: "24,999 EGP",
    originalPrice: "29,500 EGP",
    discountBadge: "SAVE 15%",
    primaryCtaText: "Order Now",
    primaryCtaHref: "/#products",
    secondaryCtaText: "Explore Watches",
    secondaryCtaHref: "/?category=Watches%20%26%20Accessories#products",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Luxury Smartwatch Ultra Titanium",
    accentGlow: "rgba(212, 175, 55, 0.25)",
    productFeatures: [
      "Grade 5 Titanium Casing",
      "Sapphire Crystal Display",
      "72-Hour Extreme Battery",
    ],
    floatingCard: {
      title: "Top Rated Flagship",
      subtitle: "1,420+ Verified Buyers",
      rating: 4.9,
    },
  },
  {
    id: "studio-headphones",
    badge: "High-Fidelity Acoustic Audio",
    badgeIcon: Flame,
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    title: "Pure Sound.",
    highlightText: "Zero Distractions.",
    subtitle:
      "Immerse yourself in studio-grade acoustics. Custom 40mm carbon drivers, industry-leading active noise cancellation, and ultra-plush memory foam cushions.",
    price: "12,499 EGP",
    originalPrice: "15,800 EGP",
    discountBadge: "SAVE 21%",
    primaryCtaText: "Shop Audio Deals",
    primaryCtaHref: "/#products",
    secondaryCtaText: "View Electronics",
    secondaryCtaHref: "/?category=Electronics#products",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Studio Pro Wireless ANC Headphones",
    accentGlow: "rgba(239, 68, 68, 0.22)",
    productFeatures: [
      "Adaptive Active Noise Cancelling",
      "40-Hour Hi-Res Playtime",
      "Lossless Spatial Audio",
    ],
    floatingCard: {
      title: "Editor's Choice Award",
      subtitle: "Over 850 sold this week",
      rating: 4.95,
    },
  },
  {
    id: "luxury-designer-sneakers",
    badge: "Exclusive Italian Drop",
    badgeIcon: Sparkles,
    badgeColor: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    title: "Iconic Streetwear",
    highlightText: "Luxury Redefined",
    subtitle:
      "Handcrafted in Italy using supple calfskin leather and ergonomic cushioned soles. Modern luxury silhouette designed for all-day comfort and standout presence.",
    price: "8,950 EGP",
    originalPrice: "11,200 EGP",
    discountBadge: "20% OFF",
    primaryCtaText: "Explore Collection",
    primaryCtaHref: "/#products",
    secondaryCtaText: "View Footwear",
    secondaryCtaHref: "/?category=Shoes#products",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Luxury Designer Sneaker Collection",
    accentGlow: "rgba(245, 158, 11, 0.22)",
    productFeatures: [
      "100% Genuine Italian Calfskin",
      "Ergonomic Memory Sole",
      "Signature Collector Box",
    ],
    floatingCard: {
      title: "Trending Fashion Drop",
      subtitle: "Limited Edition Stock",
      rating: 4.85,
    },
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-borderPrimary bg-bgSecondary shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 opacity-25"
        style={{ background: slide.accentGlow }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 opacity-15"
        style={{ background: slide.accentGlow }}
      />

      {/* Main Slide Content */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 min-h-[520px] lg:min-h-[560px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full"
          >
            {/* Left Content (Text, Pricing, CTA) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-4 shadow-sm backdrop-blur-md ${slide.badgeColor}`}
              >
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{slide.badge}</span>
              </div>

              {/* Headlines */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-textPrimary tracking-tight leading-[1.12] mb-4">
                <span>{slide.title}</span>{" "}
                <span className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
                  {slide.highlightText}
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-textSecondary max-w-xl leading-relaxed mb-6">
                {slide.subtitle}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-7">
                {slide.productFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-bgPrimary/70 border border-borderPrimary text-textPrimary backdrop-blur-sm shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>

              {/* Price & CTA Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full sm:w-auto pt-2">
                {/* Price Display */}
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                      {slide.price}
                    </span>
                    {slide.originalPrice && (
                      <span className="text-sm sm:text-base text-textSecondary line-through font-medium">
                        {slide.originalPrice}
                      </span>
                    )}
                    {slide.discountBadge && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-extrabold text-[11px] border border-rose-500/30">
                        {slide.discountBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-textSecondary">
                    Official Warranty • 0% Interest Available
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={slide.primaryCtaHref}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:bg-primaryHover transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 group cursor-pointer"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={slide.secondaryCtaHref}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-borderPrimary bg-bgPrimary/80 hover:bg-bgPrimary text-textPrimary text-sm font-bold hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Content (Prominent Product Image Showcase) */}
            <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
              <div className="relative w-full max-w-[420px] lg:max-w-none aspect-square flex items-center justify-center">
                {/* Product Radial Glow Aura */}
                <div
                  className="absolute inset-4 rounded-full blur-[80px] opacity-40 transition-all duration-700 pointer-events-none"
                  style={{ background: slide.accentGlow }}
                />

                {/* Outer Glass Card for Product */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-borderPrimary/80 bg-gradient-to-b from-bgPrimary/80 to-bgSecondary/60 shadow-2xl p-4 flex items-center justify-center group">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={slide.imageUrl}
                      alt={slide.imageAlt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>

                  {/* Floating Micro Highlights Card */}
                  <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-bgSecondary/90 backdrop-blur-md border border-borderPrimary/80 shadow-xl flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textPrimary">
                          {slide.floatingCard.title}
                        </p>
                        <p className="text-[11px] text-textSecondary">
                          {slide.floatingCard.subtitle}
                        </p>
                      </div>
                    </div>

                    {slide.floatingCard.rating && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-bgPrimary/80 border border-borderPrimary text-primary font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span>{slide.floatingCard.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 z-20">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-2xl border border-borderPrimary bg-bgSecondary/85 backdrop-blur-md text-textSecondary hover:text-textPrimary hover:border-primary/50 transition-all flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-20">
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-2xl border border-borderPrimary bg-bgSecondary/85 backdrop-blur-md text-textSecondary hover:text-textPrimary hover:border-primary/50 transition-all flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators & Progress Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? "w-8 h-2.5 bg-primary shadow-sm shadow-primary/40"
                : "w-2.5 h-2.5 bg-borderPrimary hover:bg-textSecondary"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Trust & Guarantee Strip (Bottom of Hero) */}
      <div className="border-t border-borderPrimary bg-bgPrimary/60 backdrop-blur-sm px-6 sm:px-12 py-3.5 hidden md:grid grid-cols-3 gap-4 text-xs font-semibold text-textSecondary">
        <div className="flex items-center gap-2.5 justify-center">
          <Truck className="w-4 h-4 text-primary" />
          <span>Free Express Shipping across Egypt</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center border-x border-borderPrimary">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>100% Genuine & 2-Year Official Warranty</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center">
          <RotateCcw className="w-4 h-4 text-primary" />
          <span>14-Day Hassle-Free Returns</span>
        </div>
      </div>
    </div>
  );
}
