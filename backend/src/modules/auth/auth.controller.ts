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
import { redis } from "../../config/redis.js";
import crypto from "node:crypto";

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
      userId = decoded.userId;
    } catch {
      sendError(res, 403, "Invalid Refresh Token");
      return;
    }
  }
  const storedRefreshToken = await redis.get(`refresh_token:${userId}`);
  if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
    sendError(res, 403, "Invalid Refresh Token");
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    sendError(res, 403, "User was not found or banned");
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
  await redis.setEx(`otp:${req.body.email}`, 600, generatedOtp);

  const newUser = new User({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    provider: "local",
    isVerified: false,
  });

  const finalUser = await newUser.save();

  await sendEmail(
    finalUser.email,
    "Verify Your Email - Nexoo",
    generateVerifyOtpEmailHtml(finalUser.username, generatedOtp),
  );

  await finalUser.save();

  const { password, ...others } = finalUser.toObject();

  successMsg(res, 201, "User registered successfully", {
    ...others,
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

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setEx(`otp:${req.body.email}`, 600, generatedOtp);
    await user.save();
    await sendEmail(
      user.email,
      "Verify Your Email - Nexoo",
      generateVerifyOtpEmailHtml(user.username, generatedOtp),
    );

    successMsg(res, 200, "Check your email for verification.", null);
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
    const cachedOtp = await redis.get(`otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp) {
      sendError(res, 400, "Invalid or expired OTP");
      return;
    }

    const user = await User.findOne({ email }).select("+otp +otpExpired");
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }
    user.isVerified = true;
    await user.save();

    await redis.del(`otp:${email}`);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await redis.setEx(`refresh_token:${user.id}`, 604800, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password, ...others } = user.toObject();
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
    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    if (user.isVerified) {
      sendError(res, 400, "Account is already verified");
      return;
    }

    const cooldownKey = `resend_cooldown:${email}`;
    const existingCooldown = await redis.get(cooldownKey);
    if (existingCooldown) {
      sendError(
        res,
        429,
        "Please wait a minute before requesting another OTP.",
      );
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setEx(`otp:${email}`, 600, generatedOtp);
    await redis.setEx(cooldownKey, 60, "locked");

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

  const cooldownKey = `forgot_cooldown:${user.email}`;
  const existingCooldown = await redis.get(cooldownKey);
  if (existingCooldown) {
    sendError(
      res,
      429,
      "Please wait a minute before requesting another reset link.",
    );
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  await redis.setEx(`reset_token:${resetToken}`, 600, user.id.toString());

  await redis.setEx(cooldownKey, 60, "locked");

  const FRONTENDUrl = `${process.env.FRONTEND_URL}`;
  const link = `${FRONTENDUrl}/auth/reset-password?token=${resetToken}&email=${user.email}`;

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

  try {
    const userId = await redis.get(`refresh_token:${token}`);
    if (!userId) {
      sendError(res, 400, "Invalid or expired reset token");
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "user not found");
      return;
    }

    const genSalt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, genSalt);

    await redis.del(`refresh_token:${user.id}`);
    await redis.del(`reset_token:${token}`);

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
    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY!,
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    } catch (err) {
      console.log(
        "Token verification failed during logout, clearing cookie anyway.",
      );
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
  });

  successMsg(res, 200, "User logged out successfully", null);
});

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
};
