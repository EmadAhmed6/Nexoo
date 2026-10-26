"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";

import { AuthInitializer } from "./auth-initializer";

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
      // Keep the anti-flash script executable in the initial HTML only.
      // Locale navigation remounts this provider on the client, where React
      // warns about executable scripts rendered from components.
      scriptProps={{
        type: typeof window === "undefined" ? "text/javascript" : "application/json",
      }}
    >
      <QueryProvider>
        <AuthInitializer />
        {children}
      </QueryProvider>
      <Toaster />
    </ThemeProvider>
  );
}
