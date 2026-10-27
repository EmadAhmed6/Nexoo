import rateLimit from "express-rate-limit";
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/api-docs") ||
        req.path === "/orders/paymob/webhook",
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
export const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts, please try again after a minute.",
    },
});
//# sourceMappingURL=limiter.js.map