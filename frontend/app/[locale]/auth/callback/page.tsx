"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthToken } from "@/lib/cookies";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "@/features/auth/api/auth.api";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const t = useTranslations("auth");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const isPopup =
      searchParams.get("popup") === "true" ||
      (typeof window !== "undefined" && window.opener && window.opener !== window) ||
      (typeof window !== "undefined" && window.name === "google_oauth_popup");

    if (token) {
      hasProcessed.current = true;
      setAuthToken(token);
      queryClient.invalidateQueries({ queryKey: ["authMe"] });

      // Notify parent / opener window via all channels
      const message = { type: "GOOGLE_AUTH_SUCCESS", token };

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, "*");
        }
      } catch {}

      try {
        const channel = new BroadcastChannel("nexo_google_auth");
        channel.postMessage(message);
        channel.close();
      } catch {}

      try {
        localStorage.setItem(
          "nexo_google_auth_event",
          JSON.stringify({ ...message, ts: Date.now() }),
        );
      } catch {}

      // If in popup, close this window immediately and ensure opener redirects to home
      if (isPopup) {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.location.href = "/";
          }
        } catch {}

        window.close();
        setTimeout(() => {
          window.close();
        }, 150);
        return;
      }

      // If full-page navigation (not in a popup), redirect directly to home
      authApi
        .getMe()
        .then((res) => {
          if (res.data) setUser(res.data);
          toast.success(t("googleLoginSuccess"));
          router.refresh();
          router.replace("/");
        })
        .catch(() => {
          toast.success(t("googleLoginSuccess"));
          router.refresh();
          router.replace("/");
        });
    } else if (error) {
      hasProcessed.current = true;
      const errorMessage = { type: "GOOGLE_AUTH_ERROR", error };

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(errorMessage, "*");
        }
      } catch {}

      try {
        const channel = new BroadcastChannel("nexo_google_auth");
        channel.postMessage(errorMessage);
        channel.close();
      } catch {}

      if (isPopup) {
        window.close();
        return;
      }

      toast.error(
        error === "google_oauth_not_configured"
          ? t("googleLoginNotConfigured")
          : t("googleLoginFailed"),
      );
      router.replace("/auth/login");
    }
  }, [searchParams, router, queryClient, setUser, t]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md w-full border border-borderPrimary bg-bgSecondary shadow-xl">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-lg text-textPrimary">
          {t("googleAuthInProgress")}
        </p>
        <p className="text-xs text-textSecondary">
          {t("googleAuthSubtitle")}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
