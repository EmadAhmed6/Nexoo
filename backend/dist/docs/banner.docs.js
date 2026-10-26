// GET    /banners
// GET    /admin/banners
// POST   /admin/banners
// GET    /admin/banners/{bannerId}
// PUT    /admin/banners/{bannerId}
// DELETE /admin/banners/{bannerId}
export {};
/**
 * @swagger
 * tags:
 *   - name: Banners
 *     description: Public promotional and hero banners APIs
 *   - name: Admin Banners
 *     description: Admin banner management, upload, and scheduling APIs
 */
// ==========================================
// PUBLIC BANNERS
// ==========================================
// GET /banners
/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get active banners
 *     description: Retrieve all active banners for a specific position (e.g., hero_home, hero_category, hero_product) that fall within the current date range, sorted by priority (highest first) and newest.
 *     tags:
 *       - Banners
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [hero_home, hero_category, hero_product, all]
 *           default: hero_home
 *         description: Position filter for the banner
 *     responses:
 *       200:
 *         description: Active banners fetched successfully
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
 *                   example: Active banners fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6718a931a9b4c10023e1109a
 *                       title:
 *                         type: string
 *                         example: Spring Collection 2026
 *                       subtitle:
 *                         type: string
 *                         example: Discover the latest trends with up to 40% discount
 *                       image:
 *                         type: object
 *                         properties:
 *                           publicId:
 *                             type: string
 *                             example: Banners/xy123456
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/demo/image/upload/v123456/banner.jpg
 *                       linkType:
 *                         type: string
 *                         enum: [category, product, external, none]
 *                         example: category
 *                       linkValue:
 *                         type: string
 *                         example: Clothes
 *                       position:
 *                         type: string
 *                         enum: [hero_home, hero_category, hero_product]
 *                         example: hero_home
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       priority:
 *                         type: number
 *                         example: 10
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-03-01T00:00:00.000Z
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-01T00:00:00.000Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
// ==========================================
// ADMIN BANNERS
// ==========================================
// GET /admin/banners/overview
/**
 * @swagger
 * /admin/banners/overview:
 *   get:
 *     summary: Get banner overview statistics (Admin only)
 *     description: Retrieve total, active, inactive, and position breakdown counts for banners.
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banner overview fetched successfully
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
 *                   example: Banner overview fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeBanners:
 *                       type: number
 *                       example: 5
 *                     totalBanners:
 *                       type: number
 *                       example: 8
 *                     inactiveBanners:
 *                       type: number
 *                       example: 3
 *                     heroHomeBanners:
 *                       type: number
 *                       example: 4
 *                     heroCategoryBanners:
 *                       type: number
 *                       example: 2
 *                     heroProductBanners:
 *                       type: number
 *                       example: 2
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 * /admin/banners:
 *   get:
 *     summary: Get all banners (Admin only)
 *     description: Retrieve all banners with optional search, active status, position filters, and pagination. Requires Admin authentication.
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [hero_home, hero_category, hero_product, all]
 *         description: Optional filter by position
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching title or subtitle
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of banners per page
 *     responses:
 *       200:
 *         description: Banners fetched successfully
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
 *                   example: Banners fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       subtitle:
 *                         type: string
 *                       image:
 *                         type: object
 *                         properties:
 *                           publicId:
 *                             type: string
 *                           url:
 *                             type: string
 *                       linkType:
 *                         type: string
 *                       linkValue:
 *                         type: string
 *                       position:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       priority:
 *                         type: number
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - Admin access required
 */
// POST /admin/banners
/**
 * @swagger
 * /admin/banners:
 *   post:
 *     summary: Create a new banner (Admin only)
 *     description: Uploads a banner image to Cloudinary and saves banner configuration. Requires Admin authentication.
 *     tags:
 *       - Admin Banners
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
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Mega Sale
 *               subtitle:
 *                 type: string
 *                 example: Extra 20% off on all items with code SUMMER26
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Banner image to upload
 *               linkType:
 *                 type: string
 *                 enum: [category, product, external, none]
 *                 default: none
 *                 example: category
 *               linkValue:
 *                 type: string
 *                 example: Electronics
 *               position:
 *                 type: string
 *                 enum: [hero_home, hero_category, hero_product]
 *                 default: hero_home
 *                 example: hero_home
 *               priority:
 *                 type: number
 *                 default: 1
 *                 example: 5
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T00:00:00.000Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       400:
 *         description: Invalid inputs or missing image
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// GET /admin/banners/{bannerId}
/**
 * @swagger
 * /admin/banners/{bannerId}:
 *   get:
 *     summary: Get banner by ID (Admin only)
 *     description: Retrieve detailed information for a specific banner. Requires Admin authentication.
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the banner
 *     responses:
 *       200:
 *         description: Banner fetched successfully
 *       404:
 *         description: Banner not found
 */
// PUT /admin/banners/{bannerId}
/**
 * @swagger
 * /admin/banners/{bannerId}:
 *   put:
 *     summary: Update a banner (Admin only)
 *     description: Update banner information or replace banner image. Requires Admin authentication.
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the banner
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Sale Title
 *               subtitle:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image to replace current banner image
 *               linkType:
 *                 type: string
 *                 enum: [category, product, external, none]
 *               linkValue:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [hero_home, hero_category, hero_product]
 *               priority:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       400:
 *         description: Invalid inputs
 *       404:
 *         description: Banner not found
 */
// DELETE /admin/banners/{bannerId}
/**
 * @swagger
 * /admin/banners/{bannerId}:
 *   delete:
 *     summary: Delete a banner (Admin only)
 *     description: Delete a banner and remove its image asset from Cloudinary. Requires Admin authentication.
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the banner
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 */
//# sourceMappingURL=banner.docs.js.map