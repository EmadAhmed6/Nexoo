// GET    /users
// GET    /users/{userId}
// PUT    /users/{userId}
// DELETE /users/{userId}
export {};
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */
// GET    /users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all registered users. Requires authentication.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: Users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567890a
 *                       fullName:
 *                         type: string
 *                         example: Ahmed Mohamed
 *                       username:
 *                         type: string
 *                         example: ahmed_dev
 *                       email:
 *                         type: string
 *                         example: ahmed@example.com
 *                       role:
 *                         type: string
 *                         example: User
 *                       phone:
 *                         type: string
 *                         example: "01012345678"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Invalid or expired token
 *       404:
 *         description: Users not found
 */
// GET    /users/{userId}
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve details of a single user by their ID. Requires authentication.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 664fa1e2b5c7e1234567890a
 *     responses:
 *       200:
 *         description: User found successfully
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
 *                   example: User fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664fa1e2b5c7e1234567890a
 *                     fullName:
 *                       type: string
 *                       example: Ahmed Mohamed
 *                     username:
 *                       type: string
 *                       example: ahmed_dev
 *                     email:
 *                       type: string
 *                       example: ahmed@example.com
 *                     role:
 *                       type: string
 *                       example: User
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
// PUT    /users/{userId}
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user
 *     description: Update user details. Requires authorized token (Owner, Admin, or SuperAdmin).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 664fa1e2b5c7e1234567890a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ahmed Mohamed Updated
 *               phone:
 *                 type: string
 *                 example: "01099999999"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not Authorized
 *       404:
 *         description: User not found
 */
// DELETE /users/{userId}
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account. Requires authorized token (Owner, Admin, or SuperAdmin).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 664fa1e2b5c7e1234567890a
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not Authorized
 */
//# sourceMappingURL=user.docs.js.map