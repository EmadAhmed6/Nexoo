// GET    /products
// POST   /products
// GET    /products/{productId}
// PUT    /products/{productId}
// DELETE /products/{productId}

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

// GET    /products
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters & pagination
 *     description: Retrieve products with pagination, search, price range, stock status, ratings, and discounts.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search by title, description, category, price, or stock
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Filter by minimum price
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Filter by maximum price
 *       - name: inStock
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by in stock ("true" for stock > 0, "false" for stock <= 0)
 *       - name: minRating
 *         in: query
 *         schema:
 *           type: number
 *         description: Filter by minimum average rating
 *       - name: maxRating
 *         in: query
 *         schema:
 *           type: number
 *         description: Filter by maximum average rating
 *       - name: hasDiscount
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by discount ("true" has discount, "false" no discount)
 *     responses:
 *       200:
 *         description: Products fetched successfully
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
 *                   example: Products fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6ac92261707ab25c5d1ed396
 *                           userId:
 *                             type: string
 *                             example: 664fa1e2b5c7e1234567890a
 *                           title:
 *                             type: string
 *                             example: Casual Shirt
 *                           description:
 *                             type: string
 *                             example: High quality pure cotton casual shirt
 *                           price:
 *                             type: number
 *                             example: 200
 *                           priceAfterDiscount:
 *                             type: number
 *                             example: 150
 *                           stock:
 *                             type: number
 *                             example: 20
 *                           category:
 *                             type: string
 *                             example: Clothing
 *                           ratingAverage:
 *                             type: number
 *                             example: 4.5
 *                           ratingQuantity:
 *                             type: number
 *                             example: 10
 *                           productImages:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 url:
 *                                   type: string
 *                                 publicId:
 *                                   type: string
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *                     totalProducts:
 *                       type: number
 *                       example: 45
 *       401:
 *         description: Unauthorized
 */

// POST   /products
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a product with multiple image uploads to Cloudinary (up to 5 images). The authenticated user becomes the product owner.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - productImages
 *             properties:
 *               title:
 *                 type: string
 *                 example: Men Casual Cotton Shirt
 *               description:
 *                 type: string
 *                 example: High quality breathable cotton material
 *               price:
 *                 type: number
 *                 example: 250
 *               priceAfterDiscount:
 *                 type: number
 *                 example: 199
 *               stock:
 *                 type: number
 *                 example: 50
 *               category:
 *                 type: string
 *                 example: Clothing
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload (1 to 5 files)
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid inputs or no file uploaded
 *       401:
 *         description: Unauthorized
 */

// GET    /products/{productId}
/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve detailed information for a single product.
 *     tags:
 *       - Products
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
 *         description: Product fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No Product found with this id
 */

// PUT    /products/{productId}
/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     summary: Update product (Owner or Admin)
 *     description: Update an existing product. Image modification is optional; existing images can be retained via existingImages JSON, and individual replacement or new images can be uploaded via productImages.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ac92261707ab25c5d1ed396
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Men Casual Cotton Shirt Updated
 *               description:
 *                 type: string
 *                 example: Updated premium material details
 *               price:
 *                 type: number
 *                 example: 280
 *               priceAfterDiscount:
 *                 type: number
 *                 example: 210
 *               stock:
 *                 type: number
 *                 example: 35
 *               category:
 *                 type: string
 *                 example: Clothing
 *               existingImages:
 *                 type: string
 *                 description: JSON string or array of kept existing images [{"url":"...","publicId":"..."}]
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional replacement or additional image files (up to 5 total images)
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid inputs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only product owner or admin can update
 *       404:
 *         description: No Product found with this id
 */

// DELETE /products/{productId}
/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete product (Owner or Admin)
 *     description: Permanently delete a product by its ID. Only the product owner, Admin, or SuperAdmin can delete.
 *     tags:
 *       - Products
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
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only product owner or admin can delete
 *       404:
 *         description: No Product found with this id
 */
