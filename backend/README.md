# Nexo Backend API

A high-performance, robust, and scalable e-commerce RESTful API built with **Express 5**, **TypeScript**, **MongoDB (Mongoose)**, and **Cloudinary**.

[![Node.js](https://img.shields.io/badge/Node.js-18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448c5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85ea2d?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:5000/api-docs)

---

## 🚀 Overview

The Nexo Backend powers a modern luxury e-commerce platform. It provides end-to-end management for authentication, user profiles, product catalogs, rich filtering, media storage, and role-based permissions.

### 🌟 Key Highlights

- **Authentication & Authorization**: Secure JWT authentication with bcrypt password hashing and 3-tier Role-Based Access Control (`User`, `Admin`, `SuperAdmin`).
- **Product Ownership Architecture**: Every product tracks its creator (`userId`). Modifying or deleting products is strictly guarded by `verifyProductOwner` middleware (allowed only for the owner, Admin, or SuperAdmin).
- **Flexible Cloudinary Media Management**: Upload up to 5 images per product. Supports independent image editing: keep existing images via `existingImages` JSON or replace individual images without re-uploading the entire gallery.
- **Advanced Query Engine**: Comprehensive filtering on `/products` by search keyword (regex across title, description, category), minimum/maximum price, in-stock status, rating range, and active discount flags.
- **Interactive API Documentation**: Live Swagger OpenAPI 3.0 documentation served at `/api-docs` and standalone Markdown guide in [`API-Docs.md`](./API-Docs.md).
- **Type Safety & Validation**: Full TypeScript end-to-end integration with strict Zod runtime request schemas.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime & Language** | Node.js, TypeScript (ES Modules) |
| **Web Framework** | Express 5 |
| **Database & ODM** | MongoDB, Mongoose 9 |
| **Validation** | Zod (Runtime schema validation) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `helmet`, `cors` |
| **File Uploads & CDN** | Multer, Cloudinary SDK v2 |
| **Documentation** | Swagger-JSDoc, Swagger-UI-Express |
| **Developer Tools** | `tsx` (Watch mode runner), `typescript` compiler |

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── config.ts          # MongoDB connection handler
│   │   ├── cloudinary.ts      # Cloudinary v2 setup
│   │   └── swagger.ts         # Swagger-JSDoc OpenAPI config
│   ├── docs/
│   │   ├── auth.docs.ts       # Swagger annotations for /auth
│   │   ├── user.docs.ts       # Swagger annotations for /users
│   │   └── product.docs.ts    # Swagger annotations for /products
│   ├── middlewares/
│   │   ├── errors.ts          # Centralized error & 404 handlers
│   │   ├── multer.ts          # Multipart file upload storage
│   │   └── verifyToken.ts     # JWT verification & ownership guard
│   ├── modules/
│   │   ├── auth/              # Registration, Login, Token generation
│   │   ├── Product/           # Controller, Model, Zod schema, Routes
│   │   └── Users/             # User management, Roles, Routes
│   └── app.ts                 # Express server bootstrap & routes mounting
├── API-Docs.md                # Comprehensive Markdown API documentation
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexo?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- `pnpm` (recommended) or `npm` / `yarn`
- MongoDB database instance (Atlas or local)
- Cloudinary account

### Installation & Run

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Start Development Server** (with live reload via `tsx`):
   ```bash
   pnpm dev
   ```
   Server will start on `http://localhost:5000`.

3. **Build for Production**:
   ```bash
   pnpm build
   ```

4. **Access Interactive Documentation**:
   Visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser.

---

## 📡 API Endpoints Overview

For detailed request/response examples and schemas, see [`API-Docs.md`](./API-Docs.md).

### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register new user account | Public |
| `POST` | `/auth/login` | Authenticate user & receive JWT | Public |

### 👤 Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `GET` | `/users` | Get all users list | User/Admin |
| `GET` | `/users/:userId` | Get single user profile | User/Admin |
| `PUT` | `/users/:userId` | Update profile information | Owner/Admin |
| `DELETE` | `/users/:userId` | Delete user account permanently | Owner/Admin |

### 🛍️ Products
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `GET` | `/products` | Query products with filters, search, and pagination | User/Admin |
| `POST` | `/products` | Create product with up to 5 Cloudinary images | Authenticated User |
| `GET` | `/products/:productId` | Retrieve single product details by ID | User/Admin |
| `PUT` | `/products/:productId` | Update product, details, and optional images | Product Owner / Admin |
| `DELETE` | `/products/:productId` | Delete a product permanently | Product Owner / Admin |

---

## 🛡️ Security Implementation

- **Helmet**: Secures HTTP headers against common vulnerabilities.
- **CORS**: Configured to restrict requests strictly to the frontend origin.
- **Bcrypt**: Passwords hashed with secure 10 salt rounds before database persistence.
- **Role Verification**: Middleware ensures regular users cannot escalate privileges or delete other users' products.
- **Granular Ownership Guard (`verifyProductOwner`)**: Ensures that products can only be modified or deleted by the user who created them (or system administrators).

---

## 👨‍💻 Author

- **Emad Ahmed** — Full Stack Developer
- Portfolio: [https://emad-site.vercel.app/](https://emad-site.vercel.app/)
- Email: [emadahmeddev@gmail.com](mailto:emadahmeddev@gmail.com)
