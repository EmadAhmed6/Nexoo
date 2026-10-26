# Nexo — Full-Stack E-Commerce Platform

Nexo is a bilingual (Arabic/English) e-commerce storefront with customer account features and an administrative dashboard. The application uses a localized Next.js App Router frontend and an Express/MongoDB REST API.

## Features

### Storefront and customer account
- Arabic and English routes, right-to-left layout for Arabic, light/dark themes, responsive navigation and product browsing.
- Product catalogue, search suggestions, category and sale browsing, product details, image gallery, likes and customer reviews.
- Persistent cart, wishlist, coupon application and checkout.
- Paymob checkout and cash-on-delivery order flow, optional postal code, order history and order status.
- Registration with email OTP verification, login, Google OAuth, forgot/reset password and refresh-token session.
- Profile editing, profile photo, saved addresses and password changes.
- Notifications and customer support tickets with conversation messages.

### Admin dashboard
- Order and ticket overview, order status updates, user management and moderation.
- Product management, coupon campaigns, promotional banners and support tickets.
- Dashboard navigation includes storefront link and theme control.

### Backend
- Express 5 + TypeScript API with MongoDB/Mongoose, JWT authentication and role-based access.
- Cloudinary uploads, email verification/reset, Google OAuth, Paymob integration and Swagger/OpenAPI.
- Full route reference: [backend/API-Docs.md](./backend/API-Docs.md).

## Repository layout

    backend/    Express API, OpenAPI annotations, and API reference
    frontend/   Next.js localized storefront and admin dashboard

## Requirements

- Node.js 18+
- pnpm
- MongoDB
- Cloudinary account for product/banner/profile images
- SMTP credentials for OTP and password reset email
- Google OAuth and Paymob credentials for those integrations

## Run locally

### Backend

    cd backend
    pnpm install

Create backend/.env with the variables listed in [backend/README.md](./backend/README.md), then run:

    pnpm dev

API: http://localhost:5000
Swagger UI: http://localhost:5000/api-docs

### Frontend

In another terminal:

    cd frontend
    pnpm install

Create frontend/.env.local:

    NEXT_PUBLIC_API_URL=http://localhost:5000

Then run:

    pnpm dev

Open http://localhost:3000. Locale routes are under /en and /ar.

## Documentation

- [Backend setup and feature overview](./backend/README.md)
- [Backend endpoint reference](./backend/API-Docs.md)
- [Frontend setup and feature overview](./frontend/README.md)
- Interactive API docs at http://localhost:5000/api-docs when the backend is running
