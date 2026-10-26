# Nexo Backend

Express 5 REST API using TypeScript, MongoDB/Mongoose, JWT, Passport Google OAuth, Cloudinary, Nodemailer, Paymob and Swagger UI.

## Capabilities

- Email/password signup with OTP verification, login, password reset, refresh-token cookies and Google OAuth.
- Customer profiles, profile images, addresses and password management.
- Product catalogue/search, owner-authorized product management, reviews, cart and wishlist.
- Coupons, orders, Paymob checkout/webhook, notifications and customer support tickets.
- Admin order/ticket/banner/coupon/user-management endpoints and dashboard overviews.
- Centralized JSON responses and Zod validation.

## Run locally

Requirements: Node.js 18+, pnpm, MongoDB. Configure backend/.env:

| Variable | Purpose |
|---|---|
| PORT | API port; defaults to 5000 |
| TRUST_PROXY_HOPS | Optional trusted proxy hop count; configure to match the known reverse-proxy chain in production |
| FRONTEND_URL | Frontend origin, e.g. http://localhost:3000 |
| MONGO_URI | MongoDB connection |
| JWT_SECRET_KEY | Access JWT signing/verification |
| JWT_REFRESH_SECRET_KEY | Refresh JWT signing/verification |
| GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | Google OAuth credentials |
| GOOGLE_CALLBACK_URL | Callback; defaults to http://localhost:5000/auth/google/callback |
| USER_EMAIL, USER_PASS | SMTP account for OTP and reset email |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Upload storage |
| PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID | Paymob payment flow |
| PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE | Optional PayPal SDK configuration |

Never commit real environment credentials. Configure the exact Google callback URL in Google Cloud Console and use the frontend origin for CORS/OAuth redirects.

    pnpm install
    pnpm dev

Build with pnpm build. The API listens on port 5000 by default. Swagger UI is served from http://localhost:5000/api-docs.

## API conventions

- API paths are mounted at the root (for example /auth/login and /products); there is no /api/v1 prefix.
- Bearer access token is required on authenticated routes. Refresh token is stored in an HTTP-only cookie.
- General API requests are limited to 500 per IP per 15 minutes; sensitive auth endpoints also share a 10-per-minute limit. Rate-limited responses return HTTP 429 with standard RateLimit headers. Swagger UI and the Paymob webhook bypass the global limit.
- The default rate-limit counters are in memory per process. Use a shared store if deploying multiple backend instances; configure Express proxy trust to match the actual proxy chain so client IPs are identified correctly.
- Success responses generally use { success, message, data }; errors use { success: false, message }.
- Product and banner image uploads are multipart/form-data.
- Roles include User, Admin, and SuperAdmin. Product ownership and ticket ownership are also enforced.

## Route groups

| Group | Prefix | Scope |
|---|---|---|
| Authentication | /auth | OTP, password reset, session refresh/logout, Google OAuth |
| Users | /users | Profiles, addresses, account management |
| Products and reviews | /products, /reviews | Catalogue, suggestions, product CRUD, likes, reviews |
| Cart and wishlist | /cart, /wishlist | Customer shopping state |
| Coupons | /coupons, /admin/coupons | Apply/remove and admin campaign management |
| Orders | /orders, /admin/orders | Customer orders, Paymob and admin fulfillment |
| Notifications | /notifications | List, read and delete |
| Tickets | /tickets, /admin/tickets | Customer conversations and admin status |
| Banners | /banners, /admin/banners | Public active banners and admin management |
| Admin users | /admin/users | Ban/unban and role toggles |

The endpoint list, request fields, permissions, optional postal code behavior and integrations are documented in [API-Docs.md](./API-Docs.md). Swagger annotations are maintained in src/docs/ and loaded by src/config/swagger.ts.
