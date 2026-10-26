import express from "express";
import { getAllNotifications, getNotificationById, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, } from "./notification.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
const router = express.Router();
router
    .route("/")
    .get(verifyToken, getAllNotifications)
    .delete(verifyToken, deleteAllNotifications);
router.route("/read-all").patch(verifyToken, markAllAsRead);
router
    .route("/:notificationId")
    .get(verifyToken, getNotificationById)
    .patch(verifyToken, markAsRead)
    .delete(verifyToken, deleteNotification);
router.route("/:notificationId/read").patch(verifyToken, markAsRead);
export default router;
//# sourceMappingURL=notification.routes.js.map