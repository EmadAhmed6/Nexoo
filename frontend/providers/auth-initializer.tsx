"use client";

import { useEffect, useRef } from "react";
import { getAuthToken } from "@/lib/cookies";
import { useAppStore } from "@/store/use-app-store";
import { authApi } from "@/features/auth/api/auth.api";

export function AuthInitializer() {
  const { user, setUser, logout } = useAppStore();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const token = getAuthToken();

    // Sync Zustand store with browser cookie
    if (token && !user) {
      authApi
        .getMe()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        });
    } else if (!token && user) {
      setUser(null);
    }
  }, [user, setUser, logout]);

  return null;
}
