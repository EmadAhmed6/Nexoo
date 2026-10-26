"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "@/features/auth/api/auth.api";

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const setUser = useAppStore((state) => state.setUser);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const isPopup = searchParams.get("popup") === "true";

    if (isPopup) {
      const message = error
        ? { type: "GOOGLE_AUTH_ERROR", message: error }
        : token
          ? { type: "GOOGLE_AUTH_SUCCESS", token }
          : { type: "GOOGLE_AUTH_ERROR", message: "missing_token" };

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, window.location.origin);
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
          JSON.stringify({ ...message, timestamp: Date.now() })
        );
      } catch {}

      window.setTimeout(() => window.close(), 250);
      return;
    }

    if (error) {
      toast.error(
        error === "google_oauth_not_configured"
          ? t("googleLoginNotConfigured")
          : t("googleLoginFailed")
      );
      router.replace("/auth/login");
      return;
    }

    if (!token) {
      toast.error(t("googleNoToken"));
      router.replace("/auth/login");
      return;
    }

    // Store the access token before loading the current user so the API
    // client can authenticate the request during this full-page callback.
    setAuthToken(token);

    authApi
      .getMe()
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          toast.success(t("googleLoginSuccess"));
          router.replace("/");
        } else {
          router.replace("/auth/login");
        }
      })
      .catch(() => {
        toast.error(t("googleProfileFailed"));
        router.replace("/auth/login");
      });
  }, [router, searchParams, setUser, t]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-8 rounded-2xl border border-borderPrimary bg-bgSecondary shadow-xl text-center space-y-5"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">
          {t("googleAuthInProgress")}
        </h2>
        <p className="text-xs text-textSecondary">
          {t("googleAuthSubtitle")}
        </p>
      </div>
    </motion.div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthSuccessHandler />
    </Suspense>
  );
}
