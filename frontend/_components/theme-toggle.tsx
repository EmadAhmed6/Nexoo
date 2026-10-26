"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("common");
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const transitionTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full border border-borderPrimary bg-bgSecondary opacity-60" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    setTheme(isDark ? "light" : "dark");

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimeoutRef.current = null;
    }, 350);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("switchToLightMode") : t("switchToDarkMode")}
      className={`relative inline-flex items-center w-14 h-7 rounded-full border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] ${
        isDark ? "bg-primary border-primary" : "bg-bgSecondary border-borderPrimary"
      }`}
    >
      {/* Icons inside the track */}
      <span className="absolute left-1.5 flex items-center justify-center text-yellow-400">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="absolute right-1.5 flex items-center justify-center text-bgPrimary">
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding knob */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center ${
          isDark
            ? "bg-bgPrimary right-0.5"
            : "bg-white left-0.5"
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-primary" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.span>
    </button>
  );
}
