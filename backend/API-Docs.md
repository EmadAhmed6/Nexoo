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

| #   | Method | Endpoint               | Description                                                                     | Auth |
| :-- | :----- | :--------------------- | :------------------------------------------------------------------------------ | :--: |
| 1   | POST   | `/auth/register`       | Register a new user account and obtain access token                             |  ❌  |
| 2   | POST   | `/auth/login`          | Authenticate existing user with email & password and retrieve access token      |  ❌  |
| 3   | GET    | `/users`               | Retrieve list of all registered users (passwords excluded)                      |  🔒  |
| 4   | GET    | `/users/:userId`       | Retrieve single user profile by ID                                              |  🔒  |
| 5   | PUT    | `/users/:userId`       | Update user profile details (Owner, Admin, or SuperAdmin)                       |  🔒  |
| 6   | DELETE | `/users/:userId`       | Delete user account permanently (Owner, Admin, or SuperAdmin)                   |  🔒  |
| 7   | GET    | `/products`            | Retrieve products with filters (search, price range, stock, rating, discount)  |  ❌  |
| 8   | POST   | `/products`            | Create a new product with multiple image uploads to Cloudinary (up to 5 files)  |  🔒  |
| 9   | GET    | `/products/:productId` | Retrieve single product details by ID                                           |  ❌  |
| 10  | PUT    | `/products/:productId` | Update existing product details and images (Owner or Admin)                     |  🔒  |
| 11  | DELETE | `/products/:productId` | Delete a product by ID (Owner or Admin)                                         |  🔒  |
| 12  | GET    | `/cart`                | Retrieve authenticated user's cart with populated product info                  |  🔒  |
| 13  | POST   | `/cart/:productId`     | Add product to user cart with quantity (defaults to 1)                          |  🔒  |
| 14  | PUT    | `/cart/:productId`     | Update item quantity in user cart                                               |  🔒  |
| 15  | DELETE | `/cart/:productId`     | Remove product from user cart                                                   |  🔒  |

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Product Management Endpoints](#product-management-endpoints)
- [Cart Management Endpoints](#cart-management-endpoints)
- [Common HTTP Status Codes](#common-http-status-codes)

---

## Authentication Endpoints

### POST /auth/register

Register a new user account on the platform.

#### Request Body

| Field      | Type   | Required | Description                                                                                  |
| :--------- | :----- | :------: | :------------------------------------------------------------------------------------------- |
| `fullName` | string |    ✅    | Full name of the user (Min length: 4, Max length: 100).                                      |
| `username` | string |    ✅    | Unique username (Min length: 3, Max length: 50, letters, digits, and underscores only).      |
| `email`    | string |    ✅    | Valid and unique email address.                                                              |
| `password` | string |    ✅    | Password (Min 6, Max 72 chars, must contain uppercase letter, lowercase letter, and digit). |
| `phone`    | string |    ✅    | Phone number (Must be exactly 11 digits).                                                   |

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

#### Request Body

| Field      | Type   | Required | Description                      |
| :--------- | :----- | :------: | :------------------------------- |
| `email`    | string |    ✅    | Registered email address.        |
| `password` | string |    ✅    | The user's account password.     |

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

#### Headers

| Header          | Type   | Required | Description                   |
| :-------------- | :----- | :------: | :---------------------------- |
| `Authorization` | string |    ✅    | Bearer token (`Bearer <JWT>`) |

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
      "role": "User"
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

#### Path Parameters

| Parameter | Type   | Required | Description       |
| :-------- | :----- | :------: | :---------------- |
| `userId`  | string |    ✅    | The user's ID.    |

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
    "role": "User"
  }
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

#### Path Parameters

| Parameter | Type   | Required | Description       |
| :-------- | :----- | :------: | :---------------- |
| `userId`  | string |    ✅    | The user's ID.    |

#### Request Body

| Field      | Type   | Required | Description              |
| :--------- | :----- | :------: | :----------------------- |
| `fullName` | string |    ❌    | Updated full name.       |
| `phone`    | string |    ❌    | Updated phone number.    |

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
    "email": "ahmed@example.com"
  }
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

---

### DELETE /users/:userId

Permanently delete a user account. Restricted to the account owner, an Admin, or a SuperAdmin.

#### Path Parameters

| Parameter | Type   | Required | Description       |
| :-------- | :----- | :------: | :---------------- |
| `userId`  | string |    ✅    | The user's ID.    |

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

##### Response 403

Forbidden. Requester is not authorized.

```json
{
  "status": "fail",
  "message": "Not Authorized"
}
```

---

## Product Management Endpoints

### GET /products

Retrieve products catalog with full support for pagination, search, price filtering, category filtering, stock status, ratings, and discounts. Requires authentication.

#### Query Parameters

| Parameter     | Type    | Required | Description                                                                                     |
| :------------ | :------ | :------: | :---------------------------------------------------------------------------------------------- |
| `page`        | integer |    ❌    | Page number (Default: `1`).                                                                     |
| `limit`       | integer |    ❌    | Number of items per page (Default: `10`).                                                       |
| `search`      | string  |    ❌    | Search keyword matching title, description, category, price, or stock.                         |
| `category`    | string  |    ❌    | Filter by product category.                                                                     |
| `minPrice`    | number  |    ❌    | Minimum product price (`price >= minPrice`).                                                    |
| `maxPrice`    | number  |    ❌    | Maximum product price (`price <= maxPrice`).                                                    |
| `inStock`     | string  |    ❌    | Filter by availability: `"true"` for products in stock (`> 0`), `"false"` for out of stock (`<= 0`). |
| `minRating`   | number  |    ❌    | Minimum average rating (`ratingAverage >= minRating`).                                          |
| `maxRating`   | number  |    ❌    | Maximum average rating (`ratingAverage <= maxRating`).                                          |
| `hasDiscount` | string  |    ❌    | Filter by discount presence: `"true"` (has active discount), `"false"` (no discount).          |

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

Create a new product with multiple image uploads to Cloudinary (up to 5 images). Requires authentication; the authenticated user is automatically saved as the product owner (`userId`).

#### Request Headers

- `Authorization: Bearer <your_jwt_token>`
- `Content-Type: multipart/form-data`

#### Form Data Fields

| Field                | Type    | Required | Description                                       |
| :------------------- | :------ | :------: | :------------------------------------------------ |
| `title`              | string  |    ✅    | Product title (Min length: 4, Max length: 100).   |
| `description`        | string  |    ✅    | Product description (Min 10, Max 1000 chars).      |
| `price`              | number  |    ✅    | Original price (Must be >= 0).                    |
| `priceAfterDiscount` | number  |    ❌    | Discounted price (Must be >= 0).                  |
| `stock`              | number  |    ❌    | Available stock quantity (Default: `0`).          |
| `category`           | string  |    ✅    | Product category (Min length: 3).                 |
| `productImages`      | files[] |    ✅    | Up to 5 image files to upload to Cloudinary.      |

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

Unauthorized - Missing or invalid token.

---

### GET /products/:productId

Retrieve single product details by ID. Requires authentication.

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

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
    "productImages": [ ... ],
    "ratingAverage": 4.5,
    "ratingQuantity": 12
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

- `Authorization: Bearer <your_jwt_token>`
- `Content-Type: multipart/form-data`

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

#### Form Data Fields

| Field                | Type    | Required | Description                                                                                 |
| :------------------- | :------ | :------: | :------------------------------------------------------------------------------------------ |
| `title`              | string  |    ❌    | Updated title (Min 4, Max 100).                                                             |
| `description`        | string  |    ❌    | Updated description (Min 10, Max 1000).                                                     |
| `price`              | number  |    ❌    | Updated original price.                                                                     |
| `priceAfterDiscount` | number  |    ❌    | Updated discounted price.                                                                   |
| `stock`              | number  |    ❌    | Updated stock count.                                                                        |
| `category`           | string  |    ❌    | Updated category.                                                                           |
| `existingImages`     | string  |    ❌    | JSON string of images to retain: `[{"url":"...","publicId":"..."}]`. Defaults to current. |
| `productImages`      | files[] |    ❌    | Optional new/replacement files to upload (up to 5 total images).                            |

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
    "productImages": [ ... ],
    "ratingAverage": 4.5,
    "ratingQuantity": 12,
    "updatedAt": "2026-10-10T02:00:00.000Z"
  }
}
```

##### Response 400

Validation error.

##### Response 401

Unauthorized - Missing or invalid token.

##### Response 403

Forbidden - User is not the owner of this product or an Admin.

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

- `Authorization: Bearer <your_jwt_token>`

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

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

Unauthorized - Missing or invalid token.

##### Response 403

Forbidden - User is not the owner of this product or an Admin.

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

## Cart Management Endpoints

---

### GET /cart

Retrieve the authenticated user's shopping cart. The items in the cart will have their product details (`title`, `price`, `priceAfterDiscount`, `productImages`) populated.

#### Request Headers

- `Authorization: Bearer <your_jwt_token>`

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

Unauthorized - Missing or invalid token.

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

Add a product to the user's shopping cart using `productId` as a path parameter. If the product is already in the cart, its quantity will be increased by `productQuantity`. Product prices and stock are validated from the database.

#### Request Headers

- `Authorization: Bearer <your_jwt_token>`

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

#### JSON Body Parameters

| Field             | Type   | Required | Description                              |
| :---------------- | :----- | :------: | :--------------------------------------- |
| `productQuantity` | number |    ❌    | Quantity to add (Min: 1, Defaults to 1). |

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
          "productImages": [ ... ]
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

Invalid Product ID format, invalid inputs, or requested quantity exceeds available stock.

```json
{
  "status": "fail",
  "message": "Requested quantity exceeds available stock"
}
```

##### Response 401

Unauthorized - Missing or invalid token.

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

- `Authorization: Bearer <your_jwt_token>`

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

#### JSON Body Parameters

| Field             | Type   | Required | Description                           |
| :---------------- | :----- | :------: | :------------------------------------ |
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
    "cartItems": [ ... ],
    "totalPrice": 600
  }
}
```

##### Response 400

Invalid inputs or requested quantity exceeds available stock.

##### Response 401

Unauthorized - Missing or invalid token.

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

- `Authorization: Bearer <your_jwt_token>`

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `productId` | string |    ✅    | The product ID.    |

#### Responses

##### Response 200

Product removed from cart successfully (or cart emptied).

```json
{
  "status": "success",
  "message": "Product removed from cart successfully",
  "data": {
    "_id": "664fa1e2b5c7e1234567890a",
    "cartItems": [ ... ],
    "totalPrice": 200
  }
}
```

##### Response 401

Unauthorized - Missing or invalid token.

##### Response 404

Cart not found or product is not in the cart.

---

## Common HTTP Status Codes

| Code  | Meaning               | Description                                                              |
| :---- | :-------------------- | :----------------------------------------------------------------------- |
| `200` | **OK**                | Request succeeded and data is returned.                                  |
| `201` | **Created**           | Resource created successfully (e.g. register, create product).            |
| `400` | **Bad Request**       | Request body or parameter validation failed or duplicate resource.       |
| `401` | **Unauthorized**      | Missing or invalid authentication token.                                 |
| `403` | **Forbidden**         | Authenticated, but requester is not authorized for the action.           |
| `404` | **Not Found**         | Requested resource ID does not exist.                                    |
| `500` | **Internal Error**    | Server error or unhandled exception.                                     |
