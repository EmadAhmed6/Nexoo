"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) || "system"}
      position="top-right"
      className="toaster group"
      toastOptions={{
        style: {
          fontFamily: "inherit",
          fontSize: "0.8125rem",
          fontWeight: 500,
          background: resolvedTheme === "dark" ? "#14171f" : "#ffffff",
          color: resolvedTheme === "dark" ? "#ffffff" : "#111827",
          border: `1px solid ${resolvedTheme === "dark" ? "#272a33" : "#e5e7eb"}`,
          borderRadius: "0.75rem",
          boxShadow:
            resolvedTheme === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.45)"
              : "0 4px 16px rgba(0, 0, 0, 0.06)",
          padding: "10px 14px",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
