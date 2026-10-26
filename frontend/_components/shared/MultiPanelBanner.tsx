"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight,
  Tag,
  CreditCard,
  Percent,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface PanelItem {
  id: string;
  tag: string;
  tagIcon?: React.ElementType;
  tagColor: string;
  title: string;
  description: string;
  promoCallout: string;
  actionText: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
}



export function MultiPanelBanner() {
  const t = useTranslations("home");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const PANELS: PanelItem[] = [
    {
      id: "panel-super-deals",
      tag: t("panelDealsTag"),
      tagIcon: Flame,
      tagColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      title: t("panelDealsTitle"),
      description: t("panelDealsDesc"),
      promoCallout: t("panelDealsPromo"),
      actionText: t("panelDealsAction"),
      href: "/#products",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Audio and electronics deals",
    },
    {
      id: "panel-watches",
      tag: t("panelWatchesTag"),
      tagIcon: Sparkles,
      tagColor: "bg-primary/20 text-primary border-primary/30",
      title: t("panelWatchesTitle"),
      description: t("panelWatchesDesc"),
      promoCallout: t("panelWatchesPromo"),
      actionText: t("panelWatchesAction"),
      href: "/?category=Watches%20%26%20Accessories#products",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Luxury watches and accessories",
    },
    {
      id: "panel-fragrances",
      tag: t("panelFragrancesTag"),
      tagIcon: Tag,
      tagColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      title: t("panelFragrancesTitle"),
      description: t("panelFragrancesDesc"),
      promoCallout: t("panelFragrancesPromo"),
      actionText: t("panelFragrancesAction"),
      href: "/?category=Luxury%20Fragrances#products",
      imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Luxury perfumes and fragrances",
    },
    {
      id: "panel-fashion",
      tag: t("panelFashionTag"),
      tagIcon: Sparkles,
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      title: t("panelFashionTitle"),
      description: t("panelFashionDesc"),
      promoCallout: t("panelFashionPromo"),
      actionText: t("panelFashionAction"),
      href: "/?category=Clothes#products",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Modern clothes and fashion",
    },
    {
      id: "panel-installments",
      tag: t("panelInstallmentsTag"),
      tagIcon: CreditCard,
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      title: t("panelInstallmentsTitle"),
      description: t("panelInstallmentsDesc"),
      promoCallout: t("panelInstallmentsPromo"),
      actionText: t("panelInstallmentsAction"),
      href: "/#products",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Installment plans for electronics",
    },
    {
      id: "panel-shoes",
      tag: t("panelShoesTag"),
      tagIcon: Flame,
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      title: t("panelShoesTitle"),
      description: t("panelShoesDesc"),
      promoCallout: t("panelShoesPromo"),
      actionText: t("panelShoesAction"),
      href: "/?category=Shoes#products",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Sneakers and designer shoes",
    },
    {
      id: "panel-leather",
      tag: t("panelLeatherTag"),
      tagIcon: Tag,
      tagColor: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      title: t("panelLeatherTitle"),
      description: t("panelLeatherDesc"),
      promoCallout: t("panelLeatherPromo"),
      actionText: t("panelLeatherAction"),
      href: "/?category=Leather%20Goods#products",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Leather goods and luxury bags",
    },
    {
      id: "panel-electronics",
      tag: t("panelElectronicsTag"),
      tagIcon: Percent,
      tagColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      title: t("panelElectronicsTitle"),
      description: t("panelElectronicsDesc"),
      promoCallout: t("panelElectronicsPromo"),
      actionText: t("panelElectronicsAction"),
      href: "/?category=Electronics#products",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
      imageAlt: "Electronics and laptops",
    },
  ];

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full space-y-4">
      {/* Banner Header: Title & Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              {t("spotlightOffers")}
            </span>
            <span className="text-xs text-textSecondary hidden sm:inline">
              {t("spotlightSubtitle")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">
            {t("spotlightHeading")}
          </h2>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollLeft
                ? "border-borderPrimary bg-bgSecondary text-textPrimary hover:border-primary hover:text-primary cursor-pointer shadow-sm"
                : "border-borderPrimary/40 bg-bgSecondary/40 text-textSecondary/30 cursor-not-allowed"
            }`}
            aria-label={t("scrollLeft")}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollRight
                ? "border-borderPrimary bg-bgSecondary text-textPrimary hover:border-primary hover:text-primary cursor-pointer shadow-sm"
                : "border-borderPrimary/40 bg-bgSecondary/40 text-textSecondary/30 cursor-not-allowed"
            }`}
            aria-label={t("scrollRight")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Panels Strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pt-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {PANELS.map((panel) => {
          const TagIcon = panel.tagIcon;
          return (
            <Link
              key={panel.id}
              href={panel.href}
              className="group min-w-[270px] sm:min-w-[290px] max-w-[310px] shrink-0 snap-start flex flex-col rounded-3xl border border-borderPrimary bg-bgSecondary p-3.5 sm:p-4 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Panel Image Container */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-bgPrimary mb-3.5">
                <Image
                  src={panel.imageUrl}
                  alt={panel.imageAlt}
                  fill
                  sizes="310px"
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />

                {/* Promotional Call-out Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-primary text-white dark:text-black font-black text-[11px] shadow-md tracking-tight">
                    {panel.promoCallout}
                  </span>
                </div>

                {/* Tag pill */}
                <div className="absolute bottom-2.5 left-2.5 z-10">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-sm ${panel.tagColor}`}
                  >
                    {TagIcon && <TagIcon className="w-3 h-3" />}
                    <span>{panel.tag}</span>
                  </span>
                </div>
              </div>

              {/* Panel Text Info */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-textPrimary group-hover:text-primary transition-colors line-clamp-1 mb-1 tracking-tight">
                    {panel.title}
                  </h3>
                  <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed mb-3">
                    {panel.description}
                  </p>
                </div>

                {/* Action Link Footer */}
                <div className="pt-3 border-t border-borderPrimary flex items-center justify-between text-xs font-bold text-primary mt-auto">
                  <span>{panel.actionText}</span>
                  <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
