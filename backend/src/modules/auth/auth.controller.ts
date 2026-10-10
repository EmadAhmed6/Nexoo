import { Request, Response } from "express";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

import { sendError, successMsg } from "../../middlewares/errors.js";
import { User, validateLogin, validateRegister } from "../Users/user.model.js";

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
  const accessToken = finalUser.generateAccessToken();
  const { password, ...others } = finalUser.toObject();

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
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!isPasswordMatch) {
      sendError(res, 400, "Invalid email or password");
      return;
    }
    const accessToken = user.generateAccessToken();
    const { password, ...others } = user.toObject();
    successMsg(res, 200, "User logged in successfully", {
      ...others,
      accessToken,
    });
  },
);

const getAuthMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
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

export { register, login, getAuthMe };
