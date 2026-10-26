# Nexo API Documentation

By Emad Ahmed

---

## General Info

### Base URL

The API is deployed locally and can be accessed at:
`http://localhost:5000`

Swagger UI documentation is available at:
`http://localhost:5000/api-docs`

### Response Wrapping

- **Success Responses**: Most handlers return a `success` boolean set to `true`, a `message` string, and a `data` field holding the returned resource(s) or metadata. Some delete handlers return `success` and `message` directly:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
- **Error Responses**: Validation and authorization errors created with `sendError` use the envelope below. Framework-level errors may return only a top-level `message`:
  ```json
  {
    "success": false,
    "message": "Error details and description go here"
  }
  ```

### Authentication

Protected routes require JSON Web Token (JWT) authentication passed in the HTTP `Authorization` header as a Bearer token:
`Authorization: Bearer <your_jwt_token>`

Login, OTP verification, and Google sign-in issue an access token and set an HTTP-only `refreshToken` cookie. Send requests with credentials enabled to use refresh/logout endpoints.

### Rate Limiting & Security

- **Authentication limiter**: `/auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/forgot-password`, and `/auth/reset-password` share a limit of 10 requests per IP per minute.
- **API limiter**: Other API routes allow 500 requests per IP per 15 minutes.
- **Exemptions**: `/api-docs` and `/orders/paymob/webhook` are excluded from the general API limiter. Exceeded requests receive HTTP 429 and standard `RateLimit` headers.
- **Storage**: Counters are in-memory per backend process. Use a shared store across multiple instances and configure `TRUST_PROXY_HOPS` to match the known proxy chain.
- **Uploads**: Product images, banner images, and profile pictures use `multipart/form-data`.

---

| # | Method | Endpoint | Description | Auth | Rate Limit |
| :-- | :----- | :----------------------------------- | :----------------------------------------------------------------------------- | :--: | :--------------: |
| 1 | POST | /auth/register | Register a new user account and obtain access token | ❌ | 10 req/min + API |
| 2 | POST | /auth/login | Authenticate existing user with email & password and retrieve access token | ❌ | 10 req/min + API |
| 3 | POST | /auth/verify-otp | Verify account email with OTP and issue session tokens | ❌ | 10 req/min + API |
| 4 | POST | /auth/resend-otp | Resend email verification OTP | ❌ | 10 req/min + API |
| 5 | POST | /auth/forgot-password | Request password-reset email | ❌ | 10 req/min + API |
| 6 | POST | /auth/reset-password | Reset password using emailed token | ❌ | 10 req/min + API |
| 7 | GET | /auth/me | Retrieve current authenticated account | 🔒 | 500 req/15min |
| 8 | GET, POST | /auth/refresh | Refresh access token using refreshToken cookie | 🍪 | 500 req/15min |
| 9 | GET, POST | /auth/logout | Clear refresh-token cookie and end session | ❌ | 500 req/15min |
| 10 | GET | /auth/google | Start Google OAuth redirect | ❌ | 500 req/15min |
| 11 | GET | /auth/google/callback | Complete Google OAuth and redirect to frontend | ❌ | 500 req/15min |
| 12 | GET | /users/:userId | Retrieve single user profile by ID | 🔒 | 500 req/15min |
| 13 | PUT | /users/:userId | Update user profile details (Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 14 | DELETE | /users/:userId | Delete user account permanently (Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 15 | GET | /users/:userId/addresses | Retrieve list of all saved addresses for a user | 🔒 | 500 req/15min |
| 16 | POST | /users/:userId/addresses | Add a new address to user profile (Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 17 | PUT | /users/:userId/addresses/:addressId | Update an existing user address (Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 18 | DELETE | /users/:userId/addresses/:addressId | Delete an address from user profile (Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 19 | DELETE | /users/:userId/profile-picture | Delete profile picture | 🔒 | 500 req/15min |
| 20 | PUT | /users/:userId/change-password | Change account password | 🔒 | 500 req/15min |
| 21 | GET | /products | Retrieve products with filters (search, price range, stock, rating, discount) | ❌ | 500 req/15min |
| 22 | GET | /products/suggestions | Retrieve product and category autocomplete suggestions for search query | ❌ | 500 req/15min |
| 23 | POST | /products | Create a new product with multiple image uploads to Cloudinary (up to 5 files) | 🔒 | 500 req/15min |
| 24 | GET | /products/:productId | Retrieve single product details by ID | ❌ | 500 req/15min |
| 25 | PUT | /products/:productId | Update existing product details and images (Owner or Admin) | 🔒 | 500 req/15min |
| 26 | PATCH | /products/:productId | Toggle like / unlike on a product | 🔒 | 500 req/15min |
| 27 | DELETE | /products/:productId | Delete a product by ID (Owner or Admin) | 🔒 | 500 req/15min |
| 28 | GET | /reviews/:productId | Retrieve all reviews and ratings for a product with reviewer details | ❌ | 500 req/15min |
| 29 | POST | /reviews/:productId | Submit a new review or update existing review (recalculates product ratings) | 🔒 | 500 req/15min |
| 30 | PUT | /reviews/:reviewId | Update review rating or text (Review Owner, Admin, or SuperAdmin) | 🔒 | 500 req/15min |
| 31 | DELETE | /reviews/:reviewId | Delete a review permanently and recalculate product stats (Owner or Admin) | 🔒 | 500 req/15min |
| 32 | GET | /products/:productId/reviews | Retrieve reviews for the product | ❌ | 500 req/15min |
| 33 | POST | /products/:productId/reviews | Create or update own product review | 🔒 | 500 req/15min |
| 34 | PUT, DELETE | /products/:productId/reviews/:reviewId | Update or delete review through product route | 🔒 | 500 req/15min |
| 35 | PUT, DELETE | /reviews/:productId/:reviewId | Update or delete review by product and review IDs | 🔒 | 500 req/15min |
| 36 | GET | /cart | Retrieve authenticated user's cart with populated product info | 🔒 | 500 req/15min |
| 37 | POST | /cart/:productId | Add product to user cart with quantity (defaults to 1) | 🔒 | 500 req/15min |
| 38 | PUT | /cart/:productId | Update item quantity in user cart | 🔒 | 500 req/15min |
| 39 | DELETE | /cart/:productId | Remove product from user cart | 🔒 | 500 req/15min |
| 40 | DELETE | /cart | Clear entire user shopping cart | 🔒 | 500 req/15min |
| 41 | GET | /wishlist | Retrieve authenticated user's wishlist with populated products | 🔒 | 500 req/15min |
| 42 | POST | /wishlist/:productId | Add product to user's wishlist | 🔒 | 500 req/15min |
| 43 | DELETE | /wishlist/:productId | Remove product from user's wishlist | 🔒 | 500 req/15min |
| 44 | DELETE | /wishlist | Clear entire user wishlist | 🔒 | 500 req/15min |
| 45 | POST | /orders | Create new order from user's current cart | 🔒 | 500 req/15min |
| 46 | GET | /orders | Retrieve list of all orders belonging to authenticated user | 🔒 | 500 req/15min |
| 47 | GET | /orders/:orderId | Retrieve single order details by ID | 🔒 | 500 req/15min |
| 48 | POST | /orders/paymob/create | Initiate Paymob Unified Checkout session and obtain `checkoutUrl` | 🔒 | 500 req/15min |
| 49 | POST | /orders/paymob/verify | Verify Paymob payment after customer redirect and mark order as paid | 🔒 | 500 req/15min |
| 50 | POST | /orders/paymob/webhook | Paymob server-to-server webhook to automatically confirm payment | ❌ | Exempt |
| 51 | PUT | /orders/:orderId | Update shipping address or payment method of pending order | 🔒 | 500 req/15min |
| 52 | DELETE | /orders/:orderId | Cancel and delete a pending order | 🔒 | 500 req/15min |
| 53 | POST | /coupons/apply | Apply coupon code to user cart and recalculate prices | 🔒 | 500 req/15min |
| 54 | DELETE | /coupons/remove | Remove applied coupon from user cart | 🔒 | 500 req/15min |
| 55 | GET | /notifications | Retrieve all notifications for the authenticated user | 🔒 | 500 req/15min |
| 56 | PATCH | /notifications/read-all | Mark all notifications as read for the authenticated user | 🔒 | 500 req/15min |
| 57 | DELETE | /notifications | Delete all notifications for the authenticated user | 🔒 | 500 req/15min |
| 58 | GET | /notifications/:notificationId | Retrieve a single notification by ID | 🔒 | 500 req/15min |
| 59 | PATCH | /notifications/:notificationId | Mark a single notification as read by ID | 🔒 | 500 req/15min |
| 60 | DELETE | /notifications/:notificationId | Delete a single notification by ID | 🔒 | 500 req/15min |
| 61 | PATCH | /notifications/:notificationId/read | Mark one notification as read | 🔒 | 500 req/15min |
| 62 | GET | /tickets/my | Retrieve all tickets created by the authenticated user | 🔒 | 500 req/15min |
| 63 | POST | /tickets | Create a new support ticket with an initial message | 🔒 | 500 req/15min |
| 64 | GET | /tickets/:ticketId | Retrieve ticket details with messages (Owner or Admin) | 🔒 | 500 req/15min |
| 65 | PUT | /tickets/:ticketId | Update ticket details or status (Owner or Admin) | 🔒 | 500 req/15min |
| 66 | DELETE | /tickets/:ticketId | Delete a support ticket permanently (Owner or Admin) | 🔒 | 500 req/15min |
| 67 | POST | /tickets/:ticketId/messages | Send a reply message to the ticket conversation (Owner or Admin) | 🔒 | 500 req/15min |
| 68 | GET | /banners | Retrieve active banners filtered by position and valid date range | ❌ | 500 req/15min |
| 69 | GET | /users | Retrieve list of all registered users (passwords excluded) | 🔒 | 500 req/15min |
| 70 | GET | /admin/orders | Retrieve all platform orders with populated customer info (Admin only) | 🔒 | 500 req/15min |
| 71 | GET | /admin/orders/:orderId | Retrieve complete details of any order by ID (Admin only) | 🔒 | 500 req/15min |
| 72 | PATCH | /admin/orders/:orderId | Update order delivery and fulfillment status (Admin only) | 🔒 | 500 req/15min |
| 73 | GET | /admin/orders/overview | Retrieve aggregated store-wide order stats and total revenue (Admin only) | 🔒 | 500 req/15min |
| 74 | PUT | /admin/orders/:orderId | Update order status (PUT alias) | 🔒 | 500 req/15min |
| 75 | PUT | /coupons/:couponId | Update coupon details, limits, validity dates, or status (Admin only) | 🔒 | 500 req/15min |
| 76 | DELETE | /coupons/:couponId | Delete unused coupon (Admin only) | 🔒 | 500 req/15min |
| 77 | GET | /admin/coupons | Retrieve all coupons with search, status, and discountType filters (Admin only) | 🔒 | 500 req/15min |
| 78 | POST | /admin/coupons | Create a new coupon with limits and validity schedule (Admin only) | 🔒 | 500 req/15min |
| 79 | PUT | /admin/coupons/:couponId | Update coupon details, limits, or status (Admin only) | 🔒 | 500 req/15min |
| 80 | DELETE | /admin/coupons/:couponId | Delete unused coupon (Admin only) | 🔒 | 500 req/15min |
| 81 | GET | /admin/tickets | Retrieve all tickets across the platform with search & status filters (Admin) | 🔒 | 500 req/15min |
| 82 | PUT | /admin/tickets/:ticketId | Update ticket status (Admin only) | 🔒 | 500 req/15min |
| 83 | GET | /admin/tickets/overview | Retrieve store-wide ticket counts and status overview (Admin only) | 🔒 | 500 req/15min |
| 84 | GET | /admin/banners | Retrieve all banners across the platform with pagination & search (Admin only) | 🔒 | 500 req/15min |
| 85 | POST | /admin/banners | Create a new promotional banner with image upload to Cloudinary (Admin only) | 🔒 | 500 req/15min |
| 86 | GET | /admin/banners/:bannerId | Retrieve single banner details by ID (Admin only) | 🔒 | 500 req/15min |
| 87 | PUT | /admin/banners/:bannerId | Update banner details or replace banner image (Admin only) | 🔒 | 500 req/15min |
| 88 | DELETE | /admin/banners/:bannerId | Delete banner permanently and remove image from Cloudinary (Admin only) | 🔒 | 500 req/15min |
| 89 | GET | /admin/banners/overview | Retrieve store-wide banner counts and position overview (Admin only) | 🔒 | 500 req/15min |
| 90 | PUT, PATCH | /admin/users/:userId/ban | Ban user temporarily for a specified duration in days (Admin only) | 🔒 | 500 req/15min |
| 91 | PUT, PATCH | /admin/users/:userId/unban | Lift ban and immediately restore user access (Admin only) | 🔒 | 500 req/15min |
| 92 | PATCH | /admin/users/:userId/toggle-admin | Toggle User/Admin role (SuperAdmin is protected) | 🔒 | 500 req/15min |

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Product Management Endpoints](#product-management-endpoints)
- [Cart Management Endpoints](#cart-management-endpoints)
- [Wishlist Management Endpoints](#wishlist-management-endpoints)
- [Order & Checkout Endpoints](#order--checkout-endpoints)
- [Coupon Management Endpoints](#coupon-management-endpoints)
- [Review & Rating Endpoints](#review--rating-endpoints)
- [Notification Endpoints](#notification-endpoints)
- [Ticket Endpoints](#ticket-endpoints)
- [Banner Endpoints](#banner-endpoints)
- [Admin Order Management Endpoints](#admin-order-management-endpoints)
- [Admin Ticket Management Endpoints](#admin-ticket-management-endpoints)
- [Admin Banner Management Endpoints](#admin-banner-management-endpoints)
- [Admin User Moderation Endpoints](#admin-user-moderation-endpoints)
- [Admin Coupon Management Endpoints](#admin-coupon-management-endpoints)
- [Additional Admin Endpoints](#additional-admin-endpoints)
- [Common HTTP Status Codes](#common-http-status-codes)

---

## Authentication Endpoints

### POST /auth/register

Register a new user account on the platform.

#### Request Headers

| Header         | Value              |
| :------------- | :----------------- |
| `Content-Type` | `application/json` |

#### Request Body

| Field      | Type   | Required | Description                                                                                 |
| :--------- | :----- | :------: | :------------------------------------------------------------------------------------------ |
| `fullName` | string |    ✅    | Full name of the user (Min length: 4, Max length: 100).                                     |
| `username` | string |    ✅    | Unique username (Min length: 3, Max length: 50, letters, digits, and underscores only).     |
| `email`    | string |    ✅    | Valid and unique email address.                                                             |
| `password` | string |    ✅    | Password (Min 6, Max 72 chars, must contain uppercase letter, lowercase letter, and digit). |
| `phone`    | string |    ✅    | Phone number (Must be exactly 11 digits).                                                   |

```json
{
  "fullName": "Ahmed Mohamed",
  "username": "ahmed_dev",
  "email": "ahmed@example.com",
  "password": "Password1",
  "phone": "01012345678"
}
```

#### Responses

##### Response 201

User registered successfully. Returns user account details along with the generated access token.

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "User",
    "provider": "local",
    "isVerified": false,
    "isActive": true,
    "addresses": [],
    "profilePicture": {
      "url": "",
      "publicId": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2026-10-09T18:00:00.000Z",
    "updatedAt": "2026-10-09T18:00:00.000Z"
  }
}
```

##### Response 400

Invalid input validation or email already exists.

```json
{
  "success": false,
  "message": "User is already exist"
}
```

---

### POST /auth/login

Log in an existing user using their email and password to retrieve their JWT access token.

#### Request Headers

| Header         | Value              |
| :------------- | :----------------- |
| `Content-Type` | `application/json` |

#### Request Body

| Field      | Type   | Required | Description                  |
| :--------- | :----- | :------: | :--------------------------- |
| `email`    | string |    ✅    | Registered email address.    |
| `password` | string |    ✅    | The user's account password. |

```json
{
  "email": "ahmed@example.com",
  "password": "Password1"
}
```

#### Responses

##### Response 200

Login successful. Returns user account details and the access token.

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "User",
    "provider": "local",
    "isVerified": false,
    "isActive": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Response 400

Invalid credentials or user does not exist.

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

These endpoints were added after the original reference. Protected account routes require the bearer access token unless identified as cookie/session-based.



### POST /auth/forgot-password

Request a password reset email for an account.

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| email | string | ✅ | Account email address |

#### Responses

- **200** — Reset email processed.
- **400** — Invalid email.
- **404** — Account was not found.

---

### POST /auth/reset-password

Set a new password using the token sent by email.

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| email | string | ✅ | Account email address |
| token | string | ✅ | Password reset token |
| newPassword | string | ✅ | 6–72 characters, uppercase, lowercase, and a digit |

#### Responses

- **200** — Password updated.
- **400** — Invalid/expired token or invalid password.
- **404** — Account was not found.

---

### POST /auth/verify-otp

Verify the email using the 6-digit OTP sent during registration.

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| email | string | ✅ | Registered email |
| otp | string | ✅ | 6-digit verification code |

#### Responses

- **200** — Email verified; returns the account and access token, and sets the HTTP-only refreshToken cookie.
- **400** — Invalid or expired OTP, or invalid input.
- **404** — Account not found.

---

### POST /auth/resend-otp

Send a new verification code to an unverified account.

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| email | string | ✅ | Account email address |

#### Responses

- **200** — Verification code sent.
- **400** — Invalid input.
- **404** — Account not found or already verified.

---

### GET /auth/me

Retrieve the account associated with the access token.

#### Request Headers

| Header | Value | Required |
| :--- | :--- | :---: |
| Authorization | Bearer <accessToken> | ✅ |

#### Responses

- **200** — Authenticated account returned.
- **401** — Missing or invalid access token.

---

### GET, POST /auth/logout

Clear the refresh-token cookie and end the session. Both methods are supported by the current router.

#### Responses

- **200** — Logged out; refreshToken cookie cleared.

---

### GET, POST /auth/refresh

Refresh the access token using the refreshToken cookie. Both methods are supported by the current router.

#### Cookies

| Cookie | Required | Description |
| :--- | :---: | :--- |
| refreshToken | ✅ | HTTP-only refresh token from a previous authentication flow |

#### Responses

- **200** — New access token returned.
- **400/403** — Cookie missing, invalid, expired, or no longer matches the stored session.

---

### GET /auth/google and GET /auth/google/callback

Start and complete Google OAuth. The first route redirects the browser to Google. The callback validates state, authenticates or creates the account, sets the refresh cookie, and redirects to the frontend auth result page.

#### Google OAuth Configuration

| Setting | Required value |
| :--- | :--- |
| Redirect URI | http://localhost:5000/auth/google/callback (or GOOGLE_CALLBACK_URL) |
| Authorized JavaScript origin | Frontend origin, for example http://localhost:3000 |
| Backend variables | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL |

The callback URL is the Google redirect URI. /auth/google starts sign-in and should not be registered as a redirect URI.

---

## User Management Endpoints

### GET /users/:userId

Retrieve detailed profile information for a single user by ID. Requires authentication.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description    |
| :-------- | :----- | :------: | :------------- |
| `userId`  | string |    ✅    | The user's ID. |

#### Responses

##### Response 200

User profile retrieved successfully.

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "role": "User",
    "isActive": true,
    "addresses": [],
    "profilePicture": {
      "url": "",
      "publicId": null
    },
    "createdAt": "2026-10-09T18:00:00.000Z",
    "updatedAt": "2026-10-09T18:00:00.000Z"
  }
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### PUT /users/:userId

Update user details. Restricted to the account owner, an Admin, or a SuperAdmin.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter | Type   | Required | Description    |
| :-------- | :----- | :------: | :------------- |
| `userId`  | string |    ✅    | The user's ID. |

#### Request Body

| Field      | Type   | Required | Description                                                             |
| :--------- | :----- | :------: | :---------------------------------------------------------------------- |
| `fullName` | string |    ❌    | Updated full name.                                                      |
| `phone`    | string |    ❌    | Updated phone number.                                                   |
| `role`     | string |    ❌    | Updated role (`"User"`, `"Admin"`, or `"SuperAdmin"`). SuperAdmin only. |

```json
{
  "fullName": "Ahmed Mohamed Updated",
  "phone": "01198765432"
}
```

#### Responses

##### Response 200

User updated successfully.

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed Updated",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "phone": "01198765432",
    "role": "User",
    "updatedAt": "2026-10-10T10:00:00.000Z"
  }
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the owner nor an Admin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### DELETE /users/:userId

Permanently delete a user account. Restricted to the account owner, an Admin, or a SuperAdmin.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description    |
| :-------- | :----- | :------: | :------------- |
| `userId`  | string |    ✅    | The user's ID. |

#### Responses

##### Response 200

User deleted successfully.

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is not authorized.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### GET /users/:userId/addresses

Retrieve all saved shipping addresses for a specific user. Requires authentication.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description    |
| :-------- | :----- | :------: | :------------- |
| `userId`  | string |    ✅    | The user's ID. |

#### Responses

##### Response 200

User addresses fetched successfully.

```json
{
  "success": true,
  "message": "User addresses fetched successfully",
  "data": [
    {
      "_id": "664fa1e2b5c7e1234567891b",
      "street": "15 El-Tahrir Street, Apt 4B",
      "city": "Cairo",
      "state": "Cairo",
      "postalCode": "11511",
      "phone": "01012345678",
      "isDefault": true
    }
  ]
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### POST /users/:userId/addresses

Add a new address to the user's addresses list. Restricted to the account owner, an Admin, or a SuperAdmin. If `isDefault` is set to `true`, all other addresses for this user are automatically set to `false`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter | Type   | Required | Description    |
| :-------- | :----- | :------: | :------------- |
| `userId`  | string |    ✅    | The user's ID. |

#### Request Body

| Field        | Type    | Required | Description                                                          |
| :----------- | :------ | :------: | :------------------------------------------------------------------- |
| `street`     | string  |    ✅    | Street address (Min 3 chars, Max 100 chars).                         |
| `city`       | string  |    ✅    | City name (Min 3 chars, Max 100 chars).                              |
| `state`      | string  |    ✅    | State or governorate (Min 3 chars, Max 100 chars).                   |
| `postalCode` | string  |    ❌    | Optional postal code (3–100 chars if provided; empty string allowed). |
| `phone`      | string  |    ✅    | Contact phone number (Must be exactly 11 digits).                    |
| `isDefault`  | boolean |    ❌    | Whether this is the default address. Defaults to `false`.            |

```json
{
  "street": "15 El-Tahrir Street, Apt 4B",
  "city": "Cairo",
  "state": "Cairo",
  "postalCode": "11511",
  "phone": "01012345678",
  "isDefault": true
}
```

#### Responses

##### Response 200

Address added successfully. Returns updated list of all user addresses.

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": [
    {
      "_id": "664fa1e2b5c7e1234567891b",
      "street": "15 El-Tahrir Street, Apt 4B",
      "city": "Cairo",
      "state": "Cairo",
      "postalCode": "11511",
      "phone": "01012345678",
      "isDefault": true
    }
  ]
}
```

##### Response 400

Validation error (missing required fields or invalid format).

```json
{
  "success": false,
  "message": "Validation error details"
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the owner nor an Admin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User was not found"
}
```

---

### PUT /users/:userId/addresses/:addressId

Update an existing address in the user's addresses list. Restricted to the account owner, an Admin, or a SuperAdmin. If `isDefault` is set to `true`, all other addresses for this user are automatically set to `false`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter   | Type   | Required | Description       |
| :---------- | :----- | :------: | :---------------- |
| `userId`    | string |    ✅    | The user's ID.    |
| `addressId` | string |    ✅    | The address's ID. |

#### Request Body

| Field        | Type    | Required | Description                                                    |
| :----------- | :------ | :------: | :------------------------------------------------------------- |
| `street`     | string  |    ❌    | Updated street address (Min 3, Max 100).                       |
| `city`       | string  |    ❌    | Updated city name (Min 3, Max 100).                            |
| `state`      | string  |    ❌    | Updated state/governorate (Min 3, Max 100).                    |
| `postalCode` | string  |    ❌    | Optional postal code (3–100 chars if provided, or empty).      |
| `phone`      | string  |    ❌    | Updated phone number (11 digits).                              |
| `isDefault`  | boolean |    ❌    | Set whether this address is the default.                       |

```json
{
  "street": "20 Updated Street, 5th Floor",
  "city": "Giza",
  "state": "Giza",
  "postalCode": "12511",
  "phone": "01099999999",
  "isDefault": false
}
```

#### Responses

##### Response 200

Address updated successfully. Returns updated list of all user addresses.

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": [
    {
      "_id": "664fa1e2b5c7e1234567891b",
      "street": "20 Updated Street, 5th Floor",
      "city": "Giza",
      "state": "Giza",
      "postalCode": "12511",
      "phone": "01099999999",
      "isDefault": false
    }
  ]
}
```

##### Response 400

Validation error.

```json
{
  "success": false,
  "message": "Validation error details"
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the owner nor an Admin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

User or address not found.

```json
{
  "success": false,
  "message": "Address not found"
}
```

---

### DELETE /users/:userId/addresses/:addressId

Delete an address from the user's profile. Restricted to the account owner, an Admin, or a SuperAdmin.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description       |
| :---------- | :----- | :------: | :---------------- |
| `userId`    | string |    ✅    | The user's ID.    |
| `addressId` | string |    ✅    | The address's ID. |

#### Responses

##### Response 200

Address deleted successfully. Returns updated list of remaining addresses.

```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": []
}
```

##### Response 400

Address not found or invalid ID.

```json
{
  "success": false,
  "message": "Address not found"
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is not authorized.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "success": false,
  "message": "User not found"
}
```

---



### DELETE /users/:userId/profile-picture

Delete the user's profile image. The requester must own the account or be an authorized administrator.

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| userId | string | ✅ | MongoDB user ID |

#### Responses

- **200** — Profile picture deleted.
- **401/403** — Not authenticated or not authorized for this account.
- **404** — User was not found.

---

### PUT /users/:userId/change-password

Change the account password using the current password. The controller sends the account security email after a successful change.

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| userId | string | ✅ | MongoDB user ID |

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| oldPassword | string | ✅ | Current password |
| newPassword | string | ✅ | New password with uppercase, lowercase, and a digit |

#### Responses

- **200** — Password changed.
- **400** — Invalid input or incorrect current password.
- **401/403** — Not authenticated or not authorized.
- **404** — User was not found.

---

## Product Management Endpoints

### GET /products

Retrieve the products catalog with full support for pagination, search, price filtering, category filtering, stock status, ratings, and discounts. No authentication required.

#### Query Parameters

| Parameter     | Type    | Required | Description                                                                                 |
| :------------ | :------ | :------: | :------------------------------------------------------------------------------------------ |
| `page`        | integer |    ❌    | Page number (Default: `1`).                                                                 |
| `limit`       | integer |    ❌    | Number of items per page (Default: `10`).                                                   |
| `search`      | string  |    ❌    | Search keyword matching title, description, category, price, or stock.                      |
| `category`    | string  |    ❌    | Filter by product category.                                                                 |
| `minPrice`    | number  |    ❌    | Minimum product price (`price >= minPrice`).                                                |
| `maxPrice`    | number  |    ❌    | Maximum product price (`price <= maxPrice`).                                                |
| `inStock`     | string  |    ❌    | Filter by availability: `"true"` for in stock (`> 0`), `"false"` for out of stock (`<= 0`). |
| `minRating`   | number  |    ❌    | Minimum average rating (`ratingAverage >= minRating`).                                      |
| `maxRating`   | number  |    ❌    | Maximum average rating (`ratingAverage <= maxRating`).                                      |
| `hasDiscount` | string  |    ❌    | Filter by discount: `"true"` (has active discount), `"false"` (no discount).                |

#### Responses

##### Response 200

Products retrieved successfully.

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "products": [
      {
        "_id": "6ac92261707ab25c5d1ed396",
        "userId": "664fa1e2b5c7e1234567890a",
        "title": "Casual Cotton Shirt",
        "description": "High quality pure cotton casual shirt for men",
        "price": 200,
        "priceAfterDiscount": 150,
        "stock": 25,
        "category": "Clothing",
        "productImages": [
          {
            "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../sample.jpg",
            "publicId": "Products/sample123"
          }
        ],
        "ratingAverage": 4.5,
        "ratingQuantity": 12,
        "createdAt": "2026-10-09T18:00:00.000Z",
        "updatedAt": "2026-10-09T18:00:00.000Z"
      }
    ],
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 28
  }
}
```

---

### GET /products/suggestions

Retrieve search autocomplete suggestions for matching product titles, descriptions, and predefined product categories. No authentication required. Fast response suitable for instant dropdown suggestions while the user types.

#### Query Parameters

| Parameter | Type   | Required | Description                                                                                        |
| :-------- | :----- | :------: | :------------------------------------------------------------------------------------------------- |
| `q`       | string |    ❌    | Search query string to match against product titles, descriptions, and categories.                 |
| `search`  | string |    ❌    | Alternative parameter name for the search query string (used if `q` is not provided).              |

#### Responses

##### Response 200

Suggestions retrieved successfully. If the query string is empty or missing, empty arrays are returned.

```json
{
  "success": true,
  "message": "Suggestions fetched successfully",
  "data": {
    "products": [
      {
        "_id": "6acb8f0d1be5a1c30428c164",
        "title": "Luxury Chronograph Watch",
        "description": "Stainless steel automatic luxury watch with sapphire crystal glass",
        "price": 250,
        "priceAfterDiscount": 199,
        "stock": 14,
        "category": "Watches & Accessories",
        "productImages": [
          {
            "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/v1791725329/Products/sample.jpg",
            "publicId": "Products/sample123",
            "_id": "6acb8f0d1be5a1c30428c165"
          }
        ]
      }
    ],
    "categories": [
      "Watches & Accessories",
      "Accessories"
    ]
  }
}
```

---

### POST /products

Create a new product with multiple image uploads to Cloudinary (up to 5 images). Requires authentication. The authenticated user is automatically saved as the product owner (`userId`).

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `multipart/form-data`     |

#### Form Data Fields

| Field                | Type    | Required | Description                                     |
| :------------------- | :------ | :------: | :---------------------------------------------- |
| `title`              | string  |    ✅    | Product title (Min length: 4, Max length: 100). |
| `description`        | string  |    ✅    | Product description (Min 10, Max 1000 chars).   |
| `price`              | number  |    ✅    | Original price (Must be >= 0).                  |
| `priceAfterDiscount` | number  |    ❌    | Discounted price (Must be >= 0).                |
| `stock`              | number  |    ❌    | Available stock quantity (Default: `0`).        |
| `category`           | string  |    ✅    | Product category (Min length: 3).               |
| `productImages`      | files[] |    ✅    | Up to 5 image files to upload to Cloudinary.    |

#### Responses

##### Response 201

Product created successfully.

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "6ac92261707ab25c5d1ed396",
    "userId": "664fa1e2b5c7e1234567890a",
    "title": "Casual Cotton Shirt",
    "description": "High quality pure cotton casual shirt for men",
    "price": 200,
    "priceAfterDiscount": 150,
    "stock": 25,
    "category": "Clothing",
    "productImages": [
      {
        "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../img1.jpg",
        "publicId": "Products/img1"
      }
    ],
    "ratingAverage": 0,
    "ratingQuantity": 0,
    "createdAt": "2026-10-09T18:00:00.000Z",
    "updatedAt": "2026-10-09T18:00:00.000Z"
  }
}
```

##### Response 400

Validation error or no image files provided.

```json
{
  "success": false,
  "message": "No File Uploaded"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### GET /products/:productId

Retrieve single product details by ID. No authentication required.

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Responses

##### Response 200

Product retrieved successfully.

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "_id": "6ac92261707ab25c5d1ed396",
    "userId": "664fa1e2b5c7e1234567890a",
    "title": "Casual Cotton Shirt",
    "description": "High quality pure cotton casual shirt for men",
    "price": 200,
    "priceAfterDiscount": 150,
    "stock": 25,
    "category": "Clothing",
    "productImages": [
      {
        "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../sample.jpg",
        "publicId": "Products/sample123"
      }
    ],
    "ratingAverage": 4.5,
    "ratingQuantity": 12,
    "createdAt": "2026-10-09T18:00:00.000Z",
    "updatedAt": "2026-10-09T18:00:00.000Z"
  }
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "No Product found with this id"
}
```

---

### PUT /products/:productId

Update existing product details and images. Requires authentication. **Only the product owner (`userId`), an Admin, or a SuperAdmin can update the product.**

> [!NOTE]
> **Optional Image Editing**: Image re-upload is completely optional. If no files are sent in `productImages`, the existing images are retained. You can also send `existingImages` as a JSON string to retain or reorder specific images, and upload new replacement files via `productImages`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `multipart/form-data`     |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Form Data Fields

| Field                | Type    | Required | Description                                                                               |
| :------------------- | :------ | :------: | :---------------------------------------------------------------------------------------- |
| `title`              | string  |    ❌    | Updated title (Min 4, Max 100).                                                           |
| `description`        | string  |    ❌    | Updated description (Min 10, Max 1000).                                                   |
| `price`              | number  |    ❌    | Updated original price.                                                                   |
| `priceAfterDiscount` | number  |    ❌    | Updated discounted price.                                                                 |
| `stock`              | number  |    ❌    | Updated stock count.                                                                      |
| `category`           | string  |    ❌    | Updated category.                                                                         |
| `existingImages`     | string  |    ❌    | JSON string of images to retain: `[{"url":"...","publicId":"..."}]`. Defaults to current. |
| `productImages`      | files[] |    ❌    | Optional new/replacement files to upload (up to 5 total images).                          |

#### Responses

##### Response 200

Product updated successfully.

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "6ac92261707ab25c5d1ed396",
    "userId": "664fa1e2b5c7e1234567890a",
    "title": "Casual Cotton Shirt (Updated)",
    "description": "High quality pure cotton casual shirt for men",
    "price": 220,
    "priceAfterDiscount": 180,
    "stock": 30,
    "category": "Clothing",
    "productImages": [
      {
        "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../img1.jpg",
        "publicId": "Products/img1"
      }
    ],
    "ratingAverage": 4.5,
    "ratingQuantity": 12,
    "updatedAt": "2026-10-10T02:00:00.000Z"
  }
}
```

##### Response 400

Validation error.

```json
{
  "success": false,
  "message": "Validation error description"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. User is not the owner of this product or an Admin.

```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "No Product found with this id"
}
```

---

### DELETE /products/:productId

Delete a product by ID. Requires authentication. **Only the product owner (`userId`), an Admin, or a SuperAdmin can delete the product.**

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Responses

##### Response 200

Product deleted successfully.

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. User is not the owner of this product or an Admin.

```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "No Product found with this id"
}
```

---

### PATCH /products/:productId

Toggle like / unlike status for a product. Requires authentication. If the user previously liked the product, their like is removed and `likesCount` is decremented. If not, the user is added to `likes` and `likesCount` is incremented.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Responses

##### Response 200

Product liked or unliked successfully.

```json
{
  "success": true,
  "message": "Product liked successfully",
  "data": {
    "_id": "6ac92261707ab25c5d1ed396",
    "title": "Casual Cotton Shirt",
    "likes": ["664fa1e2b5c7e1234567890a"],
    "likesCount": 1
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "No Product found with this id"
}
```

---

## Cart Management Endpoints

### GET /cart

Retrieve the authenticated user's shopping cart. The items in the cart will have their product details (`title`, `price`, `priceAfterDiscount`, `productImages`) populated.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Cart fetched successfully.

```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "userId": "664fa1e2b5c7e1234567890b",
    "cartItems": [
      {
        "product": {
          "_id": "6ac92261707ab25c5d1ed396",
          "title": "Luxury Chronograph Watch",
          "price": 250,
          "priceAfterDiscount": 200,
          "productImages": [
            {
              "url": "https://res.cloudinary.com/.../img.jpg",
              "publicId": "Products/sample"
            }
          ]
        },
        "productQuantity": 2,
        "productPrice": 200
      }
    ],
    "totalPrice": 400,
    "createdAt": "2026-10-10T02:00:00.000Z",
    "updatedAt": "2026-10-10T02:30:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Cart is empty or not created yet.

```json
{
  "success": false,
  "message": "Cart is empty"
}
```

---

### POST /cart/:productId

Add a product to the user's shopping cart. If the product is already in the cart, its quantity is increased by `productQuantity`. Product prices and stock are validated from the database.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Request Body

| Field             | Type   | Required | Description                             |
| :---------------- | :----- | :------: | :-------------------------------------- |
| `productQuantity` | number |    ❌    | Quantity to add (Min: 1, Default: `1`). |

```json
{
  "productQuantity": 2
}
```

#### Responses

##### Response 201

Product added to cart successfully. Returns updated cart with populated products.

```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "userId": "664fa1e2b5c7e1234567890b",
    "cartItems": [
      {
        "product": {
          "_id": "6ac92261707ab25c5d1ed396",
          "title": "Luxury Chronograph Watch",
          "price": 250,
          "priceAfterDiscount": 200,
          "productImages": [
            {
              "url": "https://res.cloudinary.com/.../img.jpg",
              "publicId": "Products/sample"
            }
          ]
        },
        "productQuantity": 2,
        "productPrice": 200
      }
    ],
    "totalPrice": 400
  }
}
```

##### Response 400

Invalid Product ID, invalid inputs, or requested quantity exceeds available stock.

```json
{
  "success": false,
  "message": "Requested quantity exceeds available stock"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### PUT /cart/:productId

Update the quantity of an existing item in the user's shopping cart.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Request Body

| Field             | Type   | Required | Description                              |
| :---------------- | :----- | :------: | :--------------------------------------- |
| `productQuantity` | number |    ✅    | New quantity of the item (Must be >= 1). |

```json
{
  "productQuantity": 3
}
```

#### Responses

##### Response 200

Product quantity updated successfully.

```json
{
  "success": true,
  "message": "Product quantity updated successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "userId": "664fa1e2b5c7e1234567890b",
    "cartItems": [
      {
        "product": {
          "_id": "6ac92261707ab25c5d1ed396",
          "title": "Luxury Chronograph Watch",
          "price": 250,
          "priceAfterDiscount": 200
        },
        "productQuantity": 3,
        "productPrice": 200
      }
    ],
    "totalPrice": 600
  }
}
```

##### Response 400

Invalid inputs or requested quantity exceeds available stock.

```json
{
  "success": false,
  "message": "Requested quantity exceeds available stock"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Cart not found or product is not in the cart.

```json
{
  "success": false,
  "message": "Product is not found in the cart"
}
```

---

### DELETE /cart/:productId

Remove an item from the user's shopping cart. If the removed item was the last remaining product, the cart is automatically deleted.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Responses

##### Response 200

Product removed from cart successfully.

```json
{
  "success": true,
  "message": "Product removed from cart successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "userId": "664fa1e2b5c7e1234567890b",
    "cartItems": [],
    "totalPrice": 0
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Cart not found or product is not in the cart.

```json
{
  "success": false,
  "message": "Product is not found in the cart"
}
```

---

### DELETE /cart

Clear the authenticated user's entire shopping cart.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Cart cleared successfully.

```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "totalPrice": 0,
    "cartItems": []
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Cart was not found.

```json
{
  "success": false,
  "message": "Cart is empty"
}
```

---

## Wishlist Management Endpoints

### GET /wishlist

Retrieve the authenticated user's wishlist. All products in the wishlist have their details (`title`, `description`, `price`, `priceAfterDiscount`, `productImages`, `category`, `stock`, `ratingAverage`, `ratingQuantity`, `likes`, `likesCount`) populated. If no wishlist exists yet for the user, an empty wishlist is returned.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Wishlist fetched successfully.

```json
{
  "success": true,
  "message": "Wishlist fetched successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "products": [
      {
        "_id": "6ac92261707ab25c5d1ed396",
        "title": "Luxury Chronograph Watch",
        "description": "Premium stainless steel automatic watch with sapphire crystal.",
        "price": 3500,
        "priceAfterDiscount": 2800,
        "category": "Watches",
        "stock": 12,
        "productImages": [
          {
            "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../watch.jpg",
            "publicId": "Products/watch1"
          }
        ],
        "ratingAverage": 4.8,
        "ratingQuantity": 15,
        "likes": [],
        "likesCount": 4
      }
    ]
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### POST /wishlist/:productId

Add a product to the authenticated user's wishlist. Accepts the product ID in the URL path (or in the request body as `productId`). If the product is already in the wishlist, it is not duplicated. Automatically returns the updated populated wishlist.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description                   |
| :---------- | :----- | :------: | :---------------------------- |
| `productId` | string |    ✅    | The ID of the product to add. |

#### Responses

##### Response 200

Added to wishlist successfully.

```json
{
  "success": true,
  "message": "Added to wishlist successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "products": [
      {
        "_id": "6ac92261707ab25c5d1ed396",
        "title": "Luxury Chronograph Watch",
        "price": 3500,
        "priceAfterDiscount": 2800,
        "category": "Watches",
        "stock": 12,
        "productImages": [
          {
            "url": "https://res.cloudinary.com/dgypt8dkr/image/upload/.../watch.jpg",
            "publicId": "Products/watch1"
          }
        ]
      }
    ]
  }
}
```

##### Response 400

Invalid product ID format.

```json
{
  "success": false,
  "message": "Valid Product ID is required"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "No Product found with this id"
}
```

---

### DELETE /wishlist/:productId

Remove a specific product from the authenticated user's wishlist. Returns the updated populated wishlist.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter   | Type   | Required | Description                      |
| :---------- | :----- | :------: | :------------------------------- |
| `productId` | string |    ✅    | The ID of the product to remove. |

#### Responses

##### Response 200

Removed from wishlist successfully.

```json
{
  "success": true,
  "message": "Removed from wishlist successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "products": []
  }
}
```

##### Response 400

Invalid product ID format.

```json
{
  "success": false,
  "message": "Valid Product ID is required"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Wishlist not found.

```json
{
  "success": false,
  "message": "No Wishlist found for this user"
}
```

---

### DELETE /wishlist

Clear the authenticated user's entire wishlist.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Wishlist cleared successfully.

```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "products": []
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Order & Checkout Endpoints

### POST /orders

Create a new order from the items currently in the authenticated user's cart. Upon successful creation, the cart is automatically deleted.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Request Body

| Field                        | Type   | Required | Description                                  |
| :--------------------------- | :----- | :------: | :------------------------------------------- |
| `shippingAddress.address`    | string |    ✅    | Street address (Min 5 chars).                |
| `shippingAddress.city`       | string |    ✅    | City name (Min 2 chars).                     |
| `shippingAddress.state`      | string |    ✅    | State or governorate (Min 2 chars).          |
| `shippingAddress.country`    | string |    ✅    | Country name (Min 2 chars).                   |
| `shippingAddress.postalCode` | string |    ❌    | Optional 5 digits postal code (e.g. `11371`). |
| `shippingAddress.phone`      | string |    ✅    | Phone number starting with `01` (11 digits).  |
| `paymentMethod`              | string |    ✅    | Payment method enum: `"Paymob"` or `"COD"`.  |

```json
{
  "shippingAddress": {
    "address": "15 El-Tahrir Street, Apt 4B",
    "city": "Cairo",
    "state": "Cairo",
    "country": "Egypt",
    "postalCode": "11371",
    "phone": "01012345678"
  },
  "paymentMethod": "Paymob"
}
```

#### Responses

##### Response 201

Order created successfully.

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "user": "664fa1e2b5c7e1234567890b",
    "orderItems": [
      {
        "product": "6ac92261707ab25c5d1ed396",
        "productQuantity": 2,
        "productPrice": 2500,
        "productTitle": "Luxury Chronograph Watch",
        "productImage": [
          {
            "url": "https://res.cloudinary.com/...",
            "publicId": "watches/watch1"
          }
        ]
      }
    ],
    "shippingAddress": {
      "address": "15 El-Tahrir Street, Apt 4B",
      "city": "Cairo",
      "state": "Cairo",
      "country": "Egypt",
      "postalCode": "11371",
      "phone": "01012345678"
    },
    "pricing": {
      "itemsPrice": 5000,
      "shippingPrice": 0,
      "taxPrice": 0,
      "totalOrderPrice": 5000
    },
    "payment": {
      "paymentMethod": "Paymob",
      "isPaid": false
    },
    "orderStatus": {
      "status": "Pending",
      "isDelivered": false
    },
    "createdAt": "2026-10-11T14:30:00.000Z",
    "updatedAt": "2026-10-11T14:30:00.000Z"
  }
}
```

##### Response 400

Validation error (e.g. invalid phone number format or missing required address fields).

```json
{
  "success": false,
  "message": "Validation error description"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Cart is empty or not found.

```json
{
  "success": false,
  "message": "Cart is empty"
}
```

---

### GET /orders

Retrieve all orders placed by the authenticated user, sorted in descending order of creation.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Orders fetched successfully.

```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "_id": "67092147385a812bf0e54321",
      "orderItems": [
        {
          "product": "6ac92261707ab25c5d1ed396",
          "productQuantity": 2,
          "productPrice": 2500,
          "productTitle": "Luxury Chronograph Watch",
          "productImage": [
            {
              "url": "https://res.cloudinary.com/...",
              "publicId": "watches/watch1"
            }
          ]
        }
      ],
      "pricing": {
        "itemsPrice": 5000,
        "shippingPrice": 0,
        "taxPrice": 0,
        "totalOrderPrice": 5000
      },
      "payment": {
        "paymentMethod": "Paymob",
        "isPaid": true,
        "paidAt": "2026-10-11T14:32:00.000Z"
      },
      "orderStatus": {
        "status": "Processing",
        "isDelivered": false
      },
      "createdAt": "2026-10-11T14:30:00.000Z",
      "updatedAt": "2026-10-11T14:32:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### GET /orders/:orderId

Retrieve details of a single order belonging to the authenticated user.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description        |
| :-------- | :----- | :------: | :----------------- |
| `orderId` | string |    ✅    | Order ID to fetch. |

#### Responses

##### Response 200

Order fetched successfully.

```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "user": "664fa1e2b5c7e1234567890b",
    "orderItems": [
      {
        "product": "6ac92261707ab25c5d1ed396",
        "productQuantity": 2,
        "productPrice": 2500,
        "productTitle": "Luxury Chronograph Watch",
        "productImage": [
          {
            "url": "https://res.cloudinary.com/...",
            "publicId": "watches/watch1"
          }
        ]
      }
    ],
    "shippingAddress": {
      "address": "15 El-Tahrir Street, Apt 4B",
      "city": "Cairo",
      "state": "Cairo",
      "country": "Egypt",
      "postalCode": "11371",
      "phone": "01012345678"
    },
    "pricing": {
      "itemsPrice": 5000,
      "shippingPrice": 0,
      "taxPrice": 0,
      "totalOrderPrice": 5000
    },
    "payment": {
      "paymentMethod": "Paymob",
      "isPaid": true,
      "paidAt": "2026-10-11T14:32:00.000Z"
    },
    "orderStatus": {
      "status": "Processing",
      "isDelivered": false
    },
    "createdAt": "2026-10-11T14:30:00.000Z",
    "updatedAt": "2026-10-11T14:32:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Order was not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### POST /orders/paymob/create

Initiate a **Paymob Unified Checkout** session for an existing unpaid order. Returns a `checkoutUrl` to redirect the customer to Paymob's hosted payment page where they can pay by card or mobile wallet.

> **How it works:** Backend calls `POST https://accept.paymob.com/v1/intention/` with the order amount and customer billing data. Paymob responds with a `client_secret` used to build the `checkoutUrl`. After the customer completes payment on Paymob, they are redirected back to `{FRONTEND_URL}/checkout/success?orderId={orderId}&success=true&id={transactionId}`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Request Body

| Field     | Type   | Required | Description                     |
| :-------- | :----- | :------: | :------------------------------ |
| `orderId` | string |    ✅    | The ID of the order to pay for. |

```json
{
  "orderId": "67092147385a812bf0e54321"
}
```

#### Responses

##### Response 200

Paymob checkout session created successfully.

```json
{
  "success": true,
  "message": "Paymob payment session created successfully",
  "data": {
    "orderId": "67092147385a812bf0e54321",
    "checkoutUrl": "https://accept.paymob.com/unifiedcheckout/?publicKey=egy_pk_test_...&clientSecret=egy_cs_...",
    "clientSecret": "egy_cs_test_..."
  }
}
```

##### Response 400

Order is already paid.

```json
{
  "success": false,
  "message": "This order is already paid"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

##### Response 500

Failed to initialize Paymob session (e.g. invalid credentials or Paymob API error).

```json
{
  "success": false,
  "message": "Failed to initialize Paymob payment"
}
```

---

### POST /orders/paymob/verify

Verify the outcome of a Paymob payment after the customer is redirected back to the frontend. If `success=true`, the order's `isPaid` is set to `true`, `paidAt` is recorded, and `orderStatus` transitions to `Processing`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Request Body

| Field           | Type            | Required | Description                                                      |
| :-------------- | :-------------- | :------: | :--------------------------------------------------------------- |
| `orderId`       | string          |    ✅    | The Nexoo order ID to verify.                                    |
| `success`       | boolean\|string |    ❌    | `true` / `"true"` if Paymob reported payment success.            |
| `transactionId` | string          |    ❌    | The Paymob transaction ID returned in the redirect query string. |

```json
{
  "orderId": "67092147385a812bf0e54321",
  "success": "true",
  "transactionId": "12345678"
}
```

#### Responses

##### Response 200

Payment verified and order marked as paid.

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "payment": {
      "paymentMethod": "Paymob",
      "isPaid": true,
      "paidAt": "2026-10-11T14:32:00.000Z",
      "paymentResult": {
        "id": "12345678",
        "status": "SUCCESS",
        "update_time": "2026-10-11T14:32:00.000Z"
      }
    },
    "orderStatus": {
      "status": "Processing",
      "isDelivered": false
    }
  }
}
```

##### Response 400

Payment was not successful or verification failed.

```json
{
  "success": false,
  "message": "Payment verification failed or payment was not successful"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### POST /orders/paymob/webhook

Server-to-server webhook endpoint called by Paymob to notify payment status automatically. **Does not require user authentication** — Paymob calls this directly from its servers. Extracts `special_reference` (your order ID) and `success` flag from the payload and marks the order as paid if successful.

> ⚠️ Configure this URL in your Paymob dashboard under **Transaction Processed Callback**: `{YOUR_BACKEND_URL}/orders/paymob/webhook`

#### Request Headers

| Header         | Value              |
| :------------- | :----------------- |
| `Content-Type` | `application/json` |

#### Request Body (sent by Paymob)

Paymob sends a nested `obj` structure. The key fields read by the handler:

| Field                         | Description                                           |
| :---------------------------- | :---------------------------------------------------- |
| `obj.success`                 | `true` if payment was captured successfully.          |
| `obj.order.special_reference` | Your internal order ID (set during intention create). |
| `obj.id`                      | Paymob transaction ID.                                |

#### Responses

##### Response 200

Webhook received (always returned regardless of payment outcome).

```json
{
  "status": "received"
}
```

---

### PUT /orders/:orderId

Update shipping address or payment method for an order that is still in `Pending` status.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter | Type   | Required | Description   |
| :-------- | :----- | :------: | :------------ |
| `orderId` | string |    ✅    | The order ID. |

#### Request Body

| Field                        | Type   | Required | Description                                         |
| :--------------------------- | :----- | :------: | :-------------------------------------------------- |
| `shippingAddress.address`    | string |    ❌    | Updated street address.                             |
| `shippingAddress.city`       | string |    ❌    | Updated city name.                                  |
| `shippingAddress.state`      | string |    ❌    | Updated state or governorate.                       |
| `shippingAddress.country`    | string |    ❌    | Updated country name.                               |
| `shippingAddress.postalCode` | string |    ❌    | Updated 5-digit postal code.                        |
| `shippingAddress.phone`      | string |    ❌    | Updated phone number (11 digits, starts with `01`). |
| `paymentMethod`              | string |    ❌    | Updated payment method: `"Paymob"` or `"COD"`.      |

```json
{
  "shippingAddress": {
    "address": "20 Nile Corniche, 5th Floor",
    "city": "Giza",
    "state": "Giza",
    "country": "Egypt",
    "postalCode": "12511",
    "phone": "01123456789"
  },
  "paymentMethod": "COD"
}
```

#### Responses

##### Response 200

Order updated successfully.

```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "shippingAddress": {
      "address": "20 Nile Corniche, 5th Floor",
      "city": "Giza",
      "state": "Giza",
      "country": "Egypt",
      "postalCode": "12511",
      "phone": "01123456789"
    },
    "payment": {
      "paymentMethod": "COD",
      "isPaid": false
    },
    "orderStatus": {
      "status": "Pending",
      "isDelivered": false
    },
    "updatedAt": "2026-10-12T10:00:00.000Z"
  }
}
```

##### Response 400

Cannot update an order that is already being processed or shipped.

```json
{
  "success": false,
  "message": "You cannot update an order that is already being processed"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### DELETE /orders/:orderId

Cancel and delete an order. Only allowed if the order belongs to the authenticated user and is still in `Pending` status.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description   |
| :-------- | :----- | :------: | :------------ |
| `orderId` | string |    ✅    | The order ID. |

#### Responses

##### Response 200

Order deleted successfully.

```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": null
}
```

##### Response 400

Cannot delete an order that is no longer pending.

```json
{
  "success": false,
  "message": "You cannot cancel an order that is already being processed"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## Coupon Management Endpoints

### POST /coupons/apply

Apply a discount coupon to the authenticated user's current shopping cart and calculate the new total price. The controller enforces all constraints: active status, date range, global usage limit, per-user usage limit, minimum order value, max unique users limit, and applicable categories.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Request Body

| Field        | Type   | Required | Description                      |
| :----------- | :----- | :------: | :------------------------------- |
| `couponCode` | string |    ✅    | The code of the coupon to apply. |

```json
{
  "couponCode": "WATCH20"
}
```

#### Responses

##### Response 200

Coupon applied successfully.

```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "originalTotal": 1500,
    "discountAmount": 300,
    "finalPrice": 1200,
    "couponCode": "WATCH20"
  }
}
```

##### Response 400

One of the following validation failures:

| Condition                                          | Message                                       |
| :------------------------------------------------- | :-------------------------------------------- |
| Coupon inactive                                    | `"Coupon is not active"`                      |
| Outside validity dates                             | `"Coupon has expired"`                        |
| Global usage limit reached                         | `"Coupon usage limit exceeded"`               |
| User already used coupon `usageLimitPerUser` times | `"You have already used this coupon"`         |
| Cart total < `minOrderValue`                       | `"Minimum order value required is {n}"`       |
| Max unique users limit reached                     | `"Coupon has reached its maximum user limit"` |
| No cart items match `applicableCategories`         | `"Coupon not applicable to your cart items"`  |

```json
{
  "success": false,
  "message": "Minimum order value required is 500"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Coupon code does not exist or user cart is empty.

```json
{
  "success": false,
  "message": "Coupon not found"
}
```

---

### DELETE /coupons/remove

Remove the currently applied coupon from the authenticated user's shopping cart.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Coupon removed successfully.

```json
{
  "success": true,
  "message": "Coupon removed successfully",
  "data": null
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

User cart is empty or not found.

```json
{
  "success": false,
  "message": "Cart is empty"
}
```

---

## Review & Rating Endpoints

### GET /reviews/:productId

Retrieve all reviews and ratings submitted for a specific product. Populates reviewer profile information (fullName, username, profile picture, email, role). No authentication required.

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Responses

##### Response 200

Reviews fetched successfully.

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    {
      "_id": "67104b90e1234567890abcd1",
      "product": "6ac92261707ab25c5d1ed396",
      "ratings": 5,
      "reviewText": "Exceptional product quality, exceeded expectations!",
      "user": {
        "_id": "664fa1e2b5c7e1234567890a",
        "fullName": "Ahmed Mohamed",
        "username": "ahmed_dev",
        "email": "ahmed@example.com",
        "role": "User",
        "profilePicture": {
          "url": "https://res.cloudinary.com/.../avatar.jpg",
          "publicId": "Avatars/user123"
        }
      },
      "createdAt": "2026-10-14T18:00:00.000Z",
      "updatedAt": "2026-10-14T18:00:00.000Z"
    }
  ]
}
```

##### Response 400

Product ID is missing or invalid.

```json
{
  "success": false,
  "message": "Product ID is required"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### POST /reviews/:productId

Submit a new review or update an existing review for a product. Requires authentication. Each user can have one review per product. Submitting updates the product's `ratingAverage` (`ratings`) and `ratingQuantity` statistics automatically.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter   | Type   | Required | Description     |
| :---------- | :----- | :------: | :-------------- |
| `productId` | string |    ✅    | The product ID. |

#### Request Body

| Field        | Type   | Required | Description                                                   |
| :----------- | :----- | :------: | :------------------------------------------------------------ |
| `ratings`    | number |    ✅    | Numerical rating from `1` to `5` (inclusive).                 |
| `reviewText` | string |    ✅    | Customer opinion text (Min length: 1, Max length: 500 chars). |

```json
{
  "ratings": 5,
  "reviewText": "Super comfortable fabric and pristine stitch quality!"
}
```

#### Responses

##### Response 201

Review created successfully.

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "67104b90e1234567890abcd1",
      "product": "6ac92261707ab25c5d1ed396",
      "ratings": 5,
      "reviewText": "Super comfortable fabric and pristine stitch quality!",
      "user": {
        "_id": "664fa1e2b5c7e1234567890a",
        "fullName": "Ahmed Mohamed",
        "username": "ahmed_dev"
      },
      "createdAt": "2026-10-14T18:00:00.000Z",
      "updatedAt": "2026-10-14T18:00:00.000Z"
    },
    "productRating": 4.8,
    "productRatingQuantity": 12
  }
}
```

##### Response 200

Existing review updated successfully (when user previously reviewed the product).

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {
      "_id": "67104b90e1234567890abcd1",
      "ratings": 4,
      "reviewText": "Updated review feedback"
    },
    "productRating": 4.6,
    "productRatingQuantity": 12
  }
}
```

##### Response 400

Validation error in rating (must be 1-5) or reviewText.

```json
{
  "success": false,
  "message": "Rating must be at least 1"
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### PUT /reviews/:reviewId

Update an existing review by ID. Requires authentication. **Only the review author (`user`), an Admin, or a SuperAdmin can update the review.** Recalculates product rating statistics automatically.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter  | Type   | Required | Description    |
| :--------- | :----- | :------: | :------------- |
| `reviewId` | string |    ✅    | The review ID. |

#### Request Body

| Field        | Type   | Required | Description                                               |
| :----------- | :----- | :------: | :-------------------------------------------------------- |
| `ratings`    | number |    ❌    | Updated numerical rating from `1` to `5`.                 |
| `reviewText` | string |    ❌    | Updated customer review text (Min 1, Max 500 characters). |

```json
{
  "ratings": 4,
  "reviewText": "Adjusted rating after a month of heavy use."
}
```

#### Responses

##### Response 200

Review updated successfully.

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {
      "_id": "67104b90e1234567890abcd1",
      "ratings": 4,
      "reviewText": "Adjusted rating after a month of heavy use."
    },
    "productRating": 4.5,
    "productRatingQuantity": 12
  }
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the review author nor an Admin.

```json
{
  "success": false,
  "message": "Not authorized to update this review"
}
```

##### Response 404

Review not found.

```json
{
  "success": false,
  "message": "Review Not Found"
}
```

---

### DELETE /reviews/:reviewId

Permanently delete a review by ID. Requires authentication. **Only the review author (`user`), an Admin, or a SuperAdmin can delete the review.** Recalculates the product's average rating and decrements its review count.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter  | Type   | Required | Description    |
| :--------- | :----- | :------: | :------------- |
| `reviewId` | string |    ✅    | The review ID. |

#### Responses

##### Response 200

Review deleted successfully.

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "productRating": 4.5,
    "productRatingQuantity": 11
  }
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is not the review author or an Admin.

```json
{
  "success": false,
  "message": "Not authorized to delete this review"
}
```

##### Response 404

Review not found.

```json
{
  "success": false,
  "message": "Review Not Found"
}
```

---

## Notification Endpoints

### GET /notifications

Retrieve all notifications for the authenticated user, ordered by creation date descending.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Notifications fetched successfully.

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "_id": "664fa1e2b5c7e1234567890a",
      "user": "664fa1e2b5c7e1234567890b",
      "title": "Order Status Updated",
      "message": "Your order #abc123 has been marked as Shipped.",
      "type": "order",
      "isRead": false,
      "relatedId": "664fa1e2b5c7e1234567890c",
      "createdAt": "2026-10-21T14:30:00.000Z",
      "updatedAt": "2026-10-21T14:30:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### PATCH /notifications/read-all

Mark all unread notifications of the authenticated user as read in a single operation.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

All notifications marked as read.

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "acknowledged": true,
    "modifiedCount": 5
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### DELETE /notifications

Delete all notifications belonging to the authenticated user.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

All notifications deleted successfully.

```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "data": []
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### GET /notifications/:notificationId

Retrieve a specific notification by its ID. The notification must belong to the authenticated user.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter        | Type   | Required | Description              |
| :--------------- | :----- | :------: | :----------------------- |
| `notificationId` | string |    ✅    | The notification's ID.   |

#### Responses

##### Response 200

Notification fetched successfully.

```json
{
  "success": true,
  "message": "Notification fetched successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "title": "Order Shipped",
    "message": "Your order is on the way!",
    "type": "order",
    "isRead": true,
    "relatedId": "664fa1e2b5c7e1234567890c",
    "createdAt": "2026-10-21T14:30:00.000Z",
    "updatedAt": "2026-10-21T14:30:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Attempting to access another user's notification.

```json
{
  "success": false,
  "message": "You cannot access other user notifications"
}
```

##### Response 404

Notification not found.

```json
{
  "success": false,
  "message": "No notification found with this id"
}
```

---

### PATCH /notifications/:notificationId

Mark a single notification as read by its ID. The notification must belong to the authenticated user.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter        | Type   | Required | Description            |
| :--------------- | :----- | :------: | :--------------------- |
| `notificationId` | string |    ✅    | The notification's ID. |

#### Responses

##### Response 200

Notification marked as read.

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "title": "Order Shipped",
    "message": "Your order is on the way!",
    "type": "order",
    "isRead": true,
    "relatedId": "664fa1e2b5c7e1234567890c",
    "createdAt": "2026-10-21T14:30:00.000Z",
    "updatedAt": "2026-10-21T14:30:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Attempting to access another user's notification.

```json
{
  "success": false,
  "message": "You cannot access other user notifications"
}
```

##### Response 404

Notification not found.

```json
{
  "success": false,
  "message": "No notification found with this id"
}
```

---

### DELETE /notifications/:notificationId

Delete a specific notification by its ID. The notification must belong to the authenticated user.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter        | Type   | Required | Description            |
| :--------------- | :----- | :------: | :--------------------- |
| `notificationId` | string |    ✅    | The notification's ID. |

#### Responses

##### Response 200

Notification deleted successfully.

```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "user": "664fa1e2b5c7e1234567890b",
    "title": "Order Shipped",
    "message": "Your order is on the way!",
    "type": "order",
    "isRead": true,
    "relatedId": "664fa1e2b5c7e1234567890c"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Attempting to access another user's notification.

```json
{
  "success": false,
  "message": "You cannot access other user notifications"
}
```

##### Response 404

Notification not found.

```json
{
  "success": false,
  "message": "No notification found with this id"
}
```

---

## Ticket Endpoints

### GET /tickets/my

Retrieve all support tickets created by the authenticated user, ordered by creation date descending.

#### Request Headers

| Header          | Value            | Required |
| :-------------- | :--------------- | :------: |
| `Authorization` | `Bearer <token>` |    ✅    |

#### Responses

##### Response 200

User tickets fetched successfully.

```json
{
  "success": true,
  "message": "Your Tickets fetched successfully",
  "data": [
    {
      "_id": "67b901234567890abcdef123",
      "subject": "Issue with order delivery",
      "category": "shipping",
      "status": "open",
      "priority": "High",
      "messages": [
        "67b901234567890abcdef999"
      ],
      "createdAt": "2026-10-21T18:00:00.000Z",
      "updatedAt": "2026-10-21T18:00:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### POST /tickets

Create a new customer support ticket along with the initial inquiry message.

#### Request Headers

| Header          | Value              | Required |
| :-------------- | :----------------- | :------: |
| `Content-Type`  | `application/json` |    ✅    |
| `Authorization` | `Bearer <token>`   |    ✅    |

#### Request Body

| Field      | Type   | Required | Description                                                         |
| :--------- | :----- | :------: | :------------------------------------------------------------------ |
| `subject`  | string |    ✅    | Ticket subject summary (3-100 characters).                          |
| `category` | string |    ✅    | Category: `"shipping"`, `"payment"`, `"product"`, or `"other"`.     |
| `priority` | string |    ✅    | Priority level: `"Low"`, `"Medium"`, `"High"`, or `"Urgent"`.       |
| `message`  | string |    ✅    | The initial support message / problem description (3-1000 chars).   |
| `order`    | string |    ❌    | Optional associated Order ID.                                       |

```json
{
  "subject": "Damaged package received",
  "category": "product",
  "priority": "High",
  "message": "The outer carton was crushed and the item has deep scratches.",
  "order": "664fa1e2b5c7e1234567890b"
}
```

#### Responses

##### Response 201

Ticket created successfully.

```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id": "67b901234567890abcdef123",
    "user": "67b901234567890abcdef001",
    "order": "664fa1e2b5c7e1234567890b",
    "subject": "Damaged package received",
    "category": "product",
    "priority": "High",
    "status": "open",
    "messages": [
      "67b901234567890abcdef999"
    ],
    "createdAt": "2026-10-21T18:00:00.000Z",
    "updatedAt": "2026-10-21T18:00:00.000Z"
  }
}
```

##### Response 400

Bad request. Validation failed on input fields.

```json
{
  "success": false,
  "message": "Subject must be at least 3 characters"
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### GET /tickets/:ticketId

Retrieve full details of a specific ticket including the complete conversation messages history and sender info. Accessible only to the ticket owner or admins.

#### Request Headers

| Header          | Value            | Required |
| :-------------- | :--------------- | :------: |
| `Authorization` | `Bearer <token>` |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description             |
| :--------- | :----- | :------: | :---------------------- |
| `ticketId` | string |    ✅    | The ticket's MongoDB ID |

#### Responses

##### Response 200

Ticket fetched successfully.

```json
{
  "success": true,
  "message": "Ticket fetched successfully",
  "data": {
    "_id": "67b901234567890abcdef123",
    "subject": "Damaged package received",
    "category": "product",
    "priority": "High",
    "status": "open",
    "user": {
      "_id": "67b901234567890abcdef001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "messages": [
      {
        "_id": "67b901234567890abcdef999",
        "sender": {
          "_id": "67b901234567890abcdef001",
          "firstName": "John",
          "lastName": "Doe",
          "role": "User"
        },
        "content": "The outer carton was crushed and the item has deep scratches.",
        "createdAt": "2026-10-21T18:00:00.000Z"
      }
    ],
    "createdAt": "2026-10-21T18:00:00.000Z",
    "updatedAt": "2026-10-21T18:00:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is neither the ticket owner nor an admin.

```json
{
  "success": false,
  "message": "You are not authorized to view this ticket"
}
```

##### Response 404

Ticket not found.

```json
{
  "success": false,
  "message": "No Ticket found with this id"
}
```

---

### PUT /tickets/:ticketId

Update ticket fields or modify ticket status (`"open"`, `"in_progress"`, `"resolved"`, `"closed"`). Accessible to ticket owner or admins.

#### Request Headers

| Header          | Value              | Required |
| :-------------- | :----------------- | :------: |
| `Content-Type`  | `application/json` |    ✅    |
| `Authorization` | `Bearer <token>`   |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description             |
| :--------- | :----- | :------: | :---------------------- |
| `ticketId` | string |    ✅    | The ticket's MongoDB ID |

#### Request Body

| Field      | Type   | Required | Description                                                    |
| :--------- | :----- | :------: | :------------------------------------------------------------- |
| `subject`  | string |    ❌    | Updated subject (3-100 characters).                            |
| `category` | string |    ❌    | `"shipping"`, `"payment"`, `"product"`, or `"other"`.          |
| `priority` | string |    ❌    | `"Low"`, `"Medium"`, `"High"`, or `"Urgent"`.                  |
| `status`   | string |    ❌    | `"open"`, `"in_progress"`, `"resolved"`, or `"closed"`.       |

```json
{
  "status": "resolved"
}
```

#### Responses

##### Response 200

Ticket updated successfully.

```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "_id": "67b901234567890abcdef123",
    "status": "resolved",
    "subject": "Damaged package received",
    "category": "product",
    "priority": "High"
  }
}
```

##### Response 403

Forbidden. Requester is not authorized to update this ticket.

```json
{
  "success": false,
  "message": "You are not authorized to update this ticket"
}
```

##### Response 404

Ticket not found.

```json
{
  "success": false,
  "message": "No Ticket found with this id"
}
```

---

### DELETE /tickets/:ticketId

Permanently delete a support ticket. Accessible to ticket owner or admins.

#### Request Headers

| Header          | Value            | Required |
| :-------------- | :--------------- | :------: |
| `Authorization` | `Bearer <token>` |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description             |
| :--------- | :----- | :------: | :---------------------- |
| `ticketId` | string |    ✅    | The ticket's MongoDB ID |

#### Responses

##### Response 200

Ticket deleted successfully.

```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "data": {
    "_id": "67b901234567890abcdef123"
  }
}
```

##### Response 403

Forbidden. Requester is not authorized to delete this ticket.

```json
{
  "success": false,
  "message": "You are not authorized to delete this ticket"
}
```

##### Response 404

Ticket not found.

```json
{
  "success": false,
  "message": "No Ticket found with this id"
}
```

---

### POST /tickets/:ticketId/messages

Send a reply message to an ongoing ticket conversation. Accessible to ticket owner or admins.

#### Request Headers

| Header          | Value              | Required |
| :-------------- | :----------------- | :------: |
| `Content-Type`  | `application/json` |    ✅    |
| `Authorization` | `Bearer <token>`   |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description             |
| :--------- | :----- | :------: | :---------------------- |
| `ticketId` | string |    ✅    | The ticket's MongoDB ID |

#### Request Body

| Field     | Type   | Required | Description                                   |
| :-------- | :----- | :------: | :-------------------------------------------- |
| `content` | string |    ✅    | Message content text to append to the ticket. |

```json
{
  "content": "Thank you for the update. The replacement has arrived in perfect condition."
}
```

#### Responses

##### Response 201

Message added successfully.

```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "_id": "67b901234567890abcdef123",
    "subject": "Damaged package received",
    "messages": [
      {
        "_id": "67b901234567890abcdef999",
        "sender": {
          "_id": "67b901234567890abcdef001",
          "firstName": "John",
          "lastName": "Doe",
          "role": "User"
        },
        "content": "The outer carton was crushed and the item has deep scratches.",
        "createdAt": "2026-10-21T18:00:00.000Z"
      },
      {
        "_id": "67b901234567890abcdef888",
        "sender": {
          "_id": "67b901234567890abcdef001",
          "firstName": "John",
          "lastName": "Doe",
          "role": "User"
        },
        "content": "Thank you for the update. The replacement has arrived in perfect condition.",
        "createdAt": "2026-10-21T18:30:00.000Z"
      }
    ]
  }
}
```

##### Response 400

Message content is required.

```json
{
  "success": false,
  "message": "Message content is required"
}
```

##### Response 403

Forbidden. Requester is not authorized to reply to this ticket.

```json
{
  "success": false,
  "message": "You are not authorized to reply to this ticket"
}
```

##### Response 404

Ticket not found.

```json
{
  "success": false,
  "message": "No Ticket found with this id"
}
```

---

## Banner Endpoints

### GET /banners

Retrieve active banners for a specific display position (`hero_home`, `hero_category`, `hero_product`, or `all`). Only returns banners where `isActive` is `true` and the current date falls between `startDate` and `endDate` (if scheduled). Results are ordered by `priority` descending, then `createdAt` descending.

#### Request Headers

None required (Public endpoint).

#### Query Parameters

| Parameter  | Type   | Required | Default     | Description                                                                       |
| :--------- | :----- | :------: | :---------- | :-------------------------------------------------------------------------------- |
| `position` | string |    ❌    | `hero_home` | Target position filter: `hero_home`, `hero_category`, `hero_product`, or `all`.   |

#### Responses

##### Response 200

Active banners fetched successfully.

```json
{
  "success": true,
  "message": "Active banners fetched successfully",
  "data": [
    {
      "_id": "6718a931a9b4c10023e1109a",
      "title": "Spring Tech Mega Sale 2026",
      "subtitle": "Discover the latest tech with up to 40% discount and official warranty.",
      "image": {
        "publicId": "Banners/banner_spring_2026",
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.webp"
      },
      "linkType": "category",
      "linkValue": "Laptops",
      "position": "hero_home",
      "isActive": true,
      "priority": 10,
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2026-06-01T00:00:00.000Z",
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

---

## Admin Order Management Endpoints

### GET /admin/orders

Retrieve all customer orders placed across the store. **Admin or SuperAdmin only.** Orders are sorted by creation date descending and customer (`user`) details are populated.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Query Parameters

| Parameter      | Type    | Required | Description                                                                                                   |
| :------------- | :------ | :------: | :------------------------------------------------------------------------------------------------------------ |
| `orderStatus`  | string  |    ❌    | Filter by order status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`). Use `all` for all.    |
| `orderId`      | string  |    ❌    | Filter by exact order ID (`_id`).                                                                             |
| `customerName` | string  |    ❌    | Case-insensitive regex search matching customer's `fullName` or `username`.                                   |
| `email`        | string  |    ❌    | Case-insensitive regex search matching customer's `email`.                                                    |
| `phone`        | string  |    ❌    | Case-insensitive regex search matching shipping phone number (`shippingAddress.phone`).                       |
| `minPrice`     | number  |    ❌    | Filter orders where `pricing.totalOrderPrice` is greater than or equal to this value.                         |
| `maxPrice`     | number  |    ❌    | Filter orders where `pricing.totalOrderPrice` is less than or equal to this value.                            |
| `isPaid`       | boolean |    ❌    | Filter orders by payment status (`true` for paid, `false` for unpaid).                                       |
| `page`         | number  |    ❌    | Page number for pagination (defaults to `1`).                                                                 |
| `limit`        | number  |    ❌    | Number of orders per page (defaults to `10`).                                                                 |

#### Responses

##### Response 200

Orders fetched successfully.

```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "_id": "67092147385a812bf0e54321",
      "user": {
        "_id": "664fa1e2b5c7e1234567890b",
        "fullName": "Ahmed Mohamed",
        "email": "ahmed@example.com",
        "username": "ahmed_m",
        "phone": "01012345678",
        "role": "User"
      },
      "orderItems": [
        {
          "product": "6ac92261707ab25c5d1ed396",
          "productQuantity": 2,
          "productPrice": 2500,
          "productTitle": "Luxury Chronograph Watch",
          "productImage": [
            {
              "url": "https://res.cloudinary.com/...",
              "publicId": "watches/watch1"
            }
          ]
        }
      ],
      "shippingAddress": {
        "address": "15 El-Tahrir Street, Apt 4B",
        "city": "Cairo",
        "state": "Cairo",
        "country": "Egypt",
        "postalCode": "11371",
        "phone": "01012345678"
      },
      "pricing": {
        "itemsPrice": 5000,
        "shippingPrice": 50,
        "taxPrice": 0,
        "couponCode": null,
        "discountPrice": 0,
        "totalOrderPrice": 5050
      },
      "payment": {
        "paymentMethod": "Paymob",
        "isPaid": true,
        "paidAt": "2026-10-11T14:32:00.000Z"
      },
      "orderStatus": {
        "status": "Processing",
        "isDelivered": false
      },
      "createdAt": "2026-10-11T14:30:00.000Z",
      "updatedAt": "2026-10-11T14:32:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

### GET /admin/orders/:orderId

Retrieve complete details of a single order by ID. **Admin or SuperAdmin only.** Populates both customer (`user`) and product (`orderItems.product`) information.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Path Parameters

| Parameter | Type   | Required | Description                      |
| :-------- | :----- | :------: | :------------------------------- |
| `orderId` | string |    ✅    | The unique order ID to retrieve. |

#### Responses

##### Response 200

Order fetched successfully.

```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "user": {
      "_id": "664fa1e2b5c7e1234567890b",
      "fullName": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "phone": "01012345678"
    },
    "orderItems": [
      {
        "product": {
          "_id": "6ac92261707ab25c5d1ed396",
          "title": "Luxury Chronograph Watch",
          "price": 2500,
          "productImages": [
            {
              "url": "https://res.cloudinary.com/...",
              "publicId": "watches/watch1"
            }
          ]
        },
        "productQuantity": 2,
        "productPrice": 2500,
        "productTitle": "Luxury Chronograph Watch",
        "productImage": [
          {
            "url": "https://res.cloudinary.com/...",
            "publicId": "watches/watch1"
          }
        ]
      }
    ],
    "shippingAddress": {
      "address": "15 El-Tahrir Street, Apt 4B",
      "city": "Cairo",
      "state": "Cairo",
      "country": "Egypt",
      "postalCode": "11371",
      "phone": "01012345678"
    },
    "pricing": {
      "itemsPrice": 5000,
      "shippingPrice": 50,
      "taxPrice": 0,
      "couponCode": null,
      "discountPrice": 0,
      "totalOrderPrice": 5050
    },
    "payment": {
      "paymentMethod": "Paymob",
      "isPaid": true,
      "paidAt": "2026-10-11T14:32:00.000Z"
    },
    "orderStatus": {
      "status": "Processing",
      "isDelivered": false
    },
    "createdAt": "2026-10-11T14:30:00.000Z",
    "updatedAt": "2026-10-11T14:32:00.000Z"
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### PATCH /admin/orders/:orderId

Update the fulfillment and delivery status of an order. **Admin or SuperAdmin only.** Setting status to `"Delivered"` automatically sets `isDelivered = true` and records the current timestamp in `deliveredAt`.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

#### Path Parameters

| Parameter | Type   | Required | Description                    |
| :-------- | :----- | :------: | :----------------------------- |
| `orderId` | string |    ✅    | The unique order ID to update. |

#### Request Body

| Field         | Type    | Required | Description                                                                                 |
| :------------ | :------ | :------: | :------------------------------------------------------------------------------------------ |
| `orderStatus` | string  |    ✅    | Target status enum: `"Pending"`, `"Processing"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`. |
| `isPaid`      | boolean |    ❌    | Optional manual payment confirmation flag.                                                  |

```json
{
  "orderStatus": "Delivered",
  "isPaid": true
}
```

#### Responses

##### Response 200

Order status updated successfully.

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "67092147385a812bf0e54321",
    "payment": {
      "paymentMethod": "COD",
      "isPaid": true,
      "paidAt": "2026-10-12T16:00:00.000Z"
    },
    "orderStatus": {
      "status": "Delivered",
      "isDelivered": true,
      "deliveredAt": "2026-10-12T16:00:00.000Z"
    },
    "updatedAt": "2026-10-12T16:00:00.000Z"
  }
}
```

##### Response 400

Validation error (invalid status string or missing orderStatus).

```json
{
  "success": false,
  "message": "Invalid order status. Allowed values: Pending, Processing, Shipped, Delivered, Cancelled"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

Order not found.

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### GET /admin/orders/overview

Retrieve aggregated store-wide order statistics and metrics, including total counts, counts broken down by status, and total revenue accumulated from all paid orders. **Admin or SuperAdmin only.**

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Stats fetched successfully.

```json
{
  "success": true,
  "message": "Stats fetched Succeed",
  "data": {
    "totalOrders": 128,
    "pendingOrders": 14,
    "DeliveredOrders": 82,
    "deliveredOrders": 82,
    "processingOrders": 24,
    "cancelledOrders": 8,
    "totalPaidAmount": 425300
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

---

## Admin Ticket Management Endpoints

### GET /admin/tickets

Retrieve all customer support tickets across the platform with user details populated, sorted newest first. Accessible only to administrators (`Admin` or `SuperAdmin`).

#### Request Headers

| Header          | Value            | Required |
| :-------------- | :--------------- | :------: |
| `Authorization` | `Bearer <token>` |    ✅    |

#### Responses

##### Response 200

Tickets fetched successfully.

```json
{
  "success": true,
  "message": "Tickets fetched successfully",
  "data": [
    {
      "_id": "67b901234567890abcdef123",
      "user": {
        "_id": "67b901234567890abcdef001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "subject": "Issue with order delivery",
      "category": "shipping",
      "status": "open",
      "priority": "High",
      "messages": [
        "67b901234567890abcdef999"
      ],
      "createdAt": "2026-10-21T18:00:00.000Z",
      "updatedAt": "2026-10-21T18:00:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester does not have administrator privileges.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

### GET /admin/tickets/overview

Retrieve store-wide support ticket counts and status breakdown (`totalTickets`, `openTickets`, `inprogressTickets`, `resolvedTickets`, `closedTickets`). Accessible only to administrators (`Admin` or `SuperAdmin`).

#### Request Headers

| Header          | Value            | Required |
| :-------------- | :--------------- | :------: |
| `Authorization` | `Bearer <token>` |    ✅    |

#### Responses

##### Response 200

Ticket overview fetched successfully.

```json
{
  "success": true,
  "message": "Ticket overview fetched successfully",
  "data": {
    "totalTickets": 45,
    "openTickets": 12,
    "inprogressTickets": 5,
    "resolvedTickets": 22,
    "closedTickets": 6
  }
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester does not have administrator privileges.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

### PUT /admin/tickets/:ticketId

Update support ticket resolution status (`open`, `in_progress`, `resolved`, `closed`). Accessible only to administrators (`Admin` or `SuperAdmin`).

#### Request Headers

| Header          | Value              | Required |
| :-------------- | :----------------- | :------: |
| `Content-Type`  | `application/json` |    ✅    |
| `Authorization` | `Bearer <token>`   |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description             |
| :--------- | :----- | :------: | :---------------------- |
| `ticketId` | string |    ✅    | The ticket's MongoDB ID |

#### Request Body

| Field    | Type   | Required | Description                                              |
| :------- | :----- | :------: | :------------------------------------------------------- |
| `status` | string |    ✅    | `"open"`, `"in_progress"`, `"resolved"`, or `"closed"`. |

```json
{
  "status": "in_progress"
}
```

#### Responses

##### Response 200

Ticket status updated successfully.

```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "_id": "67b901234567890abcdef123",
    "status": "in_progress",
    "updatedAt": "2026-10-21T18:00:00.000Z"
  }
}
```

##### Response 400

Bad request. Ticket ID or Status is required.

```json
{
  "success": false,
  "message": "Status is required"
}
```

##### Response 401

Unauthorized. Missing or invalid Bearer token.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester does not have administrator privileges.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

##### Response 404

Ticket not found.

```json
{
  "success": false,
  "message": "Ticket not found"
}
```

---

## Admin Banner Management Endpoints

### GET /admin/banners/overview

Retrieve aggregated banner statistics (`activeBanners`, `totalBanners`, `inactiveBanners`, `heroHomeBanners`, `heroCategoryBanners`, `heroProductBanners`). Requires Admin privileges.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### Responses

##### Response 200

Banner overview fetched successfully.

```json
{
  "success": true,
  "message": "Banner overview fetched successfully",
  "data": {
    "activeBanners": 5,
    "totalBanners": 8,
    "inactiveBanners": 3,
    "heroHomeBanners": 4,
    "heroCategoryBanners": 2,
    "heroProductBanners": 2
  }
}
```

##### Response 401

Unauthorized. Bearer token missing or invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester does not have admin privileges.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

### GET /admin/banners

Retrieve all banners in the database with optional search, active status, position filters, and pagination. Requires Admin privileges.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### Query Parameters

| Parameter  | Type    | Required | Default | Description                                                        |
| :--------- | :------ | :------: | :------ | :----------------------------------------------------------------- |
| `position` | string  |    ❌    | none    | Optional filter: `hero_home`, `hero_category`, `hero_product`, `all` |
| `isActive` | boolean |    ❌    | none    | Filter by active state (`true` or `false`).                        |
| `search`   | string  |    ❌    | none    | Case-insensitive regex match against title or subtitle.            |
| `page`     | number  |    ❌    | `1`     | Current pagination page.                                           |
| `limit`    | number  |    ❌    | `10`    | Number of banners per page.                                        |

#### Responses

##### Response 200

Banners fetched successfully.

```json
{
  "success": true,
  "message": "Banners fetched successfully",
  "data": [
    {
      "_id": "6718a931a9b4c10023e1109a",
      "title": "Spring Tech Mega Sale 2026",
      "subtitle": "Discover the latest tech with up to 40% discount.",
      "image": {
        "publicId": "Banners/banner_spring_2026",
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.webp"
      },
      "linkType": "category",
      "linkValue": "Laptops",
      "position": "hero_home",
      "isActive": true,
      "priority": 10,
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2026-06-01T00:00:00.000Z",
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. Bearer token missing or invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester does not have admin privileges.

```json
{
  "success": false,
  "message": "Not Authorized"
}
```

---

### POST /admin/banners

Create a new banner with an image upload to Cloudinary. Requires Admin privileges.

#### Request Headers

| Header          | Value                   |
| :-------------- | :---------------------- |
| `Authorization` | `Bearer <admin_jwt>`    |
| `Content-Type`  | `multipart/form-data`   |

#### Form Data Fields

| Field       | Type    | Required | Default     | Description                                                              |
| :---------- | :------ | :------: | :---------- | :----------------------------------------------------------------------- |
| `title`     | string  |    ✅    | —           | Banner title text (1–100 characters).                                    |
| `subtitle`  | string  |    ❌    | `""`        | Banner subtitle text (max 200 characters).                              |
| `image`     | file    |    ✅    | —           | Image file (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5MB).                   |
| `linkType`  | string  |    ❌    | `"none"`    | Redirection type: `category`, `product`, `external`, `none`.              |
| `linkValue` | string  |    ❌    | `""`        | Target value (slug, category name, or external URL).                     |
| `position`  | string  |    ❌    | `hero_home` | Placement target: `hero_home`, `hero_category`, `hero_product`.          |
| `isActive`  | boolean |    ❌    | `true`      | Whether the banner is published and active.                              |
| `priority`  | number  |    ❌    | `0`         | Display priority (higher numbers render first).                          |
| `startDate` | string  |    ❌    | —           | ISO 8601 schedule start date (e.g. `2026-03-01T00:00:00.000Z`).           |
| `endDate`   | string  |    ❌    | —           | ISO 8601 schedule expiration date (e.g. `2026-06-01T00:00:00.000Z`).      |

#### Responses

##### Response 201

Banner created successfully.

```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "6718a931a9b4c10023e1109a",
    "title": "Summer Tech Deals",
    "subtitle": "Get up to 35% off top brand gadgets.",
    "image": {
      "publicId": "Banners/summer_tech_deals",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.webp"
    },
    "linkType": "category",
    "linkValue": "Smartphones",
    "position": "hero_home",
    "isActive": true,
    "priority": 5,
    "startDate": "2026-06-01T00:00:00.000Z",
    "endDate": "2026-08-31T23:59:59.000Z",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

##### Response 400

Bad request. Image file missing or input validation error.

```json
{
  "success": false,
  "message": "Banner image file is required"
}
```

---

### GET /admin/banners/:bannerId

Retrieve single banner details by its MongoDB ID. Requires Admin privileges.

#### Request Headers

| Header          | Value                |
| :-------------- | :------------------- |
| `Authorization` | `Bearer <admin_jwt>` |

#### URL Parameters

| Parameter  | Type   | Required | Description                 |
| :--------- | :----- | :------: | :-------------------------- |
| `bannerId` | string |    ✅    | MongoDB ObjectId of banner. |

#### Responses

##### Response 200

Banner retrieved successfully.

```json
{
  "success": true,
  "message": "Banner fetched successfully",
  "data": {
    "_id": "6718a931a9b4c10023e1109a",
    "title": "Summer Tech Deals",
    "subtitle": "Get up to 35% off top brand gadgets.",
    "image": {
      "publicId": "Banners/summer_tech_deals",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.webp"
    },
    "linkType": "category",
    "linkValue": "Smartphones",
    "position": "hero_home",
    "isActive": true,
    "priority": 5
  }
}
```

##### Response 404

Banner not found.

```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

### PUT /admin/banners/:bannerId

Update an existing banner. Accepts multipart form data if a new image file is uploaded, replacing the existing asset on Cloudinary. Requires Admin privileges.

#### Request Headers

| Header          | Value                   |
| :-------------- | :---------------------- |
| `Authorization` | `Bearer <admin_jwt>`    |
| `Content-Type`  | `multipart/form-data`   |

#### Form Data Fields

Any subset of banner fields can be provided: `title`, `subtitle`, `image` (file, optional), `linkType`, `linkValue`, `position`, `isActive`, `priority`, `startDate`, `endDate`.

#### Responses

##### Response 200

Banner updated successfully.

```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "6718a931a9b4c10023e1109a",
    "title": "Updated Banner Title",
    "isActive": false,
    "priority": 8
  }
}
```

##### Response 404

Banner not found.

```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

### DELETE /admin/banners/:bannerId

Delete a banner permanently and delete its image asset from Cloudinary. Requires Admin privileges.

#### Request Headers

| Header          | Value                |
| :-------------- | :------------------- |
| `Authorization` | `Bearer <admin_jwt>` |

#### URL Parameters

| Parameter  | Type   | Required | Description                 |
| :--------- | :----- | :------: | :-------------------------- |
| `bannerId` | string |    ✅    | MongoDB ObjectId of banner. |

#### Responses

##### Response 200

Banner deleted successfully.

```json
{
  "success": true,
  "message": "Banner deleted successfully",
  "data": null
}
```

##### Response 404

Banner not found.

```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

## Admin User Moderation Endpoints

### PUT /admin/users/:userId/ban

Ban a user account temporarily for a specified number of days (`banDuration`). When banned, the user cannot log in and will receive a 403 Forbidden response on protected routes until the ban expires. SuperAdmin accounts cannot be banned. Accessible only to administrators (`Admin` or `SuperAdmin`). Also supports `PATCH /admin/users/:userId/ban`.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Content-Type`  | `application/json`   |    ✅    |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### URL Parameters

| Parameter | Type   | Required | Description              |
| :-------- | :----- | :------: | :----------------------- |
| `userId`  | string |    ✅    | The user's MongoDB ID    |

#### Request Body

| Field         | Type   | Required | Description                     |
| :------------ | :----- | :------: | :------------------------------ |
| `banDuration` | number |    ✅    | Ban duration in days (e.g. `7`) |

```json
{
  "banDuration": 7
}
```

#### Responses

##### Response 200

User banned successfully.

```json
{
  "success": true,
  "message": "User banned successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "isBanned": true,
    "banExpires": "2026-10-30T12:00:00.000Z"
  }
}
```

##### Response 400

Bad request. Invalid or missing ban duration.

```json
{
  "success": false,
  "message": "Please enter a valid ban duration in days"
}
```

##### Response 403

Forbidden. Requester is not an administrator, or target is a SuperAdmin.

```json
{
  "success": false,
  "message": "Cannot ban a SuperAdmin"
}
```

##### Response 404

User not found.

```json
{
  "success": false,
  "message": "User was not found"
}
```

---

### PUT /admin/users/:userId/unban

Immediately lift the ban on a user account, setting `isBanned` to `false` and clearing `banExpires`. Accessible only to administrators (`Admin` or `SuperAdmin`). Also supports `PATCH /admin/users/:userId/unban`.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### URL Parameters

| Parameter | Type   | Required | Description              |
| :-------- | :----- | :------: | :----------------------- |
| `userId`  | string |    ✅    | The user's MongoDB ID    |

#### Responses

##### Response 200

User unbanned successfully.

```json
{
  "success": true,
  "message": "User unbanned successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "fullName": "Ahmed Mohamed",
    "username": "ahmed_dev",
    "email": "ahmed@example.com",
    "isBanned": false,
    "banExpires": null
  }
}
```

##### Response 404

User not found.

```json
{
  "success": false,
  "message": "User was not found"
}
```

---

## Admin Coupon Management Endpoints

### GET /admin/coupons

Retrieve all discount coupons in the system with optional search, active status, and discount type filters. Accessible only to administrators.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### Query Parameters

| Parameter      | Type    | Required | Default | Description                                                     |
| :------------- | :------ | :------: | :------ | :-------------------------------------------------------------- |
| `search`       | string  |    ❌    | none    | Case-insensitive search on coupon code.                        |
| `isActive`     | boolean |    ❌    | none    | Filter by status (`true` or `false`).                           |
| `discountType` | string  |    ❌    | none    | Filter by type: `percentage` or `fixed`.                        |

#### Responses

##### Response 200

Coupons fetched successfully.

```json
{
  "success": true,
  "message": "Coupons fetched successfully",
  "data": [
    {
      "_id": "6650b2f3c6d8e2345678901b",
      "couponCode": "NEXO50",
      "discountType": "percentage",
      "discountValue": 50,
      "usageLimit": 100,
      "usedCount": 12,
      "usageLimitPerUser": 1,
      "minOrderValue": 200,
      "isActive": true,
      "startDate": "2026-01-01T00:00:00.000Z",
      "expireDate": "2026-12-31T23:59:59.000Z"
    }
  ]
}
```

---

### POST /admin/coupons

Create a new discount coupon with advanced usage limits, category restrictions, and validity period. Accessible only to administrators.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Content-Type`  | `application/json`   |    ✅    |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### Request Body

| Field                  | Type     | Required | Default  | Description                                                 |
| :--------------------- | :------- | :------: | :------- | :---------------------------------------------------------- |
| `couponCode`           | string   |    ✅    | —        | Unique coupon code (automatically converted to uppercase).   |
| `discountType`         | string   |    ✅    | —        | `"percentage"` or `"fixed"`.                                |
| `discountValue`        | number   |    ✅    | —        | Discount amount (1-100 for percentage, >0 for fixed).       |
| `startDate`            | string   |    ✅    | —        | ISO 8601 validity start date.                               |
| `expireDate`           | string   |    ✅    | —        | ISO 8601 validity expiration date.                          |
| `usageLimit`           | number   |    ❌    | `10`     | Total times this coupon can be redeemed platform-wide.      |
| `usageLimitPerUser`    | number   |    ❌    | `1`      | Max redemptions allowed per customer.                       |
| `minOrderValue`        | number   |    ❌    | `0`      | Minimum order subtotal required to apply coupon.            |
| `applicableCategories` | string[] |    ❌    | `[]`     | Restrict to specific category names.                        |
| `maxUsersLimit`        | number   |    ❌    | `null`   | Max unique users who can redeem.                            |
| `isActive`             | boolean  |    ❌    | `true`   | Active status toggle.                                       |

```json
{
  "couponCode": "SUMMER2026",
  "discountType": "percentage",
  "discountValue": 25,
  "usageLimit": 200,
  "usageLimitPerUser": 1,
  "minOrderValue": 500,
  "applicableCategories": ["Laptops", "Accessories"],
  "isActive": true,
  "startDate": "2026-06-01T00:00:00.000Z",
  "expireDate": "2026-08-31T23:59:59.000Z"
}
```

#### Responses

##### Response 201

Coupon created successfully.

```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "67b901234567890abcdef789",
    "couponCode": "SUMMER2026",
    "discountType": "percentage",
    "discountValue": 25,
    "usageLimit": 200,
    "usedCount": 0,
    "isActive": true
  }
}
```

---

### PUT /admin/coupons/:couponId

Update an existing coupon's fields, limits, dates, or active status. Accessible only to administrators.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Content-Type`  | `application/json`   |    ✅    |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description              |
| :--------- | :----- | :------: | :----------------------- |
| `couponId` | string |    ✅    | The coupon's MongoDB ID  |

#### Responses

##### Response 200

Coupon updated successfully.

```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "_id": "67b901234567890abcdef789",
    "couponCode": "SUMMER2026",
    "isActive": false
  }
}
```

---

### DELETE /admin/coupons/:couponId

Delete an unused coupon from the database. Coupons with `usedCount > 0` cannot be deleted. Accessible only to administrators.

#### Request Headers

| Header          | Value                | Required |
| :-------------- | :------------------- | :------: |
| `Authorization` | `Bearer <admin_jwt>` |    ✅    |

#### URL Parameters

| Parameter  | Type   | Required | Description              |
| :--------- | :----- | :------: | :----------------------- |
| `couponId` | string |    ✅    | The coupon's MongoDB ID  |

#### Responses

##### Response 200

Coupon deleted successfully.

```json
{
  "success": true,
  "message": "Coupon deleted successfully",
  "data": null
}
```

##### Response 400

Coupon cannot be deleted as it is already used.

```json
{
  "success": false,
  "message": "Coupon cannot be deleted as it is already used"
}
```

---

## Additional Admin Endpoints

### GET /users

Retrieve a list of all users registered on the platform. Requires authentication.

#### Request Headers

| Header          | Value                     |
| :-------------- | :------------------------ |
| `Authorization` | `Bearer <your_jwt_token>` |

#### Responses

##### Response 200

Users fetched successfully.

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "664fa1e2b5c7e1234567890a",
      "fullName": "Ahmed Mohamed",
      "username": "ahmed_dev",
      "email": "ahmed@example.com",
      "phone": "01012345678",
      "role": "User",
      "isActive": true,
      "createdAt": "2026-10-09T18:00:00.000Z"
    }
  ]
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---



### PATCH /admin/users/:userId/toggle-admin

Toggle a regular account between User and Admin. SuperAdmin accounts cannot be changed.

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| userId | string | ✅ | MongoDB user ID |

### PUT /admin/orders/:orderId

Alias for PATCH /admin/orders/:orderId. Updates the order fulfillment/payment status.

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| orderStatus | string | ✅ | Pending, Processing, Shipped, Delivered, or Cancelled |
| note | string | ❌ | Optional status-history note |
| isPaid | boolean | ❌ | Payment state |

### Coupon route aliases

The coupon router also exposes these Admin-only aliases for the coupon CRUD endpoints documented above.

| Method | Endpoint | Access | Request |
| :--- | :--- | :--- | :--- |
| PUT | /coupons/:couponId | Admin | Coupon update fields documented under Admin Coupons |
| DELETE | /coupons/:couponId | Admin | Path couponId |

## Common HTTP Status Codes

| Code  | Meaning            | Description                                                        |
| :---- | :----------------- | :----------------------------------------------------------------- |
| `200` | **OK**             | Request succeeded and data is returned.                            |
| `201` | **Created**        | Resource created successfully (e.g. register, create product).     |
| `400` | **Bad Request**    | Request body or parameter validation failed or duplicate resource. |
| `401` | **Unauthorized**   | Missing or invalid authentication token.                           |
| `403` | **Forbidden**      | Authenticated, but requester is not authorized for the action.     |
| `404` | **Not Found**      | Requested resource ID does not exist.                              |
| `500` | **Internal Error** | Server error or unhandled exception.                               |
