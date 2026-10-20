// GET    /users
// GET    /users/{userId}
// PUT    /users/{userId}
// DELETE /users/{userId}
// GET    /users/{userId}/addresses
// POST   /users/{userId}/addresses
// PUT    /users/{userId}/addresses/{addressId}
// DELETE /users/{userId}/addresses/{addressId}

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

// GET    /users/{userId}/addresses
/**
 * @swagger
 * /users/{userId}/addresses:
 *   get:
 *     summary: Get all user addresses
 *     description: Retrieve all saved addresses for a specific user. Requires authentication.
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
 *         description: User addresses fetched successfully
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
 *                   example: User addresses fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 664fa1e2b5c7e1234567891b
 *                       street:
 *                         type: string
 *                         example: 15 El-Tahrir Street, Apt 4B
 *                       city:
 *                         type: string
 *                         example: Cairo
 *                       state:
 *                         type: string
 *                         example: Cairo
 *                       postalCode:
 *                         type: string
 *                         example: "11511"
 *                       phone:
 *                         type: string
 *                         example: "01012345678"
 *                       isDefault:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: User not found
 */

// POST   /users/{userId}/addresses
/**
 * @swagger
 * /users/{userId}/addresses:
 *   post:
 *     summary: Add new address
 *     description: Add a new address to the user's addresses list. Requires authorized token (Owner, Admin, or SuperAdmin).
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
 *             required:
 *               - street
 *               - city
 *               - state
 *               - phone
 *             properties:
 *               street:
 *                 type: string
 *                 example: 15 El-Tahrir Street, Apt 4B
 *               city:
 *                 type: string
 *                 example: Cairo
 *               state:
 *                 type: string
 *                 example: Cairo
 *               postalCode:
 *                 type: string
 *                 example: "11511"
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       200:
 *         description: Address added successfully
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
 *                   example: Address added successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error or invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not Authorized
 *       404:
 *         description: User was not found
 */

// PUT    /users/{userId}/addresses/{addressId}
/**
 * @swagger
 * /users/{userId}/addresses/{addressId}:
 *   put:
 *     summary: Update user address
 *     description: Update an existing address. Requires authorized token (Owner, Admin, or SuperAdmin).
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
 *       - name: addressId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 664fa1e2b5c7e1234567891b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: 20 Updated St
 *               city:
 *                 type: string
 *                 example: Giza
 *               state:
 *                 type: string
 *                 example: Giza
 *               postalCode:
 *                 type: string
 *                 example: "12345"
 *               phone:
 *                 type: string
 *                 example: "01099999999"
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: Address updated successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not Authorized
 *       404:
 *         description: User or address not found
 */

// DELETE /users/{userId}/addresses/{addressId}
/**
 * @swagger
 * /users/{userId}/addresses/{addressId}:
 *   delete:
 *     summary: Delete user address
 *     description: Remove an address from user profile. Requires authorized token (Owner, Admin, or SuperAdmin).
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
 *       - name: addressId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 664fa1e2b5c7e1234567891b
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Address not found or missing ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not Authorized
 *       404:
 *         description: User not found
 */

