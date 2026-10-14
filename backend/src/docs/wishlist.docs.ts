// GET    /wishlist
// POST   /wishlist
// POST   /wishlist/{productId}
// DELETE /wishlist/{productId}
// DELETE /wishlist

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management APIs
 */

// GET /wishlist
/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user wishlist
 *     description: Retrieve the wishlist of the authenticated user with populated product details.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
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
 *                   example: Wishlist fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     user:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890b
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ac92261707ab25c5d1ed396
 *                           title:
 *                             type: string
 *                             example: Luxury Chronograph Watch
 *                           description:
 *                             type: string
 *                             example: Premium stainless steel automatic watch
 *                           price:
 *                             type: number
 *                             example: 3500
 *                           priceAfterDiscount:
 *                             type: number
 *                             example: 2800
 *                           productImages:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 url:
 *                                   type: string
 *                                 publicId:
 *                                   type: string
 *                           category:
 *                             type: string
 *                             example: Watches
 *                           stock:
 *                             type: number
 *                             example: 12
 *                           ratingAverage:
 *                             type: number
 *                             example: 4.8
 *                           ratingQuantity:
 *                             type: number
 *                             example: 15
 *       401:
 *         description: Unauthorized
 */

// POST /wishlist/{productId}
/**
 * @swagger
 * /wishlist/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     description: Add a product to the authenticated user's wishlist.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ac92261707ab25c5d1ed396
 *     responses:
 *       200:
 *         description: Added to wishlist successfully
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
 *                   example: Added to wishlist successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Valid Product ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No Product found with this id
 */

// DELETE /wishlist/{productId}
/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     description: Remove a specific product from the authenticated user's wishlist.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ac92261707ab25c5d1ed396
 *     responses:
 *       200:
 *         description: Removed from wishlist successfully
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
 *                   example: Removed from wishlist successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Valid Product ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No Wishlist found for this user
 */

// DELETE /wishlist
/**
 * @swagger
 * /wishlist:
 *   delete:
 *     summary: Clear wishlist
 *     description: Remove all products from the authenticated user's wishlist.
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
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
 *                   example: Wishlist cleared successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
