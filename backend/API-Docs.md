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

- **Success Responses**: Wrapped in a consistent envelope structure containing a `status` string set to `"success"`, a `message` string, and a `data` field holding the returned resource(s) or metadata:
  ```json
  {
    "status": "success",
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
- **Error Responses**: Validation, authorization, and server errors use the `sendError` envelope below:
  ```json
  {
    "status": "fail",
    "message": "Error details and description go here"
  }
  ```

### Authentication

Protected routes require JSON Web Token (JWT) authentication passed in the HTTP `Authorization` header as a Bearer token:
`Authorization: Bearer <your_jwt_token>`

---

| #   | Method | Endpoint                 | Description                                                                    | Auth |
| :-- | :----- | :----------------------- | :----------------------------------------------------------------------------- | :--: |
| 1   | POST   | `/auth/register`         | Register a new user account and obtain access token                            |  ❌  |
| 2   | POST   | `/auth/login`            | Authenticate existing user with email & password and retrieve access token     |  ❌  |
| 3   | GET    | `/users`                 | Retrieve list of all registered users (passwords excluded)                     |  🔒  |
| 4   | GET    | `/users/:userId`         | Retrieve single user profile by ID                                             |  🔒  |
| 5   | PUT    | `/users/:userId`         | Update user profile details (Owner, Admin, or SuperAdmin)                      |  🔒  |
| 6   | DELETE | `/users/:userId`         | Delete user account permanently (Owner, Admin, or SuperAdmin)                  |  🔒  |
| 7   | GET    | `/products`              | Retrieve products with filters (search, price range, stock, rating, discount)  |  ❌  |
| 8   | POST   | `/products`              | Create a new product with multiple image uploads to Cloudinary (up to 5 files) |  🔒  |
| 9   | GET    | `/products/:productId`   | Retrieve single product details by ID                                          |  ❌  |
| 10  | PUT    | `/products/:productId`   | Update existing product details and images (Owner or Admin)                    |  🔒  |
| 11  | PATCH  | `/products/:productId`   | Toggle like / unlike on a product                                              |  🔒  |
| 12  | DELETE | `/products/:productId`   | Delete a product by ID (Owner or Admin)                                        |  🔒  |
| 13  | GET    | `/cart`                  | Retrieve authenticated user's cart with populated product info                 |  🔒  |
| 14  | POST   | `/cart/:productId`       | Add product to user cart with quantity (defaults to 1)                         |  🔒  |
| 15  | PUT    | `/cart/:productId`       | Update item quantity in user cart                                              |  🔒  |
| 16  | DELETE | `/cart/:productId`       | Remove product from user cart                                                  |  🔒  |
| 17  | DELETE | `/cart`                  | Clear entire user shopping cart                                                |  🔒  |
| 18  | GET    | `/wishlist`              | Retrieve authenticated user's wishlist with populated products                 |  🔒  |
| 19  | POST   | `/wishlist/:productId`   | Add product to user's wishlist                                                 |  🔒  |
| 20  | DELETE | `/wishlist/:productId`   | Remove product from user's wishlist                                            |  🔒  |
| 21  | DELETE | `/wishlist`              | Clear entire user wishlist                                                     |  🔒  |
| 22  | POST   | `/orders`                   | Create new order from user's current cart                                         |  🔒  |
| 23  | GET    | `/orders`                   | Retrieve list of all orders belonging to authenticated user                       |  🔒  |
| 24  | GET    | `/orders/:orderId`          | Retrieve single order details by ID                                               |  🔒  |
| 25  | POST   | `/orders/paymob/create`     | Initiate Paymob Unified Checkout session and obtain `checkoutUrl`                 |  🔒  |
| 26  | POST   | `/orders/paymob/verify`     | Verify Paymob payment after customer redirect and mark order as paid              |  🔒  |
| 27  | POST   | `/orders/paymob/webhook`    | Paymob server-to-server webhook to automatically confirm payment                  |  ❌  |
| 28  | PUT    | `/orders/:orderId`          | Update shipping address or payment method of pending order                        |  🔒  |
| 29  | DELETE | `/orders/:orderId`          | Cancel and delete a pending order                                                 |  🔒  |
| 30  | GET    | `/admin/orders`             | Retrieve all platform orders with populated customer info (Admin only)            |  🔒  |
| 31  | GET    | `/admin/orders/:orderId`    | Retrieve complete details of any order by ID (Admin only)                         |  🔒  |
| 32  | PATCH  | `/admin/orders/:orderId`    | Update order delivery and fulfillment status (Admin only)                         |  🔒  |
| 33  | GET    | `/coupons`                  | Retrieve list of all coupons (Admin only)                                         |  🔒  |
| 34  | POST   | `/coupons`                  | Create a new discount coupon with advanced limits (Admin only)                    |  🔒  |
| 35  | POST   | `/coupons/apply`            | Apply coupon code to user cart and recalculate prices                             |  🔒  |
| 36  | DELETE | `/coupons/remove`           | Remove applied coupon from user cart                                              |  🔒  |
| 37  | PUT    | `/coupons/:couponId`        | Update coupon details, limits, validity dates, or status (Admin only)             |  🔒  |
| 38  | DELETE | `/coupons/:couponId`        | Delete unused coupon (Admin only)                                                 |  🔒  |
| 39  | GET    | `/reviews/:productId`       | Retrieve all reviews and ratings for a product with reviewer details              |  ❌  |
| 40  | POST   | `/reviews/:productId`       | Submit a new review or update existing review (recalculates product ratings)      |  🔒  |
| 41  | PUT    | `/reviews/:reviewId`        | Update review rating or text (Review Owner, Admin, or SuperAdmin)                 |  🔒  |
| 42  | DELETE | `/reviews/:reviewId`        | Delete a review permanently and recalculate product stats (Owner or Admin)        |  🔒  |

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Product Management Endpoints](#product-management-endpoints)
- [Cart Management Endpoints](#cart-management-endpoints)
- [Wishlist Management Endpoints](#wishlist-management-endpoints)
- [Order & Checkout Endpoints](#order--checkout-endpoints)
- [Admin Order Management Endpoints](#admin-order-management-endpoints)
- [Coupon Management Endpoints](#coupon-management-endpoints)
- [Review & Rating Endpoints](#review--rating-endpoints)
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
  "status": "success",
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
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Invalid email or password"
}
```

---

## User Management Endpoints

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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

---

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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

User does not exist.

```json
{
  "status": "fail",
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

| Field      | Type   | Required | Description                                                                  |
| :--------- | :----- | :------: | :--------------------------------------------------------------------------- |
| `fullName` | string |    ❌    | Updated full name.                                                           |
| `phone`    | string |    ❌    | Updated phone number.                                                        |
| `role`     | string |    ❌    | Updated role (`"User"`, `"Admin"`, or `"SuperAdmin"`). SuperAdmin only.      |

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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the owner nor an Admin.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "status": "fail",
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
  "status": "success",
  "message": "User deleted successfully",
  "data": null
}
```

##### Response 401

Unauthorized. No token provided or token invalid.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is not authorized.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

User does not exist.

```json
{
  "status": "fail",
  "message": "User not found"
}
```

---

## Product Management Endpoints

### GET /products

Retrieve the products catalog with full support for pagination, search, price filtering, category filtering, stock status, ratings, and discounts. No authentication required.

#### Query Parameters

| Parameter     | Type    | Required | Description                                                                                           |
| :------------ | :------ | :------: | :---------------------------------------------------------------------------------------------------- |
| `page`        | integer |    ❌    | Page number (Default: `1`).                                                                           |
| `limit`       | integer |    ❌    | Number of items per page (Default: `10`).                                                             |
| `search`      | string  |    ❌    | Search keyword matching title, description, category, price, or stock.                               |
| `category`    | string  |    ❌    | Filter by product category.                                                                           |
| `minPrice`    | number  |    ❌    | Minimum product price (`price >= minPrice`).                                                          |
| `maxPrice`    | number  |    ❌    | Maximum product price (`price <= maxPrice`).                                                          |
| `inStock`     | string  |    ❌    | Filter by availability: `"true"` for in stock (`> 0`), `"false"` for out of stock (`<= 0`).          |
| `minRating`   | number  |    ❌    | Minimum average rating (`ratingAverage >= minRating`).                                                |
| `maxRating`   | number  |    ❌    | Maximum average rating (`ratingAverage <= maxRating`).                                                |
| `hasDiscount` | string  |    ❌    | Filter by discount: `"true"` (has active discount), `"false"` (no discount).                         |

#### Responses

##### Response 200

Products retrieved successfully.

```json
{
  "status": "success",
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
  "status": "success",
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
  "status": "fail",
  "message": "No File Uploaded"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
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

| Field                | Type    | Required | Description                                                                                |
| :------------------- | :------ | :------: | :----------------------------------------------------------------------------------------- |
| `title`              | string  |    ❌    | Updated title (Min 4, Max 100).                                                            |
| `description`        | string  |    ❌    | Updated description (Min 10, Max 1000).                                                    |
| `price`              | number  |    ❌    | Updated original price.                                                                    |
| `priceAfterDiscount` | number  |    ❌    | Updated discounted price.                                                                  |
| `stock`              | number  |    ❌    | Updated stock count.                                                                       |
| `category`           | string  |    ❌    | Updated category.                                                                          |
| `existingImages`     | string  |    ❌    | JSON string of images to retain: `[{"url":"...","publicId":"..."}]`. Defaults to current. |
| `productImages`      | files[] |    ❌    | Optional new/replacement files to upload (up to 5 total images).                           |

#### Responses

##### Response 200

Product updated successfully.

```json
{
  "status": "success",
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
  "status": "fail",
  "message": "Validation error description"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. User is not the owner of this product or an Admin.

```json
{
  "status": "fail",
  "message": "You are not authorized to perform this action"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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
  "status": "success",
  "message": "Product deleted successfully",
  "data": null
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. User is not the owner of this product or an Admin.

```json
{
  "status": "fail",
  "message": "You are not authorized to perform this action"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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
  "status": "success",
  "message": "Product liked successfully",
  "data": {
    "_id": "6ac92261707ab25c5d1ed396",
    "title": "Casual Cotton Shirt",
    "likes": [
      "664fa1e2b5c7e1234567890a"
    ],
    "likesCount": 1
  }
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Cart is empty or not created yet.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Requested quantity exceeds available stock"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Requested quantity exceeds available stock"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Cart not found or product is not in the cart.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Cart not found or product is not in the cart.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Cart was not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
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

| Parameter   | Type   | Required | Description                     |
| :---------- | :----- | :------: | :------------------------------ |
| `productId` | string |    ✅    | The ID of the product to add.   |

#### Responses

##### Response 200

Added to wishlist successfully.

```json
{
  "status": "success",
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
  "status": "fail",
  "message": "Valid Product ID is required"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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

| Parameter   | Type   | Required | Description                       |
| :---------- | :----- | :------: | :-------------------------------- |
| `productId` | string |    ✅    | The ID of the product to remove.  |

#### Responses

##### Response 200

Removed from wishlist successfully.

```json
{
  "status": "success",
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
  "status": "fail",
  "message": "Valid Product ID is required"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Wishlist not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
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

| Field                        | Type   | Required | Description                                               |
| :--------------------------- | :----- | :------: | :-------------------------------------------------------- |
| `shippingAddress.address`    | string |    ✅    | Street address (Min 5 chars).                             |
| `shippingAddress.city`       | string |    ✅    | City name (Min 2 chars).                                  |
| `shippingAddress.state`      | string |    ✅    | State or governorate (Min 2 chars).                       |
| `shippingAddress.country`    | string |    ✅    | Country name (Min 2 chars).                               |
| `shippingAddress.postalCode` | string |    ✅    | Exactly 5 digits postal code (e.g. `11371`).              |
| `shippingAddress.phone`      | string |    ✅    | Phone number starting with `01` (11 digits).              |
| `paymentMethod`              | string |    ✅    | Payment method enum: `"Paymob"` or `"COD"`. |

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
  "status": "success",
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
  "status": "fail",
  "message": "Validation error description"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Cart is empty or not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Order was not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "This order is already paid"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
  "message": "Order not found"
}
```

##### Response 500

Failed to initialize Paymob session (e.g. invalid credentials or Paymob API error).

```json
{
  "status": "fail",
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
| `success`       | boolean\|string |    ❌    | `true` / `"true"` if Paymob reported payment success.           |
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
  "status": "success",
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
  "status": "fail",
  "message": "Payment verification failed or payment was not successful"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
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

| Field                        | Type   | Required | Description                                                  |
| :--------------------------- | :----- | :------: | :----------------------------------------------------------- |
| `shippingAddress.address`    | string |    ❌    | Updated street address.                                      |
| `shippingAddress.city`       | string |    ❌    | Updated city name.                                           |
| `shippingAddress.state`      | string |    ❌    | Updated state or governorate.                                |
| `shippingAddress.country`    | string |    ❌    | Updated country name.                                        |
| `shippingAddress.postalCode` | string |    ❌    | Updated 5-digit postal code.                                 |
| `shippingAddress.phone`      | string |    ❌    | Updated phone number (11 digits, starts with `01`).          |
| `paymentMethod`              | string |    ❌    | Updated payment method: `"Paymob"` or `"COD"`. |

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
  "status": "success",
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
  "status": "fail",
  "message": "You cannot update an order that is already being processed"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
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
  "status": "success",
  "message": "Order deleted successfully",
  "data": null
}
```

##### Response 400

Cannot delete an order that is no longer pending.

```json
{
  "status": "fail",
  "message": "You cannot cancel an order that is already being processed"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
  "message": "Order not found"
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

#### Responses

##### Response 200

Orders fetched successfully.

```json
{
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "status": "fail",
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

| Parameter | Type   | Required | Description                     |
| :-------- | :----- | :------: | :------------------------------ |
| `orderId` | string |    ✅    | The unique order ID to retrieve. |

#### Responses

##### Response 200

Order fetched successfully.

```json
{
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
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

| Parameter | Type   | Required | Description                   |
| :-------- | :----- | :------: | :---------------------------- |
| `orderId` | string |    ✅    | The unique order ID to update. |

#### Request Body

| Field         | Type    | Required | Description                                                                        |
| :------------ | :------ | :------: | :--------------------------------------------------------------------------------- |
| `orderStatus` | string  |    ✅    | Target status enum: `"Pending"`, `"Processing"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`. |
| `isPaid`      | boolean |    ❌    | Optional manual payment confirmation flag.                                          |

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
  "status": "success",
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
  "status": "fail",
  "message": "Invalid order status. Allowed values: Pending, Processing, Shipped, Delivered, Cancelled"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Caller is not an Admin or SuperAdmin.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

Order not found.

```json
{
  "status": "fail",
  "message": "Order not found"
}
```

---

## Coupon Management Endpoints

### GET /coupons

Retrieve list of all created coupons. **Admin or SuperAdmin only.** Sorted by creation date descending.

#### Request Headers

| Header          | Value                           |
| :-------------- | :------------------------------ |
| `Authorization` | `Bearer <your_admin_jwt_token>` |

#### Responses

##### Response 200

Coupons fetched successfully.

```json
{
  "status": "success",
  "message": "Coupons fetched successfully",
  "data": [
    {
      "_id": "673f8e4b1a2b3c4d5e6f7a8b",
      "couponCode": "SUMMER20",
      "discountType": "percentage",
      "discountValue": 20,
      "usageLimit": 50,
      "usageLimitPerUser": 1,
      "minOrderValue": 200,
      "applicableCategories": ["electronics", "watches"],
      "maxUsersLimit": 30,
      "usedCount": 4,
      "usedBy": [
        { "user": "664fa1e2b5c7e1234567890b", "count": 1 }
      ],
      "isActive": true,
      "startDate": "2026-06-01T00:00:00.000Z",
      "expireDate": "2026-08-31T23:59:59.000Z",
      "createdAt": "2026-05-30T10:00:00.000Z",
      "updatedAt": "2026-06-02T12:00:00.000Z"
    }
  ]
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Requester does not have Admin or SuperAdmin role.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

---

### POST /coupons

Create a new discount coupon. **Admin or SuperAdmin only.**

#### Request Headers

| Header          | Value                           |
| :-------------- | :------------------------------ |
| `Authorization` | `Bearer <your_admin_jwt_token>` |
| `Content-Type`  | `application/json`              |

#### Request Body

| Field                   | Type     | Required | Description                                                                                   |
| :---------------------- | :------- | :------: | :-------------------------------------------------------------------------------------------- |
| `couponCode`            | string   |    ✅    | Unique coupon identifier code (case-insensitive, auto-uppercased).                            |
| `discountType`          | string   |    ✅    | Either `"percentage"` or `"fixed"`.                                                           |
| `discountValue`         | number   |    ✅    | Value of discount (1–100 for percentage, > 0 for fixed amount in EGP).                       |
| `usageLimit`            | number   |    ❌    | Maximum total number of times the coupon can be redeemed globally (Default: `10`).            |
| `usageLimitPerUser`     | number   |    ❌    | Maximum times a **single user** can redeem this coupon (Default: `1`).                        |
| `minOrderValue`         | number   |    ❌    | Minimum cart total (EGP) required to apply the coupon (Default: `0` = no minimum).            |
| `applicableCategories`  | string[] |    ❌    | Array of category strings the coupon is restricted to. Empty = applies to all categories.     |
| `maxUsersLimit`         | number   |    ❌    | Maximum number of **unique users** who can ever use this coupon. `null` = unlimited.          |
| `startDate`             | string   |    ✅    | ISO date string indicating when coupon validity begins.                                       |
| `expireDate`            | string   |    ✅    | ISO date string indicating when coupon expires (must be after `startDate`).                   |
| `isActive`              | boolean  |    ❌    | Whether the coupon is immediately active (Default: `true`).                                   |

```json
{
  "couponCode": "WATCH20",
  "discountType": "percentage",
  "discountValue": 20,
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "minOrderValue": 500,
  "applicableCategories": ["watches", "accessories"],
  "maxUsersLimit": 50,
  "startDate": "2026-10-01",
  "expireDate": "2026-12-31",
  "isActive": true
}
```

#### Responses

##### Response 201

Coupon created successfully.

```json
{
  "status": "success",
  "message": "Coupon created successfully",
  "data": {
    "_id": "673f8e4b1a2b3c4d5e6f7a8b",
    "couponCode": "WATCH20",
    "discountType": "percentage",
    "discountValue": 20,
    "usageLimit": 100,
    "usageLimitPerUser": 1,
    "minOrderValue": 500,
    "applicableCategories": ["watches", "accessories"],
    "maxUsersLimit": 50,
    "usedCount": 0,
    "usedBy": [],
    "isActive": true,
    "startDate": "2026-10-01T00:00:00.000Z",
    "expireDate": "2026-12-31T00:00:00.000Z",
    "createdAt": "2026-10-12T15:00:00.000Z",
    "updatedAt": "2026-10-12T15:00:00.000Z"
  }
}
```

##### Response 400

Validation error (e.g. duplicate code, percentage > 100, or `startDate` after `expireDate`).

```json
{
  "status": "fail",
  "message": "Coupon code already exists"
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Requester does not have Admin or SuperAdmin role.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

---

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
  "status": "success",
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

| Condition | Message |
| :-------- | :------ |
| Coupon inactive | `"Coupon is not active"` |
| Outside validity dates | `"Coupon has expired"` |
| Global usage limit reached | `"Coupon usage limit exceeded"` |
| User already used coupon `usageLimitPerUser` times | `"You have already used this coupon"` |
| Cart total < `minOrderValue` | `"Minimum order value required is {n}"` |
| Max unique users limit reached | `"Coupon has reached its maximum user limit"` |
| No cart items match `applicableCategories` | `"Coupon not applicable to your cart items"` |

```json
{
  "status": "fail",
  "message": "Minimum order value required is 500"
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Coupon code does not exist or user cart is empty.

```json
{
  "status": "fail",
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
  "status": "success",
  "message": "Coupon removed successfully",
  "data": null
}
```

##### Response 401

Unauthorized. Missing or invalid token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

User cart is empty or not found.

```json
{
  "status": "fail",
  "message": "Cart is empty"
}
```

---

### PUT /coupons/:couponId

Update details, dates, or active status of an existing coupon. **Admin or SuperAdmin only.**

#### Request Headers

| Header          | Value                           |
| :-------------- | :------------------------------ |
| `Authorization` | `Bearer <your_admin_jwt_token>` |
| `Content-Type`  | `application/json`              |

#### Path Parameters

| Parameter  | Type   | Required | Description      |
| :--------- | :----- | :------: | :--------------- |
| `couponId` | string |    ✅    | The coupon's ID. |

#### Request Body

All fields are optional — only send the fields you want to update.

| Field                  | Type     | Required | Description                                                                          |
| :--------------------- | :------- | :------: | :----------------------------------------------------------------------------------- |
| `couponCode`           | string   |    ❌    | New unique coupon code (auto-uppercased).                                            |
| `discountType`         | string   |    ❌    | Either `"percentage"` or `"fixed"`.                                                  |
| `discountValue`        | number   |    ❌    | New discount numeric value.                                                          |
| `usageLimit`           | number   |    ❌    | New maximum global usage limit.                                                      |
| `usageLimitPerUser`    | number   |    ❌    | New per-user usage cap.                                                              |
| `minOrderValue`        | number   |    ❌    | New minimum cart total required.                                                     |
| `applicableCategories` | string[] |    ❌    | New category restriction list. Send `[]` to remove restriction.                      |
| `maxUsersLimit`        | number\|null |    ❌ | New unique user cap. Send `null` to remove limit.                               |
| `startDate`            | string   |    ❌    | New validity start date (ISO).                                                       |
| `expireDate`           | string   |    ❌    | New validity expiration date (ISO).                                                  |
| `isActive`             | boolean  |    ❌    | Activate or deactivate coupon.                                                       |

```json
{
  "isActive": false,
  "minOrderValue": 1000,
  "applicableCategories": ["watches"]
}
```

#### Responses

##### Response 200

Coupon updated successfully.

```json
{
  "status": "success",
  "message": "Coupon updated successfully",
  "data": {
    "_id": "673f8e4b1a2b3c4d5e6f7a8b",
    "couponCode": "WATCH20",
    "discountType": "percentage",
    "discountValue": 20,
    "usageLimit": 100,
    "usageLimitPerUser": 1,
    "minOrderValue": 1000,
    "applicableCategories": ["watches"],
    "maxUsersLimit": 50,
    "usedCount": 4,
    "isActive": false,
    "startDate": "2026-10-01T00:00:00.000Z",
    "expireDate": "2026-12-31T00:00:00.000Z",
    "updatedAt": "2026-10-12T16:30:00.000Z"
  }
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Requester does not have Admin or SuperAdmin role.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

Coupon with specified ID does not exist.

```json
{
  "status": "fail",
  "message": "Coupon not found"
}
```

---

### DELETE /coupons/:couponId

Delete an unused coupon by ID. **Admin or SuperAdmin only.** Coupons that have already been redeemed by customers cannot be deleted to maintain order history integrity.

#### Request Headers

| Header          | Value                           |
| :-------------- | :------------------------------ |
| `Authorization` | `Bearer <your_admin_jwt_token>` |

#### Path Parameters

| Parameter  | Type   | Required | Description      |
| :--------- | :----- | :------: | :--------------- |
| `couponId` | string |    ✅    | The coupon's ID. |

#### Responses

##### Response 200

Coupon deleted successfully.

```json
{
  "status": "success",
  "message": "Coupon deleted successfully",
  "data": null
}
```

##### Response 400

Coupon cannot be deleted as it has already been redeemed (`usedCount > 0`).

```json
{
  "status": "fail",
  "message": "Cannot delete a coupon that has already been used"
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Requester does not have Admin or SuperAdmin role.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

##### Response 404

Coupon with specified ID does not exist.

```json
{
  "status": "fail",
  "message": "Coupon not found"
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
  "status": "success",
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
  "status": "fail",
  "message": "Product ID is required"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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

| Field        | Type   | Required | Description                                                  |
| :----------- | :----- | :------: | :----------------------------------------------------------- |
| `ratings`    | number |    ✅    | Numerical rating from `1` to `5` (inclusive).               |
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
  "status": "success",
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
  "status": "success",
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
  "status": "fail",
  "message": "Rating must be at least 1"
}
```

##### Response 401

Missing or invalid bearer token.

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 404

Product not found.

```json
{
  "status": "fail",
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

| Field        | Type   | Required | Description                                                  |
| :----------- | :----- | :------: | :----------------------------------------------------------- |
| `ratings`    | number |    ❌    | Updated numerical rating from `1` to `5`.                    |
| `reviewText` | string |    ❌    | Updated customer review text (Min 1, Max 500 characters).    |

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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. The requester is neither the review author nor an Admin.

```json
{
  "status": "fail",
  "message": "Not authorized to update this review"
}
```

##### Response 404

Review not found.

```json
{
  "status": "fail",
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
  "status": "success",
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
  "status": "fail",
  "message": "Unauthorized"
}
```

##### Response 403

Forbidden. Requester is not the review author or an Admin.

```json
{
  "status": "fail",
  "message": "Not authorized to delete this review"
}
```

##### Response 404

Review not found.

```json
{
  "status": "fail",
  "message": "Review Not Found"
}
```

---

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
