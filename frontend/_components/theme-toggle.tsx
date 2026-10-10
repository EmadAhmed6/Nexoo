"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-center opacity-70">
        <Sun className="h-5 w-5 text-[var(--text-secondary)]" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const options = [
    { label: "فاتح (Light)", value: "light", icon: Sun },
    { label: "داكن (Dark)", value: "dark", icon: Moon },
    { label: "النظام (System)", value: "system", icon: Laptop },
  ];

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--primary)] text-[var(--text-primary)] flex items-center justify-center shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)]"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 text-[var(--primary)]" />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 text-[var(--primary)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-lg backdrop-blur-md p-1.5 z-50 overflow-hidden"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    active
                      ? "bg-[var(--primary)]/15 text-[var(--primary)] font-semibold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="active-dot"
                      className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
