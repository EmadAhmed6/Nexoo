"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isArabic = locale === "ar";
  const targetLocale = isArabic ? "en" : "ar";

  const handleToggle = () => {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale });
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-borderPrimary bg-bgPrimary hover:border-primary/50 text-textSecondary hover:text-textPrimary text-xs font-bold transition-all disabled:opacity-50 shadow-sm ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
      <span>{isArabic ? "English" : "العربية"}</span>
    </button>
  );
}
