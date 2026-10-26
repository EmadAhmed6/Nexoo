# Nexo Frontend

Localized e-commerce storefront and admin dashboard built with Next.js App Router, React, TypeScript, Tailwind CSS, next-intl, TanStack Query, Zustand and next-themes.

## Features and routes

All customer routes are localized under /en and /ar. Arabic uses right-to-left layout.

| Route | Description |
|---|---|
| /[locale] | Storefront home, category promotions, banners and product sections |
| /[locale]/products/[id] | Product details, gallery, reviews and available product actions |
| /[locale]/auth/login | Email/password and Google sign-in |
| /[locale]/auth/register | Account creation and email verification flow |
| /[locale]/auth/verify-otp | Email OTP verification/resend |
| /[locale]/auth/forgot-password | Password reset request |
| /[locale]/auth/reset-password and /[locale]/reset-password | Set a new password |
| /[locale]/profile | Profile and account settings, saved addresses and password |
| /[locale]/profile/[id] | Public/user profile view |
| /[locale]/wishlist | Saved products |
| /[locale]/checkout | Shipping details, coupon-aware totals and payment method |
| /[locale]/checkout/success, /cancel | Payment result pages |
| /[locale]/orders | Customer order history |
| /[locale]/notifications | Notifications |
| /[locale]/tickets | Customer support tickets |
| /[locale]/admin | Admin dashboard |
| /[locale]/admin/products, orders, users | Product, order and user administration |
| /[locale]/admin/coupons, banners, tickets | Campaign, banner and support management |

The shared navigation includes account, cart, notifications, wishlist, language and theme controls. Theme changes transition between light and dark modes. Forms provide localized validation and toast feedback.

## Stack

- Next.js App Router and React
- TypeScript and Tailwind CSS
- next-intl for English/Arabic messages and locale routing
- TanStack Query for server data and mutations
- Zustand for client application state
- Axios API client with access-token and refresh handling
- React Hook Form and Zod for forms
- next-themes, Framer Motion, Sonner, Lucide React and Swiper

## Local setup

Requirements: Node.js 18+, pnpm, and a running backend API.

Create frontend/.env.local:

    NEXT_PUBLIC_API_URL=http://localhost:5000

Install and start:

    pnpm install
    pnpm dev

Open http://localhost:3000/en or http://localhost:3000/ar. Production commands are pnpm build and pnpm start; pnpm lint runs ESLint.

## Project structure

    app/[locale]/       Locale layouts and customer/admin routes
    messages/           English and Arabic translation catalogs
    i18n/               Locale routing and request configuration
    features/           Feature APIs, components, hooks, schemas and types
    _components/shared/ Reusable navigation, layout and UI components
    providers/          Theme, query and authentication providers
    lib/                API clients, cookies and shared utilities
    store/              Zustand application state

## Backend documentation

See [the API reference](../backend/API-Docs.md), [backend setup](../backend/README.md), and the root [project guide](../README.md).
