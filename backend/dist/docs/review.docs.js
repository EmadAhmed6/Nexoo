// GET    /reviews/{productId}
// POST   /reviews/{productId}
// PUT    /reviews/{reviewId}
// DELETE /reviews/{reviewId}
export {};
/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews and ratings management APIs
 */
// GET /reviews/{productId}
/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     description: Retrieve all reviews and ratings for a product with populated user information (name, username, avatar).
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
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
 *                   example: Reviews fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67104b90e1234567890abcd1
 *                       product:
 *                         type: string
 *                         example: 6ac92261707ab25c5d1ed396
 *                       ratings:
 *                         type: number
 *                         example: 5
 *                       reviewText:
 *                         type: string
 *                         example: Exceptional product quality, exceeded expectations!
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 664fa1e2b5c7e1234567890a
 *                           fullName:
 *                             type: string
 *                             example: Ahmed Mohamed
 *                           username:
 *                             type: string
 *                             example: ahmed_dev
 *                           profilePicture:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                                 example: https://res.cloudinary.com/.../avatar.jpg
 *                       createdAt:
 *                         type: string
 *                         example: 2026-10-14T18:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         example: 2026-10-14T18:00:00.000Z
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Product ID is required
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Product not found
 */
// POST /reviews/{productId}
/**
 * @swagger
 * /reviews/{productId}:
 *   post:
 *     summary: Create or submit product review
 *     description: Submit a review and rating (1-5) for a product. If the user already reviewed the product, updates their existing review. Automatically updates the product's average rating and total review quantity.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ratings
 *               - reviewText
 *             properties:
 *               ratings:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Product rating between 1 and 5
 *               reviewText:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Exceptional build quality, arrived quickly!
 *                 description: Customer feedback and opinion
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                   example: Review created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       type: object
 *                     productRating:
 *                       type: number
 *                       example: 4.8
 *                     productRatingQuantity:
 *                       type: number
 *                       example: 12
 *       200:
 *         description: Review updated successfully (if user already reviewed)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       404:
 *         description: Product not found
 */
// PUT /reviews/{reviewId}
/**
 * @swagger
 * /reviews/{reviewId}:
 *   put:
 *     summary: Update an existing review
 *     description: Update rating or review text for a specific review. Allowed only for the review author, an Admin, or a SuperAdmin.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ratings:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               reviewText:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Updated review text after 1 month of use.
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *                   example: Review updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       type: object
 *                     productRating:
 *                       type: number
 *                       example: 4.5
 *                     productRatingQuantity:
 *                       type: number
 *                       example: 12
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to edit this review
 *       404:
 *         description: Review not found
 */
// DELETE /reviews/{reviewId}
/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     description: Permanently delete a review by its ID. Allowed only for the review author, an Admin, or a SuperAdmin. Recalculates product rating statistics automatically.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
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
 *                   example: Review deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     productRating:
 *                       type: number
 *                       example: 4.5
 *                     productRatingQuantity:
 *                       type: number
 *                       example: 11
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to delete this review
 *       404:
 *         description: Review not found
 */
//# sourceMappingURL=review.docs.js.map