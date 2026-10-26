import "dotenv/config";
import express, { Express } from "express";
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
import notifications from "./modules/Notification/notification.routes.js";
import tickets from "./modules/Ticket/ticket.routes.js";
import connectToDB from "./config/config.js";
import { errorHandler, notFound } from "./middlewares/errors.js";
import swaggerui from "swagger-ui-express";
import adminOrders from "./modules/admin/order/adminOrder.routes.js";
import adminTickets from "./modules/admin/ticket/ticket.routes.js";
import adminBanners from "./modules/admin/banner/adminBanner.routes.js";
import adminCoupons from "./modules/admin/coupons/adminCoupons.routes.js";
import adminUsers from "./modules/admin/users/adminUsers.routes.js";
import banners from "./modules/Banner/banner.routes.js";
import spacs from "./config/swagger.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";
import { apiLimiter } from "./config/limiter.js";
connectToDB();
const app: Express = express();
const PORT = process.env.PORT || 5000;
const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isInteger(trustedProxyHops) && trustedProxyHops > 0) {
  app.set("trust proxy", trustedProxyHops);
}

// GLOBAL MIDDLEWARES
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(apiLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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
app.use("/notifications", notifications);
app.use("/tickets", tickets);
app.use("/banners", banners);

// ADMIN ROUTES
app.use("/admin/orders", adminOrders);
app.use("/admin/tickets", adminTickets);
app.use("/admin/banners", adminBanners);
app.use("/admin/coupons", adminCoupons);
app.use("/admin/users", adminUsers);

// ERROR HANDLING MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log("Server is running on port", PORT));
