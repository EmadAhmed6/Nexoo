import { model, Schema, Types } from "mongoose";

export interface INotification {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "review" | "other";
  isRead: boolean;
  relatedId?: Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "review", "other"],
      required: true,
      default: "other",
    },
    isRead: { type: Boolean, default: false },
    relatedId: {
      type: Types.ObjectId,
    },
  },
  { timestamps: true },
);

const Notification = model<INotification>("Notification", NotificationSchema);

export { Notification };
