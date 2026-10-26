// GET    /tickets/my
// POST   /tickets
// GET    /tickets/{ticketId}
// PUT    /tickets/{ticketId}
// DELETE /tickets/{ticketId}
// POST   /tickets/{ticketId}/messages
export {};
/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Support tickets and user assistance APIs
 */
// GET /tickets/my
/**
 * @swagger
 * /tickets/my:
 *   get:
 *     summary: Get user's own tickets
 *     description: Retrieve all support tickets created by the authenticated user, ordered by creation date descending.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Your Tickets fetched successfully
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
 *                   example: Your Tickets fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67b901234567890abcdef123
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-10-21T18:00:00.000Z
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// POST /tickets
/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a support ticket
 *     description: Create a new support ticket with an initial message.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - category
 *               - priority
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Order damaged upon arrival
 *               category:
 *                 type: string
 *                 enum: [shipping, payment, product, other]
 *                 example: product
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *                 example: Medium
 *               message:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 1000
 *                 example: The package arrived with the outer box severely crushed and the product inside is scratched.
 *               order:
 *                 type: string
 *                 example: 664fa1e2b5c7e1234567890b
 *     responses:
 *       201:
 *         description: Ticket created successfully
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
 *                   example: Ticket created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     category:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: open
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad Request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
// GET /tickets/{ticketId}
/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve detailed information about a specific ticket including its conversation messages and sender details. Accessible only to ticket creator or admins.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: 24-character hexadecimal MongoDB ObjectId of the ticket
 *     responses:
 *       200:
 *         description: Ticket fetched successfully
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
 *                   example: Ticket fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     category:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     status:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           sender:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this ticket
 *       404:
 *         description: Ticket not found
 */
// PUT /tickets/{ticketId}
/**
 * @swagger
 * /tickets/{ticketId}:
 *   put:
 *     summary: Update ticket
 *     description: Update ticket details or status (open, in_progress, resolved, closed).
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [shipping, payment, product, other]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
// DELETE /tickets/{ticketId}
/**
 * @swagger
 * /tickets/{ticketId}:
 *   delete:
 *     summary: Delete ticket
 *     description: Permanently delete a support ticket.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
// POST /tickets/{ticketId}/messages
/**
 * @swagger
 * /tickets/{ticketId}/messages:
 *   post:
 *     summary: Add reply message to ticket
 *     description: Append a new message to the ticket conversation. Accessible to ticket owner or admins.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Thank you for your response. Here are the tracking details you requested.
 *     responses:
 *       201:
 *         description: Message added successfully
 *       400:
 *         description: Message content is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
//# sourceMappingURL=ticket.docs.js.map