"use client";

import { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";

function SonnerToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
        },
      }}
    />
  );
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>{children}</QueryProvider>
      <SonnerToaster />
    </ThemeProvider>
  );
}
