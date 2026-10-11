// POST   /auth/register
// POST   /auth/login
export {};
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */
// POST   /auth/register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns account details with access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ahmed Mohamed
 *               username:
 *                 type: string
 *                 example: ahmed_dev
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: User registered successfully
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
 *                     phone:
 *                       type: string
 *                       example: "01012345678"
 *                     role:
 *                       type: string
 *                       enum: [User, Admin, SuperAdmin]
 *                       example: User
 *                     provider:
 *                       type: string
 *                       enum: [local, google]
 *                       example: local
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error or user already exists
 */
// POST   /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user credentials and returns an access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: User logged in successfully
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
 *                   example: User logged in successfully
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
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid email or password, or user does not exist
 */
//# sourceMappingURL=auth.docs.js.map