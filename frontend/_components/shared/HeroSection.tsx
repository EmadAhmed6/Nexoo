"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Banner } from "@/features/banners/types/banner.types";
import { useActiveBanners } from "@/features/banners/hooks/useBanners";
import { useTranslations } from "next-intl";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ── Helpers ─────────────────────────────────────────────────── */

function buildCtaHref(banner: Banner): string {
  switch (banner.linkType) {
    case "category":
      return banner.linkValue
        ? `/?category=${encodeURIComponent(banner.linkValue)}#products`
        : "/#products";
    case "product":
      return banner.linkValue ? `/products/${banner.linkValue}` : "/#products";
    case "external":
      return banner.linkValue || "/#products";
    default:
      return "/#products";
  }
}



/* ── Component ───────────────────────────────────────────────── */

export function HeroSection() {
  const t = useTranslations("home");
  const { data: banners, isLoading } = useActiveBanners("hero_home");

  const FEATURE_BADGES = [
    t("officialWarranty"),
    t("expressShipping"),
    t("secureCheckout"),
  ];

  function buildCtaLabel(banner: Banner): string {
    switch (banner.linkType) {
      case "category":
        return banner.linkValue ? t("shopCategory", { category: banner.linkValue }) : t("shopNow");
      case "product":
        return t("viewProduct");
      case "external":
        return t("learnMore");
      default:
        return t("exploreNow");
    }
  }

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="relative w-full rounded-3xl overflow-hidden border border-borderPrimary bg-bgSecondary animate-pulse min-h-[400px] lg:min-h-[460px]" />
    );
  }

  /* No banners — return null so the page doesn't break */
  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-borderPrimary bg-[#121316] shadow-2xl group/hero">
      {/* ── Swiper ──────────────────────────────────────────────── */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop={banners.length > 1}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{
          prevEl: ".hero-swiper-prev",
          nextEl: ".hero-swiper-next",
        }}
        pagination={{
          el: ".hero-swiper-pagination",
          clickable: true,
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active",
        }}
        className="w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <HeroSlide
              banner={banner}
              ctaLabel={buildCtaLabel(banner)}
              featuredBadge={t("featuredSelection")}
              featureBadges={FEATURE_BADGES}
              curatedForYou={t("curatedForYou")}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── Custom Navigation Arrows ────────────────────────────── */}
      {banners.length > 1 && (
        <>
          <button
            className="hero-swiper-prev absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white/60 hover:text-[#fbbf24] hover:border-[#fbbf24]/50 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="hero-swiper-next absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white/60 hover:text-[#fbbf24] hover:border-[#fbbf24]/50 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Custom Pagination ───────────────────────────────────── */}
      {banners.length > 1 && (
        <div className="hero-swiper-pagination absolute !bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2" />
      )}

      {/* ── Trust Strip (Bottom) ────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/[0.06] bg-black/30 backdrop-blur-sm px-6 sm:px-12 py-3.5 hidden md:grid grid-cols-3 gap-4 text-xs font-semibold text-white/50">
        <div className="flex items-center gap-2.5 justify-center">
          <Truck className="w-4 h-4 text-[#fbbf24]" />
          <span>{t("expressShipping")}</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center border-x border-white/[0.06]">
          <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
          <span>{t("officialWarranty")}</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center">
          <RotateCcw className="w-4 h-4 text-[#fbbf24]" />
          <span>{t("returnsPolicy")}</span>
        </div>
      </div>

      {/* ── Swiper Bullet Styles (injected via <style>) ─────────── */}
      <style jsx global>{`
        .hero-bullet {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-bullet:hover {
          background: rgba(255, 255, 255, 0.45);
        }
        .hero-bullet-active {
          width: 32px !important;
          background: #fbbf24 !important;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
        }
      `}</style>
    </div>
  );
}

/* ── Single Slide ────────────────────────────────────────────── */

function HeroSlide({
  banner,
  ctaLabel,
  featuredBadge,
  featureBadges,
  curatedForYou,
}: {
  banner: Banner;
  ctaLabel: string;
  featuredBadge: string;
  featureBadges: string[];
  curatedForYou: string;
}) {
  const ctaHref = buildCtaHref(banner);

  return (
    <div className="relative w-full min-h-[400px] lg:min-h-[460px]">
      {/* ── Ambient Background Glows ───────────────────────────── */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-[#fbbf24]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-[#fbbf24]/[0.04] blur-[100px] pointer-events-none" />

      {/* ── 2-Column Content Grid ──────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 h-full">
        {/* ── Left Column — Text & CTA ─────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#fbbf24]/25 bg-[#fbbf24]/[0.08] text-[#fbbf24] text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{featuredBadge}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-black text-white tracking-tight leading-[1.12]">
            {banner.title}
          </h1>

          {/* Subtitle / Description */}
          {banner.subtitle && (
            <p className="text-sm sm:text-base text-white/55 max-w-xl leading-relaxed">
              {banner.subtitle}
            </p>
          )}

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {featureBadges.map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-white/75 backdrop-blur-sm shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                <span>{feat}</span>
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href={ctaHref}
            className="group/cta inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primaryHover text-white dark:text-black font-extrabold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* ── Right Column — Product Image ─────────────────────── */}
        <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
          <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/3] flex items-center justify-center group/img">
            {/* Radial glow behind image */}
            <div className="absolute inset-6 rounded-full bg-[#fbbf24]/[0.08] blur-[70px] pointer-events-none transition-all duration-700 group-hover/img:bg-[#fbbf24]/[0.14]" />

            {/* Glass card container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
              <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover/img:scale-[1.04]">
                <Image
                  src={banner.image.url}
                  alt={banner.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover rounded-2xl"
                />
              </div>

              {/* Floating info card overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08] shadow-xl flex items-center gap-3 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/15 border border-[#fbbf24]/30 flex items-center justify-center text-[#fbbf24] font-black shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {banner.title}
                  </p>
                  <p className="text-[11px] text-white/50">
                    {banner.subtitle ? banner.subtitle.slice(0, 40) + "…" : curatedForYou}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
