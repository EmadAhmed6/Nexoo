// GET    /notifications
// PATCH  /notifications/read-all
// DELETE /notifications
// GET    /notifications/{notificationId}
// PATCH  /notifications/{notificationId}/read
// DELETE /notifications/{notificationId}

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications management APIs
 */

// GET /notifications
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all user notifications
 *     description: Retrieve all notifications for the authenticated user, ordered by creation date descending.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notifications fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567890a
 *                       user:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567890b
 *                       title:
 *                         type: string
 *                         example: Order Status Updated
 *                       message:
 *                         type: string
 *                         example: Your order #123456 has been marked as Shipped.
 *                       type:
 *                         type: string
 *                         enum: [order, review, other]
 *                         example: order
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       relatedId:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567890c
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-21T14:30:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-21T14:30:00.000Z
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */

// PATCH /notifications/read-all
/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications of the authenticated user as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                       example: true
 *                     modifiedCount:
 *                       type: number
 *                       example: 5
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */

// DELETE /notifications
/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Delete all notifications
 *     description: Delete all notifications belonging to the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: All notifications deleted successfully
 *                 data:
 *                   type: array
 *                   items: {}
 *                   example: []
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */

// GET /notifications/{notificationId}
/**
 * @swagger
 * /notifications/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     description: Retrieve specific notification details by ID for the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the notification
 *     responses:
 *       200:
 *         description: Notification fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     user:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890b
 *                     title:
 *                       type: string
 *                       example: Order Shipped
 *                     message:
 *                       type: string
 *                       example: Your order is on the way!
 *                     type:
 *                       type: string
 *                       example: order
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                     relatedId:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890c
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other user notifications
 *       404:
 *         description: No notification found with this id
 *
 *   patch:
 *     summary: Mark notification as read by ID
 *     description: Mark an individual notification as read by its ID.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the notification
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other user notifications
 *       404:
 *         description: No notification found with this id
 *
 *   delete:
 *     summary: Delete notification by ID
 *     description: Delete a specific notification by ID. The notification must belong to the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the notification
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other user notifications
 *       404:
 *         description: No notification found with this id
 */

// PATCH /notifications/{notificationId}/read
/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark single notification as read
 *     description: Mark an individual notification as read by ID.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the notification
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other user notifications
 *       404:
 *         description: No notification found with this id
 */

export {};
