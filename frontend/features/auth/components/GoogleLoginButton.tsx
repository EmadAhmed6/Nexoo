"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "../api/auth.api";
import { useQueryClient } from "@tanstack/react-query";

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

export function GoogleLoginButton({
  text,
  className = "",
}: GoogleLoginButtonProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const displayText = text || t("continueWithGoogle");
  const [isLoading, setIsLoading] = useState(false);

  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isHandledRef = useRef(false);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleSuccess = async (token: string) => {
    if (isHandledRef.current) return;
    isHandledRef.current = true;
    cleanup();

    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    } catch {}

    setAuthToken(token);
    queryClient.invalidateQueries({ queryKey: ["authMe"] });

    try {
      const response = await authApi.getMe();
      if (response.data) setUser(response.data);
    } catch {}

    toast.success(t("googleLoginSuccess"));
    router.refresh();
    router.replace("/");
  };

  const handleGoogleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    isHandledRef.current = false;

    const apiUrl = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    ).replace(/\/+$/, "");

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${apiUrl}/auth/google?popup=true`,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`,
    );

    popupRef.current = popup;

    if (!popup) {
      window.location.href = `${apiUrl}/auth/google`;
      return;
    }

    // 1. Listen via postMessage from window.opener
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.token) {
        window.removeEventListener("message", handleMessage);
        void handleSuccess(event.data.token);
      }
    };
    window.addEventListener("message", handleMessage);

    // 2. Listen via BroadcastChannel
    try {
      const channel = new BroadcastChannel("nexo_google_auth");
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.token) {
          void handleSuccess(event.data.token);
        }
      };
    } catch {}

    // 3. Listen via localStorage event
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "nexo_google_auth_event" && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          localStorage.removeItem("nexo_google_auth_event");
          if (data?.type === "GOOGLE_AUTH_SUCCESS" && data.token) {
            window.removeEventListener("storage", handleStorage);
            void handleSuccess(data.token);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Poll for popup closed by user: reset loading quietly without showing any error toasts
    timerRef.current = setInterval(() => {
      if (popup.closed) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        if (!isHandledRef.current) {
          setIsLoading(false);
        }
      }
    }, 500);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-bgPrimary/80 text-textPrimary text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      <span>{isLoading ? t("connectingGoogle") : displayText}</span>
    </button>
  );
}
