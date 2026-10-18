/**
 * @swagger
 * tags:
 *   name: Admin Orders
 *   description: Admin order management, monitoring, and status fulfillment APIs
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Retrieve all orders (Admin only)
 *     description: Fetches a complete list of all customer orders placed across the store, sorted by creation date descending, with populated customer user details.
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
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
 *                   example: Orders fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67123985a123bf0e54321
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 67092147385a812bf0e54321
 *                           fullName:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                       orderItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                       shippingAddress:
 *                         type: object
 *                       pricing:
 *                         type: object
 *                       payment:
 *                         type: object
 *                       orderStatus:
 *                         type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin or SuperAdmin role
 *       404:
 *         description: Orders not found
 */

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   get:
 *     summary: Retrieve single order details by ID (Admin only)
 *     description: Returns detailed order information by order ID, including populated user and product details.
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ID
 *         example: 67123985a123bf0e54321
 *     responses:
 *       200:
 *         description: Order fetched successfully
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
 *                   example: Order fetched successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Order not found
 *
 *   patch:
 *     summary: Update order status & delivery details (Admin only)
 *     description: Updates the status of an order. When status is set to "Delivered", isDelivered is automatically updated to true and deliveredAt is timestamped.
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ID
 *         example: 67123985a123bf0e54321
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *                 example: Shipped
 *               isPaid:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *                   example: Order status updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad Request - Missing or invalid orderStatus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Order not found
 */
