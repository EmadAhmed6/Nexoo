// GET    /coupons
// POST   /coupons
// POST   /coupons/apply
// DELETE /coupons/remove
// PUT    /coupons/{couponId}
// DELETE /coupons/{couponId}
export {};
/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupons and discount management APIs
 */
// GET    /coupons
/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     description: Retrieve list of all coupons sorted by newest first. Requires Admin or SuperAdmin authentication.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
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
 *                   example: Coupons fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567890a
 *                       couponCode:
 *                         type: string
 *                         example: SUMMER20
 *                       discountType:
 *                         type: string
 *                         enum: [percentage, fixed]
 *                         example: percentage
 *                       discountValue:
 *                         type: number
 *                         example: 20
 *                       usageLimit:
 *                         type: number
 *                         example: 50
 *                       usedCount:
 *                         type: number
 *                         example: 5
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-01T00:00:00.000Z
 *                       expireDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-08-31T23:59:59.000Z
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - Requires Admin role
 */
// POST   /coupons
/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a new coupon (Admin only)
 *     description: Create a discount coupon with percentage or fixed amount. Requires Admin or SuperAdmin authentication.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *               - discountType
 *               - discountValue
 *               - startDate
 *               - expireDate
 *             properties:
 *               couponCode:
 *                 type: string
 *                 example: LUXURY50
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: percentage
 *               discountValue:
 *                 type: number
 *                 example: 50
 *               usageLimit:
 *                 type: number
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-01"
 *               expireDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-31"
 *     responses:
 *       201:
 *         description: Coupon created successfully
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
 *                   example: Coupon created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or duplicate coupon code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
// POST   /coupons/apply
/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply coupon code to user cart
 *     description: Applies an active, valid coupon code to the authenticated user's current cart and recalculates total price.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *             properties:
 *               couponCode:
 *                 type: string
 *                 example: SUMMER20
 *     responses:
 *       200:
 *         description: Coupon applied successfully
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
 *                   example: Coupon applied successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalTotal:
 *                       type: number
 *                       example: 1000
 *                     discountAmount:
 *                       type: number
 *                       example: 200
 *                     finalPrice:
 *                       type: number
 *                       example: 800
 *                     couponCode:
 *                       type: string
 *                       example: SUMMER20
 *       400:
 *         description: Coupon expired, inactive, or usage limit exceeded
 *       404:
 *         description: Coupon not found or cart is empty
 */
// DELETE /coupons/remove
/**
 * @swagger
 * /coupons/remove:
 *   delete:
 *     summary: Remove applied coupon from cart
 *     description: Removes any applied coupon discount from the authenticated user's active shopping cart.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
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
 *                   example: Coupon removed successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Cart not found or empty
 */
// PUT    /coupons/{couponId}
/**
 * @swagger
 * /coupons/{couponId}:
 *   put:
 *     summary: Update coupon details (Admin only)
 *     description: Update discount amount, validity dates, status, or usage limits for an existing coupon.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the coupon to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode:
 *                 type: string
 *                 example: SUMMER25
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               usageLimit:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date
 *               expireDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Validation error or duplicate coupon code
 *       404:
 *         description: Coupon not found
 *       403:
 *         description: Forbidden - Admin only
 */
// DELETE /coupons/{couponId}
/**
 * @swagger
 * /coupons/{couponId}:
 *   delete:
 *     summary: Delete a coupon (Admin only)
 *     description: Permanently delete an unused coupon by ID. Coupons that have already been used cannot be deleted.
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the coupon to delete
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       400:
 *         description: Coupon cannot be deleted as it has already been used
 *       404:
 *         description: Coupon not found
 *       403:
 *         description: Forbidden - Admin only
 */
//# sourceMappingURL=coupon.docs.js.map