// GET    /cart
// POST   /cart/{productId}
// PUT    /cart/{productId}
// DELETE /cart/{productId}
export {};
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management APIs
 */
// GET /cart
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     description: Retrieve the shopping cart of the authenticated user with populated product details.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
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
 *                   example: Cart fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     userId:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890b
 *                     cartItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 6ac92261707ab25c5d1ed396
 *                               title:
 *                                 type: string
 *                                 example: Luxury Chronograph Watch
 *                               price:
 *                                 type: number
 *                                 example: 250
 *                               priceAfterDiscount:
 *                                 type: number
 *                                 example: 200
 *                               productImages:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     url:
 *                                       type: string
 *                                       example: https://res.cloudinary.com/...
 *                                     publicId:
 *                                       type: string
 *                                       example: Products/img1
 *                           productQuantity:
 *                             type: number
 *                             example: 2
 *                           productPrice:
 *                             type: number
 *                             example: 200
 *                     totalPrice:
 *                       type: number
 *                       example: 400
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Cart is empty
 */
// POST /cart/{productId}
/**
 * @swagger
 * /cart/{productId}:
 *   post:
 *     summary: Add product to cart
 *     description: Add a product to the user's shopping cart by product ID. If the item already exists in the cart, its quantity will be increased.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to add
 *         example: 6ac92261707ab25c5d1ed396
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productQuantity:
 *                 type: number
 *                 description: Quantity to add (defaults to 1)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product added to cart successfully
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
 *                   example: Product added to cart successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid inputs or requested quantity exceeds available stock
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Product not found
 */
// PUT /cart/{productId}
/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Update product quantity in cart
 *     description: Update the quantity of a specific product already present in the user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product in the cart
 *         example: 6ac92261707ab25c5d1ed396
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productQuantity
 *             properties:
 *               productQuantity:
 *                 type: number
 *                 minimum: 1
 *                 description: New quantity of the item
 *                 example: 3
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
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
 *                   example: Product quantity updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid inputs or product out of stock
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Cart or product in cart not found
 */
// DELETE /cart/{productId}
/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     description: Remove a specific product completely from the user's shopping cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to remove
 *         example: 6ac92261707ab25c5d1ed396
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
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
 *                   example: Product removed from cart successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Cart or product in cart not found
 */
// DELETE /cart
/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear entire cart
 *     description: Completely delete the authenticated user's shopping cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
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
 *                   example: Cart cleared successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPrice:
 *                       type: number
 *                       example: 0
 *                     cartItems:
 *                       type: array
 *                       example: []
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Cart was not found
 */
//# sourceMappingURL=cart.docs.js.map