import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/features/auth/types/auth.types";
import { removeAuthToken } from "@/lib/cookies";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  notificationsCount: number;
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  incrementNotifications: () => void;
  clearNotifications: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        sidebarOpen: true,
        notificationsCount: 0,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
          }),

        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),

        incrementNotifications: () =>
          set((state) => ({
            notificationsCount: state.notificationsCount + 1,
          })),

        clearNotifications: () =>
          set({
            notificationsCount: 0,
          }),

        logout: () => {
          removeAuthToken();
          set({
            user: null,
            isAuthenticated: false,
          });
        },
      }),
      {
        name: "nexo-app-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
