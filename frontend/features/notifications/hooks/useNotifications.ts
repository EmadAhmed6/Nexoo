"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification.api";
import { NotificationItem } from "../types/notification.types";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await notificationApi.getNotifications();
      return (res.data ?? []) as NotificationItem[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 sec
    refetchInterval: 1000 * 30, // Poll every 30s for fresh updates
    refetchOnWindowFocus: true,
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.map((item) => (item._id === id ? { ...item, isRead: true } : item))
        );
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toast.error("Failed to mark notification as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.map((item) => ({ ...item, isRead: true }))
        );
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toast.error("Failed to mark all as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.filter((item) => item._id !== id)
        );
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("Notification deleted");
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toast.error("Failed to delete notification");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.deleteAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);

      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, []);

      return { previous };
    },
    onSuccess: () => {
      toast.success("All notifications cleared");
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toast.error("Failed to clear notifications");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
