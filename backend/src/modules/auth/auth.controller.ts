import { Request, Response } from "express";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { sendError, successMsg } from "../../middlewares/errors.js";
import {
  User,
  IUser,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyOtp,
  validateResendOtp,
} from "../Users/user.model.js";
import {
  sendEmail,
  generateResetPasswordEmailHtml,
  generateVerifyOtpEmailHtml,
} from "../../config/Email.js";
import { resolveOAuthFrontendUrl } from "../../config/passport.js";

// HANDLE REFRESH TOKEN
const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    sendError(res, 400, "no token provided");
    return;
  }

  let userId = req.user?.id;
  if (!userId) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY as string,
      ) as { id?: string; userId?: string };
      userId = decoded.id || decoded.userId;
    } catch {
      sendError(res, 403, "Invalid Refresh Token");
      return;
    }
  }

  const user = await User.findById(userId).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    sendError(res, 403, "Invalid Refresh Token");
    return;
  }

  const newAccessToken = user.generateAccessToken();
  successMsg(res, 200, "New Access Token Generated", newAccessToken);
});

// REGISTER
const register = asyncHandler(async (req: Request, res: Response) => {
  const { error, success } = validateRegister(req.body);
  if (!success) {
    sendError(res, 400, error?.issues[0]?.message || "Something went wrong");
    return;
  }

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    sendError(res, 400, "User is already exist");
    return;
  }
  const genSalt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, genSalt);

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpired = new Date(Date.now() + 10 * 60 * 1000);

  const newUser = new User({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    provider: "local",
    isVerified: false,
    otp: generatedOtp,
    otpExpired,
  });

  const finalUser = await newUser.save();
  const accessToken = finalUser.generateAccessToken();
  const refreshToken = finalUser.generateRefreshToken();

  await sendEmail(
    finalUser.email,
    "Verify Your Email - Nexoo",
    generateVerifyOtpEmailHtml(finalUser.username, generatedOtp),
  );

  finalUser.refreshToken = refreshToken;
  await finalUser.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const {
    password,
    otp: _otp,
    otpExpired: _otpExp,
    ...others
  } = finalUser.toObject();

  successMsg(res, 201, "User registered successfully", {
    ...others,
    accessToken,
  });
});

// LOGIN
const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { error, success } = validateLogin(req.body);
    if (!success) {
      sendError(res, 400, error?.issues[0]?.message || "Something went wrong");
      return;
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      sendError(res, 400, "User is not exist");
      return;
    }

    if (user.provider !== "local") {
      sendError(
        res,
        400,
        "User registered with Google. Please login with Google.",
      );
      return;
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!isPasswordMatch) {
      sendError(res, 400, "Invalid email or password");
      return;
    }

    if (user.isBanned) {
      if (user.banExpires && user.banExpires < new Date()) {
        user.isBanned = false;
        user.banExpires = undefined;
        await user.save();
      } else {
        const banExpiryMsg = user.banExpires
          ? ` until ${new Date(user.banExpires).toLocaleDateString()}`
          : "";
        sendError(res, 403, `Your account has been banned${banExpiryMsg}`);
        return;
      }
    }

    const generatedOtp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = generatedOtp;
    user.otpExpired = otpExpired;

    await user.save();
    await sendEmail(
      user.email,
      "Verify Your Email - Nexoo",
      generateVerifyOtpEmailHtml(user.username, generatedOtp),
    );

    sendError(res, 400, "Please verify your email first");
    return;
  },
);

// VERIFY OTP
const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateVerifyOtp(req.body);
    if (!success) {
      sendError(res, 400, error?.issues[0]?.message || "Something went wrong");
      return;
    }
    const { otp, email } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpired");
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }
    if (user.otp !== otp || !user.otpExpired || user.otpExpired < new Date()) {
      sendError(res, 400, "Invalid or expired OTP");
      return;
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpired = undefined;

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, otp: _, otpExpired: __, ...others } = user.toObject();
    successMsg(res, 200, "OTP verified successfully", {
      ...others,
      accessToken,
    });
  },
);

// RESEND OTP
const resendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateResendOtp(req.body);
    if (!success) {
      sendError(res, 400, error?.issues[0]?.message || "Something went wrong");
      return;
    }

    const email = req.body.email;
    const user = await User.findOne({ email }).select("+otp +otpExpired");
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    if (user.isVerified) {
      sendError(res, 404, "Account is already verified");
      return;
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = generatedOtp;
    user.otpExpired = otpExpired;
    await user.save();
    await sendEmail(
      user.email,
      "Verify Your Email - Nexoo",
      generateVerifyOtpEmailHtml(user.username, generatedOtp),
    );
    successMsg(res, 200, "OTP sent successfully", null);
  },
);

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { success, error } = validateForgotPassword(req.body);
  if (!success) {
    sendError(res, 400, error?.issues[0]?.message || "Something went wrong");
    return;
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    sendError(res, 404, "User is not exist");
    return;
  }
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    sendError(res, 500, "Server configuration error");
    return;
  }

  const token = await jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "10m",
  });

  const FRONTENDUrl = `${process.env.FRONTEND_URL}`;
  const link = `${FRONTENDUrl}/auth/reset-password?token=${token}&email=${user.email}`;

  await sendEmail(
    user.email,
    "Reset Password Link - Nexoo",
    generateResetPasswordEmailHtml(user.username, link),
  );
  successMsg(
    res,
    200,
    "If an account with this email exists, a password reset link has been sent.",
    null,
  );
});

// RESET PASSWORD
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { success, error } = validateResetPassword(req.body);
  if (!success) {
    sendError(res, 400, error?.issues[0]?.message || "Invalid input data");
    return;
  }

  const { token, newPassword } = req.body;
  if (!token) {
    sendError(res, 400, "No token provided");
    return;
  }
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    sendError(res, 500, "server error");
    return;
  }
  try {
    const decoded = jwt.verify(token, secret) as {
      email: string;
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      sendError(res, 404, "user not found");
      return;
    }

    if (user.email !== decoded.email) {
      sendError(res, 400, "Invalid token");
      return;
    }

    const genSalt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, genSalt);

    user.refreshToken = undefined;
    await user.save();
    successMsg(res, 200, "Password reset successfully", null);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      sendError(res, 400, "Token expired");
      return;
    }
    if (err.name === "JsonWebTokenError") {
      sendError(res, 400, "Invalid token");
      return;
    }
    sendError(res, 500, "server error");
  }
});

// GET AUTH ME
const getAuthMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 400, "User not found");
      return;
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    successMsg(res, 200, "User fetched successfully", user);
  },
);

// LOGOUT
const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: 1 } },
    );
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
  });

  successMsg(res, 200, "User logged out successfully", null);
});

// GOOGLE AUTH CALLBACK
const googleAuthCallback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as IUser | undefined;
    const frontendUrl = resolveOAuthFrontendUrl(req.cookies?.google_oauth_frontend);
    const clearOAuthOriginCookie = () =>
      res.clearCookie("google_oauth_frontend", {
        httpOnly: true,
        secure: process.env.ENV === "production",
        sameSite: "lax",
        path: "/auth",
      });

    if (!user) {
      clearOAuthOriginCookie();
      res.redirect(`${frontendUrl}/auth/success?error=authentication_failed&popup=true`);
      return;
    }

    if (user.isBanned) {
      clearOAuthOriginCookie();
      res.redirect(`${frontendUrl}/auth/success?error=account_banned&popup=true`);
      return;
    }

    try {
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save();
      clearOAuthOriginCookie();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.ENV === "production",
        sameSite: process.env.ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(accessToken)}&popup=true`);
    } catch (error) {
      clearOAuthOriginCookie();
      const authError = error as NodeJS.ErrnoException;
      console.error("[Google OAuth] Token or session persistence failed", {
        name: authError.name,
        code: authError.code,
      });
      res.redirect(`${frontendUrl}/auth/success?error=google_oauth_failed&popup=true`);
    }
  },
);

export {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getAuthMe,
  handleRefreshToken,
  logout,
  googleAuthCallback,
};
