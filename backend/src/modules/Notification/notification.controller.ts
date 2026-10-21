import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { sendError, successMsg } from "../../middlewares/errors.js";
import { Notification } from "./notification.model.js";
import { Types } from "mongoose";

const getAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    successMsg(res, 200, "Notifications fetched successfully", notifications);
  },
);

const getNotificationById = asyncHandler(
  async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      sendError(res, 404, "No notification found with this id");
      return;
    }
    if (notification.user.toString() !== req.user?.id) {
      sendError(res, 403, "You cannot access other user notifications");
      return;
    }
    successMsg(res, 200, "Notification fetched successfully", notification);
  },
);

const markAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      sendError(res, 404, "No notification found with this id");
      return;
    }
    if (notification.user.toString() !== req.user?.id) {
      sendError(res, 403, "You cannot access other user notifications");
      return;
    }
    notification.isRead = true;
    await notification.save();
    successMsg(res, 200, "Notification marked as read", notification);
  },
);

const markAllAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const notifications = await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      { $set: { isRead: true } },
    );

    successMsg(res, 200, "All notifications marked as read", notifications);
  },
);

const deleteNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      sendError(res, 404, "No notification found with this id");
      return;
    }
    if (notification.user.toString() !== req.user?.id) {
      sendError(res, 403, "You cannot access other user notifications");
      return;
    }
    await Notification.findByIdAndDelete(notificationId);
    successMsg(res, 200, "Notification deleted successfully", notification);
  },
);

const deleteAllNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    await Notification.deleteMany({ user: userId });
    successMsg(res, 200, "All notifications deleted successfully", []);
  },
);

export const createNotification = async (data: {
  user: Types.ObjectId | string;
  title: string;
  message: string;
  type?: "order" | "review" | "other";
  relatedId?: Types.ObjectId | string;
}) => {
  try {
    return await Notification.create({
      user: data.user,
      title: data.title,
      message: data.message,
      type: data.type || "other",
      relatedId: data.relatedId,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export {
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
