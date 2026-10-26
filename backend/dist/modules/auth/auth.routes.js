import express from "express";
import passport from "passport";
import { handleRefreshToken, login, register, getAuthMe, logout, forgotPassword, resetPassword, verifyOtp, resendOtp, googleAuthCallback, } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.route("/me").get(verifyToken, getAuthMe);
router.route("/refresh").get(handleRefreshToken).post(handleRefreshToken);
router.route("/logout").post(logout).get(logout);
// Google OAuth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=google_oauth_failed`,
}), googleAuthCallback);
export default router;
//# sourceMappingURL=auth.routes.js.map