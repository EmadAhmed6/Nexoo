import { apiGet, apiPatch, apiDelete } from "@/lib/axios-client";
import { NotificationItem } from "../types/notification.types";

export const notificationApi = {
  /**
   * Fetch all notifications for the current authenticated user
   */
  getNotifications: async () => {
    return apiGet<NotificationItem[]>("/notifications");
  },

  /**
   * Get single notification by ID
   */
  getNotificationById: async (id: string) => {
    return apiGet<NotificationItem>(`/notifications/${id}`);
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string) => {
    return apiPatch<NotificationItem>(`/notifications/${id}/read`);
  },

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead: async () => {
    return apiPatch<{ acknowledged: boolean; modifiedCount: number }>("/notifications/read-all");
  },

  /**
   * Delete a single notification by ID
   */
  deleteNotification: async (id: string) => {
    return apiDelete<NotificationItem>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async () => {
    return apiDelete<void>("/notifications");
  },
};
