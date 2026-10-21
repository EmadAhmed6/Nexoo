export type NotificationType = "order" | "review" | "other";

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}
