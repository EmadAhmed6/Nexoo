# Nexo REST API

Reference for the Express API mounted by backend/src/app.ts. The API is rooted at /; it does not use an /api/v1 prefix. Interactive OpenAPI documentation is available at /api-docs while the backend is running.

## Base URL and conventions

- Local base URL: http://localhost:5000
- JSON request and response bodies use application/json, except multipart image uploads.
- Authenticated routes use Authorization: Bearer <accessToken>.
- Login, OTP verification, and Google sign-in issue access credentials and an HTTP-only refreshToken cookie. Send cookies with credentials enabled; refresh/logout use that cookie.
- Most successful responses use { success: true, message, data }. Errors created with sendError use { success: false, message }; framework errors may only contain message.
- General API traffic is limited to 500 requests per client IP per 15 minutes. Authentication attempts (register, login, OTP verify/resend, forgot password, and reset password) have an additional shared limit of 10 requests per IP per minute. A limit response uses HTTP 429 and includes standard RateLimit headers.
- Swagger UI and the Paymob server webhook are excluded from the general API limit. The default limiter store is in-memory per backend process; use a shared store before running multiple API instances.
- IDs shown as {id} are MongoDB ObjectIds.

## Endpoint requirements table

For JSON routes, send the listed fields in the request body. “Path ID” means the corresponding MongoDB ID in the URL. All authenticated requests require a bearer access token unless the route says refresh cookie or OAuth.

| # | Method | Endpoint | Required input | Access |
|---:|---|---|---|---|
| 1 | POST | /auth/register | username, fullName, email, password, phone | Public |
| 2 | POST | /auth/verify-otp | email, otp | Public |
| 3 | POST | /auth/resend-otp | email | Public |
| 4 | POST | /auth/login | email, password | Public |
| 5 | POST | /auth/forgot-password | email | Public |
| 6 | POST | /auth/reset-password | email, token, newPassword | Public |
| 7 | GET | /auth/me | Bearer token | User |
| 8 | GET, POST | /auth/refresh | refreshToken cookie | Refresh cookie |
| 9 | GET, POST | /auth/logout | No body | Public/session |
| 10 | GET | /auth/google | Browser redirect; optional origin, popup query | Public |
| 11 | GET | /auth/google/callback | OAuth code/state query and OAuth cookies | Google OAuth |
| 12 | GET | /users | No body | Admin |
| 13 | GET | /users/{userId} | Path ID | Authenticated |
| 14 | PUT | /users/{userId} | Profile fields; optional multipart profilePicture | Owner/Admin |
| 15 | DELETE | /users/{userId} | Path ID | Owner/Admin |
| 16 | DELETE | /users/{userId}/profile-picture | Path ID | Owner/Admin |
| 17 | GET, POST | /users/{userId}/addresses | Path ID; create requires street, city, state, phone; postalCode optional | Authenticated/Owner |
| 18 | PUT, DELETE | /users/{userId}/addresses/{addressId} | Path IDs; PUT accepts address fields | Owner/Admin |
| 19 | PUT | /users/{userId}/change-password | oldPassword, newPassword | Owner/Admin |
| 20 | GET | /products | Optional search/filter/pagination query parameters | Public |
| 21 | POST | /products | Product fields and up to 5 productImages files (multipart) | User |
| 22 | GET | /products/suggestions | Search query | Public |
| 23 | GET | /products/{productId} | Path ID | Public |
| 24 | PUT | /products/{productId} | Path ID and changed product fields; optional productImages | Owner/Admin |
| 25 | PATCH | /products/{productId} | Path ID | User |
| 26 | DELETE | /products/{productId} | Path ID | Owner/Admin |
| 27 | GET, POST | /products/{productId}/reviews | Path ID; POST requires reviewText, ratings | Public/User |
| 28 | GET, POST | /reviews/{productId} | Path ID; POST requires reviewText, ratings | Public/User |
| 29 | PUT, DELETE | /reviews/{reviewId} | Path ID; PUT accepts reviewText and/or ratings | Review owner/Admin |
| 30 | PUT, DELETE | /reviews/{productId}/{reviewId} | Path IDs; PUT accepts reviewText and/or ratings | Review owner/Admin |
| 31 | GET | /cart | No body | User |
| 32 | POST | /cart/{productId} | Path ID; optional quantity fields per cart schema | User |
| 33 | PUT | /cart/{productId} | Path ID and quantity | User |
| 34 | DELETE | /cart/{productId} | Path ID | User |
| 35 | DELETE | /cart | No body | User |
| 36 | GET | /wishlist | No body | User |
| 37 | POST | /wishlist/{productId} | Path ID | User |
| 38 | DELETE | /wishlist/{productId} | Path ID | User |
| 39 | DELETE | /wishlist | No body | User |
| 40 | POST | /coupons/apply | Coupon code | User |
| 41 | DELETE | /coupons/remove | No body | User |
| 42 | GET | /admin/coupons | Optional search, isActive, discountType query | Admin |
| 43 | POST | /admin/coupons | couponCode, discountType, discountValue, startDate, expireDate | Admin |
| 44 | PUT, DELETE | /admin/coupons/{couponId} | Path ID; PUT accepts coupon fields | Admin |
| 45 | PUT, DELETE | /coupons/{couponId} | Path ID; PUT accepts coupon fields | Admin alias |
| 46 | POST | /orders | shippingAddress (address, city, state, country, phone; postalCode optional), paymentMethod | User |
| 47 | GET | /orders | No body | User |
| 48 | GET, PUT, DELETE | /orders/{orderId} | Path ID; PUT accepts order update fields | Order owner |
| 49 | POST | /orders/paymob/create | Order/payment data required by Paymob controller | User |
| 50 | POST | /orders/paymob/verify | Paymob verification data required by controller | User |
| 51 | POST | /orders/paymob/webhook | Paymob webhook payload | Paymob server |
| 52 | GET | /admin/orders | Optional admin filters/query | Admin |
| 53 | GET | /admin/orders/overview | No body | Admin |
| 54 | GET | /admin/orders/{orderId} | Path ID | Admin |
| 55 | PATCH, PUT | /admin/orders/{orderId} | orderStatus; optional note, isPaid | Admin |
| 56 | GET, DELETE | /notifications | No body | User |
| 57 | PATCH | /notifications/read-all | No body | User |
| 58 | GET, PATCH, DELETE | /notifications/{notificationId} | Path ID | User |
| 59 | PATCH | /notifications/{notificationId}/read | Path ID | User |
| 60 | POST | /tickets | subject, category, priority, message | User |
| 61 | GET | /tickets/my | No body | User |
| 62 | GET, PUT, DELETE | /tickets/{ticketId} | Path ID; PUT accepts ticket update fields | Ticket owner |
| 63 | POST | /tickets/{ticketId}/messages | Path ID and message content | Ticket owner |
| 64 | GET | /admin/tickets | Optional status/search filters | Admin |
| 65 | PUT | /admin/tickets/{ticketId} | Path ID and status fields | Admin |
| 66 | GET | /admin/tickets/overview | No body | Admin |
| 67 | GET | /banners | Optional position query | Public |
| 68 | GET | /admin/banners | Optional admin filters/query | Admin |
| 69 | POST | /admin/banners | Banner fields plus image file (multipart) | Admin |
| 70 | GET | /admin/banners/overview | No body | Admin |
| 71 | GET, PUT, DELETE | /admin/banners/{bannerId} | Path ID; PUT accepts banner fields and optional image | Admin |
| 72 | PUT, PATCH | /admin/users/{userId}/ban | Path ID and banDuration (days) | Admin |
| 73 | PUT, PATCH | /admin/users/{userId}/unban | Path ID | Admin |
| 74 | PATCH | /admin/users/{userId}/toggle-admin | Path ID | Admin |

Note: the root POST /wishlist route is registered but its current handler reads productId from the URL path. Use POST /wishlist/{productId}; this is the working add-to-wishlist route.

## Authentication and account lifecycle

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Create account and send email verification OTP |
| POST | /auth/verify-otp | Public | Verify email using { email, otp } |
| POST | /auth/resend-otp | Public | Send a fresh verification OTP using { email } |
| POST | /auth/login | Public | Sign in with { email, password } |
| POST | /auth/forgot-password | Public | Request password-reset email using { email } |
| POST | /auth/reset-password | Public | Reset with { email, token, newPassword } |
| GET | /auth/me | User | Return authenticated account |
| GET, POST | /auth/refresh | Refresh cookie | Refresh access credentials |
| GET, POST | /auth/logout | Public/session | Clear refresh cookie |
| GET | /auth/google | Public | Start Google OAuth; redirects browser to Google |
| GET | /auth/google/callback | OAuth callback | Complete OAuth and redirect to frontend |

Registration fields: username, fullName, email, password, phone. Usernames contain letters, digits, underscores; password is 6–72 characters with uppercase, lowercase, and a digit; phone is 11 characters. New accounts must verify email before normal sign-in.

Google callback defaults to http://localhost:5000/auth/google/callback and can be overridden by GOOGLE_CALLBACK_URL. Register that exact callback in Google Cloud Console. /auth/google is an authorization-start route, not a redirect URI. Configure FRONTEND_URL, Google client credentials, and credentials-enabled CORS.

## Users, profiles, and addresses

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /users | Admin | List users |
| GET | /users/{userId} | User | Read profile |
| PUT | /users/{userId} | Owner or Admin | Update profile; multipart profilePicture supported |
| DELETE | /users/{userId} | Owner or Admin | Delete account |
| DELETE | /users/{userId}/profile-picture | Owner or Admin | Remove profile image |
| GET | /users/{userId}/addresses | User | List saved addresses |
| POST | /users/{userId}/addresses | Owner or Admin | Add address |
| PUT | /users/{userId}/addresses/{addressId} | Owner or Admin | Update address |
| DELETE | /users/{userId}/addresses/{addressId} | Owner or Admin | Delete address |
| PUT | /users/{userId}/change-password | Owner or Admin | Change password with { oldPassword, newPassword } |

Address fields: street, city, state, postalCode (optional), phone, isDefault. Blank/null postal code is accepted. Use multipart/form-data for profile picture uploads.

## Products, search, and reviews

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /products | Public | List/filter products |
| POST | /products | User | Create product; up to 5 productImages |
| GET | /products/suggestions | Public | Product search suggestions |
| GET | /products/{productId} | Public | Read product |
| PUT | /products/{productId} | Owner, Admin, or SuperAdmin | Update product |
| PATCH | /products/{productId} | User | Toggle product like |
| DELETE | /products/{productId} | Owner, Admin, or SuperAdmin | Delete product |
| GET, POST | /products/{productId}/reviews | Public/User | List or create product review |
| PUT, DELETE | /products/{productId}/reviews/{reviewId} | Review owner/Admin | Update/delete nested product review |
| GET, POST | /reviews/{productId} | Public/User | Standalone review list/create alias |
| PUT, DELETE | /reviews/{reviewId} | Review owner/Admin | Update/delete review |
| PUT, DELETE | /reviews/{productId}/{reviewId} | Review owner/Admin | Update/delete review |

Product list accepts the search, category, price, stock, rating, discount, and pagination filters implemented by the product controller. Product uploads use multipart/form-data with productImages. Ownership is enforced on product mutations.

## Cart and wishlist

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /cart | User | Get current cart |
| POST | /cart/{productId} | User | Add product |
| PUT | /cart/{productId} | User | Set/update quantity |
| DELETE | /cart/{productId} | User | Remove cart item |
| DELETE | /cart | User | Clear cart |
| GET | /wishlist | User | List saved products |
| POST | /wishlist | User | Add product using request body |
| POST | /wishlist/{productId} | User | Add product by path |
| DELETE | /wishlist/{productId} | User | Remove one product |
| DELETE | /wishlist | User | Clear wishlist |

## Coupons

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /coupons/apply | User | Apply coupon to current cart |
| DELETE | /coupons/remove | User | Remove applied coupon |
| GET | /admin/coupons | Admin | List coupons; search, isActive, discountType filters |
| POST | /admin/coupons | Admin | Create coupon |
| PUT | /admin/coupons/{couponId} | Admin | Update coupon |
| DELETE | /admin/coupons/{couponId} | Admin | Delete coupon |
| PUT, DELETE | /coupons/{couponId} | Admin | Update/delete aliases |

Coupon create fields: couponCode, discountType (percentage or fixed), discountValue, startDate, expireDate; optional usageLimit, usageLimitPerUser, minOrderValue, applicableCategories, maxUsersLimit, isActive. Percentage discounts cannot exceed 100; expiry must follow start. Codes are uppercased.

## Orders and payments

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /orders | User | Create from current cart |
| GET | /orders | User | List own orders |
| GET | /orders/{orderId} | Owner | Read order |
| PUT | /orders/{orderId} | Owner | Update fields accepted by update schema |
| DELETE | /orders/{orderId} | Owner | Delete order |
| POST | /orders/paymob/create | User | Create Paymob checkout intention |
| POST | /orders/paymob/verify | User | Verify Paymob payment |
| POST | /orders/paymob/webhook | Paymob server | Payment callback; no bearer token |
| GET | /admin/orders | Admin | List/filter orders |
| GET | /admin/orders/overview | Admin | Order dashboard metrics |
| GET | /admin/orders/{orderId} | Admin | Read any order |
| PATCH, PUT | /admin/orders/{orderId} | Admin | Update fulfillment/payment status |

Order request example (postalCode is optional):

    {
      "shippingAddress": {
        "address": "12 Example Street",
        "city": "Cairo",
        "state": "Cairo",
        "country": "Egypt",
        "postalCode": "11371",
        "phone": "01012345678"
      },
      "paymentMethod": "Paymob"
    }

Required address fields are address, city, state, country, phone. Payment methods accepted by the order schema are Paymob, COD, Stripe. Order items and totals are derived from the authenticated user's cart. Paymob needs its secret/public/integration keys.

## Notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /notifications | User | List own notifications |
| DELETE | /notifications | User | Delete all own notifications |
| PATCH | /notifications/read-all | User | Mark all as read |
| GET | /notifications/{notificationId} | User | Read notification |
| PATCH | /notifications/{notificationId} | User | Mark one as read |
| PATCH | /notifications/{notificationId}/read | User | Mark one as read alias |
| DELETE | /notifications/{notificationId} | User | Delete one notification |

## Support tickets

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /tickets | User | Create ticket |
| GET | /tickets/my | User | List own tickets |
| GET | /tickets/{ticketId} | Ticket owner | Read ticket/conversation |
| PUT | /tickets/{ticketId} | Ticket owner | Update ticket |
| DELETE | /tickets/{ticketId} | Ticket owner | Delete ticket |
| POST | /tickets/{ticketId}/messages | Ticket owner | Add message |
| GET | /admin/tickets | Admin | List/filter tickets |
| PUT | /admin/tickets/{ticketId} | Admin | Update ticket status |
| GET | /admin/tickets/overview | Admin | Ticket dashboard metrics |

## Banners

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /banners | Public | Get active storefront banners |
| GET | /admin/banners | Admin | List banners |
| POST | /admin/banners | Admin | Create banner with multipart image |
| GET | /admin/banners/overview | Admin | Banner dashboard metrics |
| GET | /admin/banners/{bannerId} | Admin | Read banner |
| PUT | /admin/banners/{bannerId} | Admin | Update banner; image optional |
| DELETE | /admin/banners/{bannerId} | Admin | Delete banner |

Admin banner files use multipart/form-data field image. Banner fields and scheduling are defined by the banner model and Swagger schema.

## Admin user moderation

| Method | Path | Access | Purpose |
|---|---|---|---|
| PUT, PATCH | /admin/users/{userId}/ban | Admin | Ban with { banDuration } in days |
| PUT, PATCH | /admin/users/{userId}/unban | Admin | Remove ban |
| PATCH | /admin/users/{userId}/toggle-admin | Admin | Toggle User/Admin; SuperAdmin is protected |

## Swagger/OpenAPI

Swagger annotations live in backend/src/docs/. backend/src/config/swagger.ts loads matching TypeScript or compiled JavaScript annotations and serves the generated document at /api-docs. Update the related annotation whenever a route, request schema, response, or permission changes, then keep this catalog aligned with route files.

## Environment variables

Set these in backend/.env. Use your own provider secrets and do not commit real credentials.

| Variable | Purpose |
|---|---|
| PORT | HTTP port; defaults to 5000 |
| TRUST_PROXY_HOPS | Optional trusted proxy hop count; set only to the known number of proxies in front of Express so rate limits use the original client IP |
| FRONTEND_URL | Frontend origin for CORS and OAuth redirects |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET_KEY | Access-token signing/verification secret |
| JWT_REFRESH_SECRET_KEY | Refresh-token secret |
| GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | Google OAuth client credentials |
| GOOGLE_CALLBACK_URL | OAuth callback; defaults to http://localhost:5000/auth/google/callback |
| USER_EMAIL, USER_PASS | SMTP credentials for verification/reset emails |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Image storage credentials |
| PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID | Paymob checkout |
| PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE | PayPal SDK configuration where enabled |
