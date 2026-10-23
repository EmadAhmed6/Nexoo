// PUT /admin/users/{userId}/ban
// PUT /admin/users/{userId}/unban

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: Admin user moderation, banning, and account control APIs
 */

/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   put:
 *     summary: Ban a user temporarily (Admin only)
 *     description: Suspends a user's account for a specified number of days. While banned, the user is blocked from logging in and accessing protected endpoints.
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user to ban
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - banDuration
 *             properties:
 *               banDuration:
 *                 type: number
 *                 example: 7
 *                 description: Ban duration in days
 *     responses:
 *       200:
 *         description: User banned successfully
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
 *                   example: User banned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isBanned:
 *                       type: boolean
 *                       example: true
 *                     banExpires:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-10-30T12:00:00.000Z
 *       400:
 *         description: Invalid ban duration
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required or cannot ban SuperAdmin
 *       404:
 *         description: User was not found
 *
 *   patch:
 *     summary: Ban a user temporarily (PATCH alias)
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - banDuration
 *             properties:
 *               banDuration:
 *                 type: number
 *                 example: 7
 *     responses:
 *       200:
 *         description: User banned successfully
 *
 * /admin/users/{userId}/unban:
 *   put:
 *     summary: Lift ban and restore user access (Admin only)
 *     description: Immediately removes the ban status and expiration date from a user account.
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user to unban
 *     responses:
 *       200:
 *         description: User unbanned successfully
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
 *                   example: User unbanned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     isBanned:
 *                       type: boolean
 *                       example: false
 *                     banExpires:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User was not found
 *
 *   patch:
 *     summary: Lift ban and restore user access (PATCH alias)
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unbanned successfully
 */
