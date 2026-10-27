"use client";

import { useEffect, useRef } from "react";
import { getAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "@/features/auth/api/auth.api";
import { useRouter } from "@/i18n/routing";

export function AuthInitializer() {
  const router = useRouter();
  const { user, setUser, logout } = useAppStore();
  const checkedRef = useRef(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      const callbackUrl = `${window.location.pathname}${window.location.search}`;
      router.replace(
        `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    };

    window.addEventListener("nexo:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("nexo:unauthorized", handleUnauthorized);
    };
  }, [logout, router]);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const token = getAuthToken();
    if (!token && !user) return;

    // /auth/me automatically refreshes an expired access token. Keep the
    // persisted session on network/server errors; the unauthorized event is
    // emitted only when the refresh session itself is rejected.
    authApi
      .getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {});
  }, [user, setUser]);

  return null;
}
