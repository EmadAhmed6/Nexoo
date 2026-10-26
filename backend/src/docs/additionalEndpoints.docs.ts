/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify an account email with its OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: ahmed@example.com }
 *               otp: { type: string, minLength: 6, maxLength: 6, example: '123456' }
 *     responses:
 *       200: { description: OTP verified; returns account data and an access token }
 *       400: { description: Invalid or expired OTP }
 *       404: { description: User not found }
 *
 * /auth/resend-otp:
 *   post:
 *     summary: Resend the email verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: ahmed@example.com }
 *     responses:
 *       200: { description: OTP sent successfully }
 *       400: { description: Invalid email }
 *       404: { description: User not found or account already verified }
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: ahmed@example.com }
 *     responses:
 *       200: { description: Reset link sent when the account exists }
 *       400: { description: Invalid email }
 *       404: { description: User not found }
 *
 * /auth/reset-password:
 *   post:
 *     summary: Reset a password using the emailed token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword, token]
 *             properties:
 *               email: { type: string, format: email, example: ahmed@example.com }
 *               newPassword: { type: string, format: password, example: Password123 }
 *               token: { type: string, example: eyJhbGciOi... }
 *     responses:
 *       200: { description: Password reset successfully }
 *       400: { description: Invalid or expired token, or invalid input }
 *       404: { description: User not found }
 *
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user's account
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Authenticated account returned }
 *       401: { description: Missing or invalid access token }
 *
 * /auth/refresh:
 *   get:
 *     summary: Refresh the access token (GET alias)
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: New access token returned }
 *       400: { description: Refresh token missing or invalid }
 *   post:
 *     summary: Refresh the access token
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: New access token returned }
 *       400: { description: Refresh token missing or invalid }
 *
 * /auth/logout:
 *   get:
 *     summary: Log out and clear the refresh-token cookie (GET alias)
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out and refresh-token cookie cleared }
 *   post:
 *     summary: Log out and clear the refresh-token cookie
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out and refresh-token cookie cleared }
 *
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth sign-in
 *     description: Redirects the browser to Google's authorization page.
 *     tags: [Auth]
 *     responses:
 *       302: { description: Redirect to Google OAuth }
 *
 * /auth/google/callback:
 *   get:
 *     summary: Complete Google OAuth sign-in
 *     description: Passport processes the Google callback, sets a refresh-token cookie, and redirects to the frontend.
 *     tags: [Auth]
 *     responses:
 *       302: { description: Redirect to the frontend success page or login page }
 *
 * /users/{userId}/profile-picture:
 *   delete:
 *     summary: Delete a user's profile picture
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Profile picture deleted }
 *       401: { description: Missing or invalid access token }
 *       403: { description: User is not authorized to edit this account }
 *       404: { description: User not found }
 *
 * /users/{userId}/change-password:
 *   put:
 *     summary: Change the user's password
 *     description: Requires the current password. A security OTP is emailed after the password is changed.
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string, format: password, example: CurrentPass123 }
 *               newPassword: { type: string, format: password, example: NewPass123 }
 *     responses:
 *       200: { description: Password changed; security OTP sent by email }
 *       400: { description: Invalid input or incorrect old password }
 *       401: { description: Missing or invalid access token }
 *       404: { description: User not found }
 *
 * /admin/users/{userId}/toggle-admin:
 *   patch:
 *     summary: Toggle a user's Admin role
 *     description: Changes User to Admin or Admin to User. SuperAdmin roles cannot be changed.
 *     tags: [Admin Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User role updated }
 *       401: { description: Missing or invalid access token }
 *       403: { description: SuperAdmin role cannot be changed }
 *       404: { description: User not found }
 *
 * /orders/paymob/webhook:
 *   post:
 *     summary: Receive a Paymob payment webhook
 *     description: Confirms a successful payment and updates the order. This server-to-server endpoint does not use bearer authentication.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Paymob transaction payload; the handler reads obj.success and an order reference from obj.order.special_reference, obj.special_reference, or obj.extras.order_id.
 *             properties:
 *               obj:
 *                 type: object
 *                 properties:
 *                   success: { oneOf: [{ type: boolean }, { type: string }], example: true }
 *                   special_reference: { type: string, example: 67092147385a812bf0e54321 }
 *     responses:
 *       200: { description: Webhook received }
 *
 * /admin/orders/{orderId}:
 *   put:
 *     summary: Update order fulfillment status (PUT alias)
 *     tags: [Admin Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus: { type: string, enum: [Pending, Processing, Shipped, Delivered, Cancelled] }
 *               note: { type: string }
 *               isPaid: { type: boolean }
 *     responses:
 *       200: { description: Order status updated }
 *       400: { description: Missing or invalid order status }
 *       401: { description: Missing or invalid access token }
 *       404: { description: Order not found }
 *
 * /admin/coupons/{couponId}:
 *   put:
 *     summary: Update a coupon (Admin only)
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode: { type: string }
 *               discountType: { type: string, enum: [percentage, fixed] }
 *               discountValue: { type: number }
 *               startDate: { type: string, format: date-time }
 *               expireDate: { type: string, format: date-time }
 *               usageLimit: { type: integer }
 *               usageLimitPerUser: { type: integer }
 *               minOrderValue: { type: number }
 *               applicableCategories:
 *                 type: array
 *                 items: { type: string }
 *               maxUsersLimit: { type: integer, nullable: true }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Coupon updated }
 *       400: { description: Invalid coupon data }
 *       401: { description: Missing or invalid access token }
 *       403: { description: Admin role required }
 *       404: { description: Coupon not found }
 *   delete:
 *     summary: Delete a coupon (Admin only)
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Coupon deleted }
 *       400: { description: Coupon cannot be deleted }
 *       401: { description: Missing or invalid access token }
 *       403: { description: Admin role required }
 *       404: { description: Coupon not found }
 */
