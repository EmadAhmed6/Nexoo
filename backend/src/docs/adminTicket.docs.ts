// GET /admin/tickets
// PUT /admin/tickets/{ticketId}

/**
 * @swagger
 * tags:
 *   name: Admin Tickets
 *   description: Admin support ticket management and status resolution APIs
 */

/**
 * @swagger
 * /admin/tickets:
 *   get:
 *     summary: Retrieve all tickets (Admin only)
 *     description: Retrieve all customer support tickets across the platform with user details populated, sorted newest first.
 *     tags:
 *       - Admin Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
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
 *                   example: Tickets fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67b901234567890abcdef123
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 67b901234567890abcdef001
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                       subject:
 *                         type: string
 *                         example: Issue with order delivery
 *                       category:
 *                         type: string
 *                         enum: [shipping, payment, product, other]
 *                         example: shipping
 *                       status:
 *                         type: string
 *                         enum: [open, in_progress, resolved, closed]
 *                         example: open
 *                       priority:
 *                         type: string
 *                         enum: [Low, Medium, High, Urgent]
 *                         example: High
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["67b901234567890abcdef999"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-21T18:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-21T18:00:00.000Z
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin role
 */

/**
 * @swagger
 * /admin/tickets/{ticketId}:
 *   put:
 *     summary: Update ticket status (Admin only)
 *     description: Update the status of a specific support ticket (open, in_progress, resolved, closed).
 *     tags:
 *       - Admin Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: 24-character hexadecimal MongoDB ObjectId of the ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Ticket updated successfully
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
 *                   example: Ticket updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67b901234567890abcdef123
 *                     status:
 *                       type: string
 *                       enum: [open, in_progress, resolved, closed]
 *                       example: in_progress
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-10-21T18:00:00.000Z
 *       400:
 *         description: Bad Request - Ticket ID or Status is required
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin role
 *       404:
 *         description: Ticket not found
 */
