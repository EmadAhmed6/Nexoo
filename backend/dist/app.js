import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import auth from "./modules/Auth/auth.routes.js";
import users from "./modules/Users/user.routes.js";
import products from "./modules/Product/product.routes.js";
import reviews from "./modules/Product/Review/review.routes.js";
import cart from "./modules/Cart/cart.routes.js";
import orders from "./modules/Order/order.routes.js";
import coupons from "./modules/Coupon/coupon.routes.js";
import wishlist from "./modules/Wishlist/wishlist.routes.js";
import connectToDB from "./config/config.js";
import { errorHandler, notFound } from "./middlewares/errors.js";
import swaggerui from "swagger-ui-express";
import adminOrders from "./modules/admin/order/adminOrder.routes.js";
import spacs from "./config/swagger.js";
dotenv.config();
// sFASFSAF
connectToDB();
const app = express();
const PORT = process.env.PORT || 5000;
// GLOBAL MIDDLEWARES
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
// ROUTES
app.use("/api-docs", swaggerui.serve, swaggerui.setup(spacs));
app.use("/auth", auth);
app.use("/users", users);
app.use("/products", products);
app.use("/reviews", reviews);
app.use("/cart", cart);
app.use("/wishlist", wishlist);
app.use("/orders", orders);
app.use("/coupons", coupons);
// ADMIN ROUTES
app.use("/admin/orders", adminOrders);
// ERROR HANDLING MIDDLEWARES
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => console.log("Server is running on port", PORT));
//# sourceMappingURL=app.js.map