import { model, Schema, Types } from "mongoose";
const NotificationSchema = new Schema({
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
}, { timestamps: true });
const Notification = model("Notification", NotificationSchema);
export { Notification };
//# sourceMappingURL=notification.model.js.map