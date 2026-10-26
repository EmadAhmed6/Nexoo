import express from "express";
import passport from "passport";
import crypto from "node:crypto";
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
  googleAuthCallback,
} from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  isGoogleOAuthConfigured,
  resolveOAuthFrontendUrl,
} from "../../config/passport.js";
import { authLimiter } from "../../config/limiter.js";

const router = express.Router();
const cookieOptions = {
  httpOnly: true,
  secure: process.env.ENV === "production",
  sameSite: "lax" as const,
  path: "/auth",
};

const clearOAuthFrontendCookie = (res: express.Response) => {
  res.clearCookie("google_oauth_frontend", cookieOptions);
};
const clearOAuthCookies = (res: express.Response) => {
  clearOAuthFrontendCookie(res);
  res.clearCookie("google_oauth_state", cookieOptions);
};
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
  const frontendUrl = resolveOAuthFrontendUrl(req.query.origin);
  if (!isGoogleOAuthConfigured) {
    const popup = req.query.popup === "true" ? "&popup=true" : "";
    res.redirect(`${frontendUrl}/auth/success?error=google_oauth_not_configured${popup}`);
    return;
  }

  res.cookie("google_oauth_frontend", frontendUrl, {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  });
  const state = crypto.randomBytes(32).toString("hex");
  res.cookie("google_oauth_state", state, {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
    session: false,
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    const frontendUrl = resolveOAuthFrontendUrl(req.cookies?.google_oauth_frontend);
    if (!isGoogleOAuthConfigured) {
      clearOAuthCookies(res);
      res.redirect(`${frontendUrl}/auth/success?error=google_oauth_not_configured&popup=true`);
      return;
    }

    const expectedState = req.cookies?.google_oauth_state;
    const receivedState = req.query.state;
    const expectedStateBuffer = Buffer.from(
      typeof expectedState === "string" ? expectedState : "",
    );
    const receivedStateBuffer = Buffer.from(
      typeof receivedState === "string" ? receivedState : "",
    );
    const validState =
      expectedStateBuffer.length > 0 &&
      expectedStateBuffer.length === receivedStateBuffer.length &&
      crypto.timingSafeEqual(expectedStateBuffer, receivedStateBuffer);

    if (!validState) {
      clearOAuthCookies(res);
      console.error("[Google OAuth] Callback rejected: missing or invalid state");
      res.redirect(`${frontendUrl}/auth/success?error=google_oauth_failed&popup=true`);
      return;
    }

    passport.authenticate("google", { session: false }, (error, user) => {
      if (error || !user) {
        clearOAuthCookies(res);
        if (error) {
          console.error("[Google OAuth] Authentication failed", {
            name: error.name,
            code: (error as NodeJS.ErrnoException).code,
          });
        }
        res.redirect(`${frontendUrl}/auth/success?error=google_oauth_failed&popup=true`);
        return;
      }

      clearOAuthCookies(res);
      req.user = user;
      googleAuthCallback(req, res, next);
    })(req, res, next);
  },
);

export default router;
