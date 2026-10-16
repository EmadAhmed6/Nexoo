// POST   /orders
// GET    /orders
// GET    /orders/{orderId}
// POST   /orders/paymob/create
// POST   /orders/paymob/verify
// POST   /orders/paymob/webhook
// PUT    /orders/{orderId}
// DELETE /orders/{orderId}

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order processing, management, and Paymob checkout APIs
 */

// POST /orders
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from cart
 *     description: Creates a new order using the authenticated user's current cart items and empties the cart upon success.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - address
 *                   - city
 *                   - state
 *                   - country
 *                   - postalCode
 *                   - phone
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: 15 El-Tahrir Street, Apt 4B
 *                   city:
 *                     type: string
 *                     example: Cairo
 *                   state:
 *                     type: string
 *                     example: Cairo
 *                   country:
 *                     type: string
 *                     example: Egypt
 *                   postalCode:
 *                     type: string
 *                     example: "11371"
 *                   phone:
 *                     type: string
 *                     example: "01012345678"
 *               paymentMethod:
 *                 type: string
 *                 enum: [Paymob, Stripe, COD]
 *                 example: Paymob
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67092147385a812bf0e54321
 *                     user:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890b
 *                     orderItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pricing:
 *                       type: object
 *                       properties:
 *                         totalOrderPrice:
 *                           type: number
 *                           example: 4500
 *                     payment:
 *                       type: object
 *                       properties:
 *                         paymentMethod:
 *                           type: string
 *                           example: Paypal
 *                         isPaid:
 *                           type: boolean
 *                           example: false
 *                     orderStatus:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: Pending
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Cart is empty or not found
 */

// GET /orders
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve all orders placed by the authenticated user, sorted by most recent.
 *     tags:
 *       - Orders
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
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */

// GET /orders/{orderId}
/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve details of a specific order belonging to the authenticated user.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 67092147385a812bf0e54321
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order was not found
 */

// POST /orders/paymob/create
/**
 * @swagger
 * /orders/paymob/create:
 *   post:
 *     summary: Create Paymob checkout session
 *     description: Initiate a Paymob Unified Checkout intention for an existing unpaid order and obtain the checkoutUrl.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 67092147385a812bf0e54321
 *     responses:
 *       200:
 *         description: Paymob checkout session created successfully
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
 *                   example: Paymob checkout session created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: 67092147385a812bf0e54321
 *                     checkoutUrl:
 *                       type: string
 *                       example: https://accept.paymob.com/unifiedcheckout/?publicKey=...&clientSecret=...
 *                     clientSecret:
 *                       type: string
 *       400:
 *         description: This order is already paid
 *       404:
 *         description: Order not found
 */

// POST /orders/paymob/verify
/**
 * @swagger
 * /orders/paymob/verify:
 *   post:
 *     summary: Verify Paymob payment
 *     description: Verify payment status returned from Paymob redirect. Updates order payment status to paid if successful.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 67092147385a812bf0e54321
 *               success:
 *                 type: string
 *                 example: "true"
 *               transactionId:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                   example: Payment verified successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Payment failed or was not successful
 *       404:
 *         description: Order not found
 */

// PUT /orders/{orderId}
/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Update order details
 *     description: Update shipping address or payment method for a pending order.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 67092147385a812bf0e54321
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *                 enum: [Paymob, Stripe, COD]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid input or order is already processing/shipped
 *       404:
 *         description: Order not found
 */

// DELETE /orders/{orderId}
/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete / cancel order
 *     description: Cancel and permanently delete a pending order.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 67092147385a812bf0e54321
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
