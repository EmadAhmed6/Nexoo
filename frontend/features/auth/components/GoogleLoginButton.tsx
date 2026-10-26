"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "../api/auth.api";

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

type GoogleAuthMessage =
  | { type: "GOOGLE_AUTH_SUCCESS"; token: string }
  | { type: "GOOGLE_AUTH_ERROR"; message?: string };

export function GoogleLoginButton({
  text,
  className = "",
}: GoogleLoginButtonProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const displayText = text || t("continueWithGoogle");
  const [isLoading, setIsLoading] = useState(false);
  const handledRef = useRef(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    handledRef.current = false;

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${apiUrl}/auth/google?popup=true&origin=${encodeURIComponent(window.location.origin)}`,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      setIsLoading(false);
      toast.error(t("googlePopupBlocked"));
      return;
    }

    let authChannel: BroadcastChannel | null = null;
    let checkPopup: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      authChannel?.close();
      authChannel = null;
      if (checkPopup) clearInterval(checkPopup);
      checkPopup = null;
    };

    const completeSignIn = async (token: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      cleanup();
      try {
        if (!popup.closed) popup.close();
      } catch {}

      setAuthToken(token);
      try {
        const response = await authApi.getMe();
        if (response.data) setUser(response.data);
        toast.success(t("googleLoginSuccess"));
      } catch {
        toast.error(t("googleProfileFailed"));
      } finally {
        setIsLoading(false);
        router.replace("/");
        router.refresh();
      }
    };

    const failSignIn = (message?: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      cleanup();
      try {
        if (!popup.closed) popup.close();
      } catch {}
      setIsLoading(false);
      toast.error(
        message === "google_oauth_not_configured"
          ? t("googleLoginNotConfigured")
          : t("googleLoginFailed")
      );
    };

    const handleMessage = (event: MessageEvent<GoogleAuthMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.token) {
        void completeSignIn(event.data.token);
      } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
        failSignIn(event.data.message);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "nexo_google_auth_event" || !event.newValue) return;
      try {
        const message = JSON.parse(event.newValue) as GoogleAuthMessage;
        localStorage.removeItem("nexo_google_auth_event");
        if (message.type === "GOOGLE_AUTH_SUCCESS" && message.token) {
          void completeSignIn(message.token);
        } else if (message.type === "GOOGLE_AUTH_ERROR") {
          failSignIn(message.message);
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);

    try {
      authChannel = new BroadcastChannel("nexo_google_auth");
      authChannel.onmessage = (event: MessageEvent<GoogleAuthMessage>) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.token) {
          void completeSignIn(event.data.token);
        } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
          failSignIn(event.data.message);
        }
      };
    } catch {}

    checkPopup = setInterval(() => {
      if (popup.closed && !handledRef.current) {
        failSignIn();
      }
    }, 400);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-borderPrimary bg-bgPrimary hover:bg-bgPrimary/80 text-textPrimary text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{isLoading ? t("connectingGoogle") : displayText}</span>
    </button>
  );
}
