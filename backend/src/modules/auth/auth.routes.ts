import express from "express";
import passport from "passport";
import {
  handleRefreshToken,
  login,
  register,
  getAuthMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authLimiter } from "../../config/limiter.js";

const router = express.Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.route("/me").get(verifyToken, getAuthMe);
router.route("/refresh").get(handleRefreshToken).post(handleRefreshToken);
router.route("/logout").post(logout).get(logout);

// Google OAuth
router.get("/google", (req, res, next) => {
  const isPopup = req.query.popup === "true";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: isPopup ? "popup" : "redirect",
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    const isPopup = req.query.state === "popup";
    const failureUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?error=google_failed${isPopup ? "&popup=true" : ""}`;

    passport.authenticate("google", {
      session: false,
      failureRedirect: failureUrl,
    })(req, res, next);
  },
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user as any;
      const isPopup = req.query.state === "popup";
      const popupParam = isPopup ? "&popup=true" : "";

      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?error=user_not_found${popupParam}`,
        );
        return;
      }
      const token = user.generateAccessToken
        ? user.generateAccessToken()
        : user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production" ||
          process.env.ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}&provider=google${popupParam}`,
      );
    } catch (err) {
      const isPopup = req.query.state === "popup";
      const popupParam = isPopup ? "&popup=true" : "";
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?error=auth_failed${popupParam}`,
      );
    }
  },
);

export default router;
