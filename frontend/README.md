# Nexo Frontend Storefront

A luxury, high-performance modern e-commerce storefront built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and **TanStack Query**.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14.x-ff0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-443e38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand.docs.pmnd.rs/)

---

## 💎 Design Aesthetics & Philosophy

Nexo is designed as a **luxury e-commerce experience**:
- **Tailored Color Palette**: Rich midnight obsidian (`#0f1115`), card elevation (`#161920`), and shimmering champagne gold (`#d4af37`) accents.
- **Micro-Animations & Smooth Transitions**: Interactive button spring taps, hover scalings, and page transitions powered by `framer-motion`.
- **Global Clickable Affordance**: Consistent pointer cursors (`cursor-pointer`) across all buttons and interactive controls.
- **Typography & Layout**: Modern, clean typography with high readability and responsive spacing from mobile to ultra-wide displays.

---

## ✨ Key Features

### 🛍️ Interactive Product Detail Page (`/products/[id]`)
- **Sticky / Fixed Image Gallery**: On desktop screens, the entire product image gallery stays fixed in view (`sticky`) alongside the long description and specifications.
- **Hover-to-Switch Gallery**: Hovering over any vertical thumbnail flips the large display image immediately with smooth spring animations.
- **In-Place Image Editing**: Product owners and admins can click the edit pencil on any thumbnail or on the main image to replace that specific image right from the page without leaving.
- **Delete Confirmation Modal**: Custom animated modal dialog with backdrop blur, item name confirmation, and loading indicators.
- **Dynamic Discount & Savings Calculator**: Automatically computes discount percentages, displays strikethrough original prices, and shows total savings in EGP.

### 🏷️ Dedicated "Hot Deals / On Sale" Section
- Dedicated `SaleGrid` component on the homepage highlighting products with active discounts.
- Distinct gold badges, countdown aura, and instant "Add to Cart" triggers.

### 🛒 Real-Time Cart Management
- Persistent client-side cart powered by **Zustand** with `localStorage` hydration.
- Slide-over animated `CartDrawer` with quantity increment/decrement, item removal, and auto-calculated subtotals.

### 📝 Comprehensive Product Management
- **Create Product Modal**: Multi-file drag & drop image uploads (up to 5 images), automatic preview generation, and Zod input validation.
- **Edit Product Modal**: Flexible image management allowing the owner to replace individual images, delete images, or add new images without re-uploading everything. Image editing is fully optional.

---

## 🛠️ Tech Stack & Libraries

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack React framework, Server Components, SEO optimization |
| **React 19** | Modern UI component rendering |
| **TypeScript** | Strict compile-time type safety |
| **Tailwind CSS v4** | Modern utility-first CSS styling system |
| **Framer Motion 14** | Physics-based animations, layout transitions, modal enter/exit |
| **TanStack Query v5** | Server state management, caching, optimistic mutations, refetching |
| **Zustand 5** | Lightweight client state for cart, authentication, and theme |
| **React Hook Form & Zod** | Controlled forms with schema validation |
| **Axios** | HTTP client with automatic JWT token attachment |
| **Sonner** | Toast notifications |
| **Lucide React** | Modern iconography |

---

## 📁 Directory Structure

```text
frontend/
├── _components/
│   ├── shared/                # Atomic reusable components (Button, Input, Text, Navbar)
│   └── theme-toggle.tsx       # Theme toggler
├── app/
│   ├── layout.tsx             # Root layout with QueryClient & Theme providers
│   ├── page.tsx               # Homepage with Hero, SaleGrid, and ProductGrid
│   ├── globals.css            # Tailwind v4 theme tokens and global cursor rules
│   └── products/
│       └── [id]/              # Product detail page with interactive gallery & owner controls
├── features/
│   ├── cart/                  # Cart drawer, Zustand cart store, badge count
│   └── products/
│       ├── api/               # Product endpoints via Axios client
│       ├── components/        # ProductCard, ProductGrid, SaleGrid, Modals
│       │   ├── CreateProductModal.tsx
│       │   ├── EditProductModal.tsx
│       │   └── DeleteConfirmModal.tsx
│       ├── hooks/             # TanStack Query custom hooks (useProducts, useProduct, etc.)
│       └── types/             # Product TypeScript interfaces
├── lib/
│   ├── axios-client.ts        # Axios instance with interceptors & JWT injection
│   ├── cookies.ts             # Cookie helpers for auth token persistence
│   └── utils.ts               # Tailwind class merge helper (`cn`)
├── store/
│   └── use-app-store.ts       # Global app store (user session, authentication status)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# URL of the running backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- `pnpm` (recommended) or `npm` / `yarn`
- Running Nexo Backend API instance (`http://localhost:5000`)

### Installation & Run

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**:
   ```bash
   pnpm build
   ```

4. **Run Production Server**:
   ```bash
   pnpm start
   ```

---

## 👨‍💻 Author

- **Emad Ahmed** — Full Stack Developer
- Portfolio: [https://emad-site.vercel.app/](https://emad-site.vercel.app/)
- Email: [emadahmeddev@gmail.com](mailto:emadahmeddev@gmail.com)
